import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scriptSchema} from '../shared/schema';
import {counterSchema,counterValue,easeProgress,stepAt} from '../shared/advanced';
const fixture=()=>JSON.parse(fs.readFileSync('input/advanced-explainer-example.json','utf8'));
test('四种高级表达完整示例与任意seek、静止策略',()=>{
 assert.equal(scriptSchema.parse(fixture()).scenes.length,4);
 assert.equal(stepAt([{sentence:1},{sentence:3}],[0,50,100],110),1);assert.equal(stepAt([{sentence:1},{sentence:3}],[0,50,100],20),0);
 assert.equal(easeProgress(50,0,100),.5);assert.equal(easeProgress(0,0,100,false),1);
 const c=counterSchema.parse({sentence:1,from:0,to:100,kind:'reveal',durationFrames:30});assert.equal(counterValue(c,15,0),50);assert.equal(counterValue(c,30,0),100);assert.equal(counterValue(c,0,10,false),0);
});
test('转移拒绝重复ID/缺卡/未知容器/乱序和错target',()=>{
 for(const mutate of [(v:any)=>v.scenes[0].props.blocks[0].props.cards.push({id:'search',label:'x'}),(v:any)=>v.scenes[0].props.blocks[0].props.steps[0].assignments.pop(),(v:any)=>v.scenes[0].props.blocks[0].props.steps[0].assignments[0].container='unknown',(v:any)=>v.scenes[0].props.blocks[0].props.steps[1].sentence=1,(v:any)=>v.scenes[0].narration[1].target=undefined]){const v=fixture();mutate(v);assert.equal(scriptSchema.safeParse(v).success,false);}
});
test('计数/天平/时间轴跨字段拒绝非法状态',()=>{
 for(const mutate of [(v:any)=>v.scenes[2].props.blocks[0].props.counter.from=10,(v:any)=>v.scenes[2].props.blocks[0].props.counter.to=10,(v:any)=>v.scenes[1].props.blocks[0].props.steps[1].sentence=50,(v:any)=>v.scenes[3].props.blocks[0].props.milestones[0].event=5,(v:any)=>v.scenes[3].props.blocks[0].props.motion={sentence:1,mode:'sequence',durationFrames:24}]){const v=fixture();mutate(v);assert.equal(scriptSchema.safeParse(v).success,false);}
});
