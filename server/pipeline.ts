import {mixSfx, pcmWav} from '../shared/sfx';
import {runFfmpeg} from './ffmpeg';
import {canvasLeaves} from '../shared/canvas';
import {digest,cachedScene,engineFingerprint,sceneRenderKey} from './render-cache';
import {renderProfile} from '../shared/polish';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
import {cpus} from 'node:os';
import {scriptSchema, previewTimeline, type Script, type Timeline} from '../shared/schema';
import {masterFrames} from '../shared/master';

export const root = process.cwd();
/** Silent timelines have no audio sources; rendering a full WAV pass for them is pure waste. */
export function needsAudioTrack(timeline: Pick<Timeline,'scenes'> & Partial<Pick<Timeline,'master'>>) {
  return Boolean(timeline.master && !timeline.master.sfxMuted && timeline.master.sfx?.some(event=>event.gain>0)) || timeline.scenes.some(scene => Boolean(scene.audioSrc) || Boolean(scene.narrationSegments?.some(segment => segment.audioSrc)));
}
/** Optional GPU-ish raster backend for Chromium (angle uses Metal on macOS). Encoding stays on CPU. */
export function chromiumOptions() {
  const gl = process.env.SHENYING_GL;
  return gl ? {gl: gl as 'angle' | 'egl' | 'swiftshader' | 'vulkan' | 'swangle' | 'angle-egl'} : undefined;
}
/** Frames are rendered by parallel headless Chromium tabs; encoding itself stays on CPU (libx264). */
export function renderConcurrency() {
  const raw = Number(process.env.SHENYING_CONCURRENCY);
  if (Number.isFinite(raw) && raw >= 1) return Math.min(16, Math.floor(raw));
  return Math.max(1, Math.min(8, cpus().length - 1));
}
export const hashScript = (script: Script) => createHash('sha256').update('sentence-timeline-v1:' + JSON.stringify(scriptSchema.parse(script))).digest('hex');
export async function saveJson(file: string, value: unknown) {
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(value, null, 2) + '\n');
  await fs.rename(temp, file);
}
export async function readScript() {return scriptSchema.parse(JSON.parse(await fs.readFile(path.join(root, 'script.json'), 'utf8')));}
export async function readTimeline(script: Script): Promise<Timeline | null> {
  try {const data = JSON.parse(await fs.readFile(path.join(root, 'timeline.json'), 'utf8')) as Timeline; return data.sourceHash === hashScript(script) ? data : null;} catch {return null;}
}
export async function prepare(script: Script, mode: 'tts' | 'silent', log: (s: string) => void) {
  let timeline: Timeline;
  if (mode === 'silent') {timeline = previewTimeline(script); log('生成静音预览时间轴（估算时长，不包含配音）');}
  else {
    const python = process.env.PYTHON || path.join(root, '.venv/bin/python');
    await new Promise<void>((resolve, reject) => {
      const child = spawn(python, ['scripts/generate-audio.py'], {cwd: root});
      child.stdout.on('data', chunk => log(String(chunk).trim()));
      child.stderr.on('data', chunk => log(String(chunk).trim()));
      child.on('error', reject);
      child.on('exit', code => code === 0 ? resolve() : reject(new Error(`TTS 失败（退出码 ${code}），请检查 Python 环境与网络`)));
    });
    timeline = JSON.parse(await fs.readFile(path.join(root, 'timeline.json'), 'utf8'));
  }
  timeline.sourceHash = hashScript(script);
  await saveJson(path.join(root, 'timeline.json'), timeline);
  return timeline;
}
export async function render(script: Script, log: (s: string) => void, progress: (n: number) => void, smoke = false, draft = false) {
  const timeline = await readTimeline(script);
  if (!timeline) throw new Error('剧本已变更或尚未准备时间轴，请先生成配音或静音时间轴');
  return renderTimeline(timeline,log,progress,smoke,draft);
}
export async function renderTimeline(timeline:Timeline, log:(s:string)=>void, progress:(n:number)=>void,smoke=false,draft=false) {
  if (timeline.mode === 'tts') for (const scene of timeline.scenes) {
    const sources = scene.narrationSegments ? scene.narrationSegments.map(s => s.audioSrc) : [scene.audioSrc];
    for (const src of sources) {
      if (!src || !/^audio\/[a-zA-Z0-9_-]+\.mp3$/.test(src)) throw new Error('无效音频路径');
      await fs.access(path.join(root, 'public', src));
    }
  }
  if (timeline.mode === 'tts' && timeline.master) {
    const total = masterFrames(timeline.master);
    for (const clip of timeline.masterNarration ?? []) {
      if (!/^audio\/[a-zA-Z0-9_-]+\.mp3$/.test(clip.audioSrc)) throw new Error('无效音频路径');
      if (clip.from < 0 || clip.from + clip.durationInFrames > total) throw new Error('配音超出画布时长');
      await fs.access(path.join(root, 'public', clip.audioSrc));
    }
  }
  for(const scene of timeline.scenes)if(scene.template==='CanvasSlide')for(const block of canvasLeaves(scene.props.blocks))if(block.type==='ImageBlock'){
    const src=block.props.src;if(!/^images\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(src))throw Error('图片路径非法');
    const file=path.join(root,'public',src),real=await fs.realpath(file),base=await fs.realpath(path.join(root,'public/images'));if(!real.startsWith(base+path.sep))throw Error('图片不能逃逸本地素材目录');
    const expected=path.basename(src).split('.')[0];const {createHash}=await import('node:crypto');if(createHash('sha256').update(await fs.readFile(real)).digest('hex')!==expected)throw Error('图片内容指纹不匹配，请重新导入素材');
  }
  log('正在打包 Remotion 项目…');
  const stage = Date.now();
  const lap = (name: string) => log(`${name}：${((Date.now() - stage) / 1000).toFixed(1)}s`);
  const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.tsx')});
  lap('打包完成');
  const inputProps = {scriptData: timeline};
  const composition = await selectComposition({serveUrl, id: 'FullArticleVideo', inputProps});
  const concurrency = renderConcurrency();
  const chrome = chromiumOptions();
  log(`并行渲染并发：${concurrency}（可用 CPU ${cpus().length}，可用 SHENYING_CONCURRENCY 覆盖）${chrome ? `；GL=${chrome.gl}` : ''}`);
  const dir = path.join(root, 'out'); await fs.mkdir(dir, {recursive: true});
  const name = smoke ? 'smoke.mp4' : draft ? `draft-${Date.now()}.mp4` : `video-${Date.now()}.mp4`;
  const profile = renderProfile(draft || smoke);
  log(`开始${draft ? '草稿' : smoke ? '冒烟' : '正式'}渲染，${composition.width*profile.scale}×${composition.height*profile.scale} / ${timeline.fps}fps`);
  if (timeline.master) {
    // Global visual canvas plus sample-accurate deterministic synthesis; never replace SFX with silence.
    const output = path.join(dir, name), temporary = output + '.tmp.mp4', audio = output + '.tmp.wav';
    log('单根全局画布：整片一次渲染（无分幕缓存）…');
    try {
      await renderMedia({composition, serveUrl, inputProps, codec: 'h264', pixelFormat: 'yuv420p', crf: profile.crf, x264Preset: profile.preset, outputLocation: temporary, muted:true, concurrency, ...(chrome ? {chromiumOptions: chrome} : {}), scale: profile.scale, onProgress: ({progress: value}) => progress(value * 0.9)});
      lap('画面渲染完成');
      // sfxMuted keeps cue frames for later but contributes no samples; narration (if any) is unaffected.
      const events = timeline.master.sfxMuted ? [] : timeline.master.sfx ?? [];
      if (timeline.masterNarration?.length) {
        // Narration MP3s plus SFX are both <Audio> in MasterCanvas; one WAV pass keeps them on the same frame clock.
        await renderMedia({composition, serveUrl, inputProps, codec: 'wav', outputLocation: audio, concurrency, enforceAudioTrack: true});
        log(`混合配音轨：${timeline.masterNarration.length}段配音 + ${events.length}个音效，按段起始绝对帧对齐`);
      } else {
        await fs.writeFile(audio, pcmWav(mixSfx(events, timeline.totalFrames, timeline.fps)));
        log(`合成音效轨：${events.length}个触发点，绝对帧/48kHz采样对齐，无外部素材`);
      }
      await runFfmpeg(['-hide_banner','-loglevel','error','-i',temporary,'-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-ar','48000','-shortest',temporary+'.mux.mp4']);
      await fs.rename(temporary + '.mux.mp4', output);
      progress(1);
    } finally { await fs.rm(audio,{force:true}); await fs.rm(temporary,{force:true}); await fs.rm(temporary+'.mux.mp4',{force:true}); }
    log(`渲染完成：out/${name}`);
    return `/out/${name}`;
  }
  if(!smoke) {
    // Check the extra local dependency before spending time rendering scenes.
    await runFfmpeg(['-version']);
    const cache=path.join(dir,'scene-cache');await fs.mkdir(cache,{recursive:true});
    const engine=digest({source:await engineFingerprint(root),format:timeline.format,theme:timeline.theme,chapters:timeline.theme?.chapters?timeline.scenes.length:undefined}), videos:string[]=[];
    let offset=0;
    for(const [index,scene] of timeline.scenes.entries()) {
      const file=path.join(cache,sceneRenderKey(scene,index,timeline.fps,profile,engine)+'.mp4');
      const from=offset;offset+=scene.durationInFrames;
      const reused=await cachedScene(file,temporary=>renderMedia({composition,serveUrl,inputProps,codec:'h264',pixelFormat:'yuv420p',crf:profile.crf,x264Preset:profile.preset,scale:profile.scale,outputLocation:temporary,concurrency,muted:true,frameRange:[from,offset-1],...(chrome?{chromiumOptions:chrome}:{}),onProgress:({progress:value})=>progress((index+value)/timeline.scenes.length*.85)}).then(()=>{}));
      videos.push(file);log(`${reused?'复用缓存':'渲染更新'}：分镜${index+1} ${scene.id}`);progress((index+1)/timeline.scenes.length*.85);
    }
    lap('分镜渲染完成');
    // Keep narration continuous across variable-length scene boundaries: render a single PCM track.
    // Silent timelines carry no audio sources, so synthesise silence instead of a full extra render pass.
    const audio=path.join(dir,`audio-${Date.now()}.tmp.mp4`), output=path.join(dir,name), temporary=output+'.tmp.mp4';
    const withAudio=needsAudioTrack(timeline);
    try {
      const list=output+'.tmp.txt';
      if(withAudio){log('合成连续音轨与缓存分镜（不是任意帧级局部替换）…');await renderMedia({composition,serveUrl,inputProps,codec:'wav',outputLocation:audio,concurrency,enforceAudioTrack:true});}
      else {log('静音时间轴：跳过整片音轨渲染，直接补静音轨…');await runFfmpeg(['-hide_banner','-loglevel','error','-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t',String(timeline.totalFrames/timeline.fps),'-c:a','aac','-ar','48000','-y',audio]);}
      lap(withAudio?'音轨渲染完成':'静音轨生成完成');
      try {
        await fs.writeFile(list,videos.map(file=>`file '${file.replace(/'/g,"'\\''")}'`).join('\n'));
        await runFfmpeg(['-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',list,'-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-ar','48000','-t',String(timeline.totalFrames/timeline.fps),'-y',temporary]);
      } finally {await fs.rm(list,{force:true});}
      lap('分镜合片完成');
      progress(1);
      await fs.rename(temporary,output);
    } finally {await fs.rm(audio,{force:true});await fs.rm(temporary,{force:true});}
  } else await renderMedia({composition, serveUrl, inputProps, codec: 'h264', pixelFormat: 'yuv420p', crf: profile.crf, x264Preset: profile.preset, outputLocation: path.join(dir, name), concurrency,
    ...(smoke ? {frameRange: [0, 14] as [number, number]} : {}), scale: profile.scale,
    onProgress: ({progress: value}) => progress(value)});
  log(`渲染完成：out/${name}`);
  return `/out/${name}`;
}
