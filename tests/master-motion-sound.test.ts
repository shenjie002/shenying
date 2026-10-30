import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {spring} from 'remotion';
import {actorPose,masterSchema} from '../shared/master';
import {scriptSchema,previewTimeline} from '../shared/schema';
import {mixSfx,pcmWav,sfxSchema,synthCue} from '../shared/sfx';
import {needsAudioTrack} from '../server/pipeline';
import {rendererGuide} from '../shared/capabilities';

const base={beats:[{text:'测试',frames:90}],actors:[{id:'a',label:'A',keys:[
  {frame:10,x:30,y:50,scale:0.5,opacity:0,progress:0,easing:'spring-jelly',spring:{damping:7,stiffness:270,mass:0.65}},
  {frame:34,x:60,y:50,scale:1,opacity:1,progress:1},
]}]};
test('master 使用真正 Remotion spring + 自定义物理参数，生命周期与有界进度不超调',()=>{
 const a=masterSchema.parse(base).actors[0];
 assert.equal(actorPose(a,9).opacity,0);
 const values=Array.from({length:25},(_,i)=>actorPose(a,10+i));
 assert.ok(Math.max(...values.map(p=>p.scale))>1.02);
 for(let i=1;i<24;i++){
  assert.equal(values[i].x,30+30*spring({frame:i,fps:30,durationInFrames:24,config:{damping:7,stiffness:270,mass:0.65}}));
  assert.ok(values[i].opacity>=0&&values[i].opacity<=1);
  assert.ok(values[i].progress>=0&&values[i].progress<=1);
 }
 assert.equal(actorPose(a,34).scale,1);
 assert.deepEqual(actorPose(a,18),actorPose(a,18));
 assert.equal(masterSchema.safeParse({...base,actors:[{...base.actors[0],keys:[{...base.actors[0].keys[0],spring:{damping:0,stiffness:100,mass:1}},base.actors[0].keys[1]]}]}).success,false);
});
test('图形/音效拒绝越界、未知来源、缺icon及重复演员ID',()=>{
 for(const patch of [
  {sfx:[{frame:90,sound:'bloop'}]},
  {sfx:[{frame:10,sound:'https://example.com/a.mp3'}]},
  {actors:[{...base.actors[0],kind:'icon'}]},
  {actors:[base.actors[0],base.actors[0]]},
  {actors:[{...base.actors[0],icon:'untrusted-svg'}]},
 ])assert.equal(masterSchema.safeParse({...base,...patch}).success,false);
 assert.equal(sfxSchema.safeParse({frame:2,sound:'tick',gain:0.7}).success,false);
 assert.equal(sfxSchema.safeParse({frame:2,sound:'tick',src:'../x.wav'}).success,false);
 const ring=masterSchema.parse({...base,actors:[{...base.actors[0],kind:'ring',icon:'AudioLines'}]}).actors[0];
 assert.equal(actorPose(ring,22).progress,0.5);
});
test('合成PCM确定、非静音、包络无首尾跳变，按全局帧采样调度且不提前',()=>{
 for(const sound of ['bloop','whoosh','tick','chime'] as const){
  const a=synthCue(sound);
  assert.deepEqual(a,synthCue(sound));
  assert.ok(a[0]===0);assert.ok(Math.abs(a[a.length-1])<0.001);
  assert.ok(a.some(v=>Math.abs(v)>0.01));
 }
 const events=[sfxSchema.parse({frame:30,sound:'bloop',gain:0.4})];
 const track=mixSfx(events,90);
 assert.equal(track.length,144000);
 assert.ok(track.subarray(0,48000).every(v=>v===0));
 assert.ok(track.subarray(48001,58000).some(v=>v!==0));
 const wav=pcmWav(track),view=new DataView(wav.buffer);
 assert.equal(new TextDecoder().decode(wav.subarray(0,4)),'RIFF');
 assert.equal(view.getUint32(24,true),48000);
 assert.equal(view.getUint32(40,true),track.length*2);
 const overlap=mixSfx(Array.from({length:60},()=>sfxSchema.parse({frame:0,sound:'chime',gain:0.6})),30);
 const clipped=new DataView(pcmWav(overlap).buffer);
 for(let i=44;i<clipped.byteLength;i+=2)assert.ok(Math.abs(clipped.getInt16(i,true))<=31129);
});
test('30秒样片为900帧，带合成音效；CLI与实际生成/MCP能力契约含新能力边界',async()=>{
 const path='input/master-motion-sound-30s.json';
 const script=scriptSchema.parse(JSON.parse(await fs.readFile(path,'utf8')));
 assert.equal(previewTimeline(script).totalFrames,900);
 assert.equal(script.master!.sfx.length,15);
 assert.equal(script.master!.sfxMuted,true); // 音效默认静音
 assert.equal(needsAudioTrack(previewTimeline(script)),false);
 assert.ok(needsAudioTrack(previewTimeline({...script,master:{...script.master!,sfxMuted:false}})));
 // master TTS is now allowed; never call prepare('tts') here, it would hit Edge TTS. Timing is covered offline in master-narration.test.ts.
 const springActor=script.master!.actors.find(a=>a.id==='spring')!;
 assert.ok(actorPose(springActor,318).scale>actorPose(springActor,334).scale);
 assert.equal(actorPose(springActor,318).opacity,1); // Visible overshoot, not hidden behind a fade.
 const documentation=await fs.readFile('docs/master-composition.md','utf8');
 const example=JSON.parse(documentation.match(/```json\n([\s\S]*?)\n```/)![1]);
 assert.ok(scriptSchema.safeParse(example).success);
 const output=execFileSync(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/validate-storyboard.ts',path],{encoding:'utf8'});
 assert.match(output,/900帧/);
 const guide=rendererGuide();
 assert.match(guide,/master/);assert.match(guide,/damping/);assert.match(guide,/bloop/);assert.match(guide,/不.*TTS/);
});
