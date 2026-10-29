import {renderProfile} from '../shared/polish';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
import {scriptSchema, previewTimeline, type Script, type Timeline} from '../shared/schema';

export const root = process.cwd();
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
  if (timeline.mode === 'tts') for (const scene of timeline.scenes) {
    const sources = scene.narrationSegments ? scene.narrationSegments.map(s => s.audioSrc) : [scene.audioSrc];
    for (const src of sources) {
      if (!src || !/^audio\/[a-zA-Z0-9_-]+\.mp3$/.test(src)) throw new Error('无效音频路径');
      await fs.access(path.join(root, 'public', src));
    }
  }
  log('正在打包 Remotion 项目…');
  const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.tsx')});
  const inputProps = {scriptData: timeline};
  const composition = await selectComposition({serveUrl, id: 'FullArticleVideo', inputProps});
  const dir = path.join(root, 'out'); await fs.mkdir(dir, {recursive: true});
  const name = smoke ? 'smoke.mp4' : draft ? `draft-${Date.now()}.mp4` : `video-${Date.now()}.mp4`;
  const profile = renderProfile(draft || smoke);
  log(`开始${draft ? '草稿' : smoke ? '冒烟' : '正式'}渲染，${draft ? '960×540 / 30fps' : '1920×1080 / 30fps'}`);
  await renderMedia({composition, serveUrl, inputProps, codec: 'h264', pixelFormat: 'yuv420p', crf: profile.crf, outputLocation: path.join(dir, name), concurrency: 2,
    ...(smoke ? {frameRange: [0, 14] as [number, number]} : {}), scale: profile.scale,
    onProgress: ({progress: value}) => progress(value)});
  log(`渲染完成：out/${name}`);
  return `/out/${name}`;
}
