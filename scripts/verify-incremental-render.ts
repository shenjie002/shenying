/** Explicit local media integration check. No model/TTS, no script.json/timeline.json writes. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {runFfmpeg} from '../server/ffmpeg';
import {renderTimeline} from '../server/pipeline';
import {previewTimeline,scriptSchema} from '../shared/schema';

const token=`integration-${randomUUID()}`;
const audio=path.resolve('public/audio',`${token}.mp3`);
await fs.mkdir(path.dirname(audio),{recursive:true});
const timeline=previewTimeline(scriptSchema.parse(JSON.parse(await fs.readFile('input/creative-example.json','utf8'))));
for(const scene of timeline.scenes){
  scene.narrationSegments=scene.narrationSegments!.map((segment,i)=>({...segment,from:i*24,durationInFrames:24,audioSrc:`audio/${token}.mp3`}));
  scene.durationInFrames=scene.narrationSegments.length*24;
}
timeline.totalFrames=timeline.scenes.reduce((n,s)=>n+s.durationInFrames,0);timeline.mode='tts';
const logs:string[]=[];
try {
  await runFfmpeg(['-hide_banner','-loglevel','error','-f','lavfi','-i','sine=frequency=440:duration=1','-y',audio]);
  await renderTimeline(timeline,console.log,()=>{},false,true);
  const scene=timeline.scenes[0];if(scene.template!=='CanvasSlide')throw Error('fixture changed');
  scene.props.heading='增量复测：只改第一幕';
  const output=await renderTimeline(timeline,message=>{logs.push(message);console.log(message);},()=>{},false,true);
  assert.ok(logs.some(s=>s.includes('渲染更新：分镜1')));
  assert.ok(logs.some(s=>s.includes('复用缓存：分镜2')));
  const result=await new Promise<string>((resolve,reject)=>{
    const child=spawn('ffprobe',['-v','error','-show_entries','stream=codec_name,nb_frames,duration','-of','json',path.resolve('.'+output)]);
    let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('error',reject);child.on('exit',code=>code===0?resolve(stdout):reject(Error(stderr)));
  });
  const {streams}=JSON.parse(result),video=streams.find((s:any)=>s.codec_name==='h264'),sound=streams.find((s:any)=>s.codec_name==='aac');
  assert.equal(Number(video.nb_frames),timeline.totalFrames);
  assert.ok(Math.abs(Number(video.duration)-Number(sound.duration))<1/timeline.fps);
  console.log(`通过：${output}，${video.nb_frames}帧，音画时长一致，第二幕复用；测试视频/缓存保留在out。`);
} finally {await fs.rm(audio,{force:true});}
