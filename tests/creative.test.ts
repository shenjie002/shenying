import {entityMotion} from '../shared/entity-motion';
import {rendererGuide} from '../shared/capabilities';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {scriptSchema,previewTimeline} from '../shared/schema';
import {cueAt} from '../shared/cues';
import {mechanismSchema} from '../shared/mechanism';
import {cachedScene,sceneRenderKey} from '../server/render-cache';
const raw=async()=>JSON.parse(await fs.readFile('input/creative-example.json','utf8'));
test('AI能力契约包含视图动作与限制，不把任意创作当作已有能力',()=>{
 const guide=rendererGuide();assert.match(guide,/props.cues/);assert.match(guide,/临时全宽/);assert.match(guide,/emphasis/);assert.match(guide,/不支持自由坐标/);
});
test('显隐、局部强调、全宽聚焦与恢复布局按句首选择，任意seek确定',async()=>{
 const script=scriptSchema.parse(await raw()),scene=previewTimeline(script).scenes[0];
 if(scene.template!=='CanvasSlide')throw Error();const starts=scene.narrationSegments!.map(s=>s.from);
 assert.equal(cueAt(scene.props.cues,starts,starts[1])?.focus,'diagram');
 assert.equal(cueAt(scene.props.cues,starts,starts[2])?.focus,undefined);
 assert.equal(cueAt(scene.props.cues,starts,0)?.blocks[1].visible,false);
 assert.equal(cueAt(scene.props.cues,starts,starts[1])?.blocks[1].item,2);
});
test('拒绝丢失对象、非法焦点、越界局部项及不存在句号',async()=>{
 for(const mutate of [(v:any)=>v.scenes[0].props.cues[0].blocks.pop(),(v:any)=>v.scenes[0].props.cues[0].focus='missing',(v:any)=>v.scenes[0].props.cues[1].blocks[1].item=99,(v:any)=>v.scenes[0].props.cues[1].sentence=50]){const v=await raw();mutate(v);assert.equal(scriptSchema.safeParse(v).success,false);}
});
test('实体槽位、容器与关系显隐拒绝歧义',async()=>{
 const v=await raw(),props=v.scenes[1].props.blocks[0].props;
 assert.equal(mechanismSchema.safeParse(props).success,true);
 props.steps[1].states[0].slot=props.steps[1].states[1].slot;assert.equal(mechanismSchema.safeParse(props).success,false);
});
test('槽位交换不穿越重叠，空槽移动插值且跳帧确定',async()=>{
 const v=await raw(),props=v.scenes[1].props.blocks[0].props;
 const [a,b]=props.steps,ids=props.entities.map((e:any)=>e.id),id=ids[0];
 assert.equal(entityMotion(a,b,id,ids,.5).opacity,0);
 assert.equal(entityMotion(a,b,id,ids,0).slot,1);assert.equal(entityMotion(a,b,id,ids,1).slot,2);
 a.states[1].visible=false;
 assert.equal(entityMotion(a,b,id,ids,.5).slot,1.5);
});
test('分镜缓存受内容/序号/引擎/质量影响，失败不发布缓存',async()=>{
 const scene=previewTimeline(scriptSchema.parse(await raw())).scenes[0],key=sceneRenderKey(scene,0,30,{},'v1');
 assert.notEqual(key,sceneRenderKey({...scene,voiceover:'changed'},0,30,{},'v1'));
 assert.notEqual(key,sceneRenderKey(scene,1,30,{},'v1'));assert.notEqual(key,sceneRenderKey(scene,0,30,{},'v2'));
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'shenying-cache-')),file=path.join(dir,'scene.mp4');
 try{let calls=0;const make=async(p:string)=>{calls++;await fs.writeFile(p,'video');};assert.equal(await cachedScene(file,make),false);assert.equal(await cachedScene(file,make),true);assert.equal(calls,1);await fs.rm(file);await assert.rejects(cachedScene(file,async p=>{await fs.writeFile(p,'partial');throw Error('fail');}));await assert.rejects(fs.access(file));await assert.rejects(fs.access(file+'.tmp.mp4'));}finally{await fs.rm(dir,{recursive:true,force:true});}
});
