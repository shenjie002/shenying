import {visualExtensions} from '../shared/extensions';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scriptSchema} from '../shared/schema';
import {connectorPath,lineStyleSchema,motionProgress} from '../shared/spatial';
import {chartProgress} from '../shared/chart-motion';
import {directorGuide} from '../shared/director';
const raw=()=>JSON.parse(fs.readFileSync('input/free-canvas-example.json','utf8'));
test('自由画布与动态柱图完整示例有效；旧稿不需要坐标',()=>{
 assert.ok(scriptSchema.safeParse(raw()).success);
 assert.ok(scriptSchema.safeParse(JSON.parse(fs.readFileSync('input/canvas-example.json','utf8'))).success);
});
test('拒绝缺失/重复位置、越界、无效连线及不存在动画句号',()=>{
 const mutations=[(v:any)=>v.scenes[0].props.placements.pop(),(v:any)=>v.scenes[0].props.placements[0].x=99,(v:any)=>v.scenes[0].props.placements[1].id='a',(v:any)=>v.scenes[0].props.connectors[0].to='missing',(v:any)=>v.scenes[0].props.connectors[0].sentence=50,(v:any)=>v.scenes[0].props.blocks[2].props.motion.sentence=50];
 for(const mutate of mutations){const v=raw();mutate(v);assert.equal(scriptSchema.safeParse(v).success,false);}
});
test('自由布局按句聚焦及位置快照校验；时间轴与树拒绝增长模式',()=>{
 const v=raw(),props=v.scenes[0].props;
 props.cues=[{sentence:2,layout:'free',focus:'b',placements:props.placements,blocks:props.blocks.map((b:any)=>({id:b.id,visible:true,emphasis:'normal'}))}];
 assert.equal(scriptSchema.safeParse(v).success,true);
 props.cues[0].placements=[props.placements[0]];assert.equal(scriptSchema.safeParse(v).success,false);
 const tree=raw();tree.scenes[0].props.blocks[2]={id:'c',type:'TreeBlock',props:{heading:'层级',nodes:[{label:'根',parent:0},{label:'子',parent:1}],motion:{mode:'grow',sentence:3}}};assert.equal(scriptSchema.safeParse(tree).success,false);
 tree.scenes[0].props.blocks[2].props.motion.mode='sequence';assert.equal(scriptSchema.safeParse(tree).success,true);
 assert.equal(new Set(visualExtensions.map(e=>e.id)).size,visualExtensions.length);
});
test('线型/路径/箭头/流动的组合可解析，进度仅帧驱动',()=>{
 for(const stroke of ['solid','dashed','dotted'])for(const arrow of ['none','end','both'])for(const route of ['straight','elbow','curve'])for(const motion of ['none','draw','flow','pulse'])assert.ok(lineStyleSchema.safeParse({stroke,arrow,route,motion}).success);
 assert.match(connectorPath({x:0,y:0},{x:100,y:100},'curve'),/ C /);
 assert.equal(motionProgress(12,0,24),.5);assert.equal(motionProgress(12,0,24,false),1);
 assert.equal(chartProgress(0,30,24,'grow',3,0),0);assert.equal(chartProgress(42,30,24,'grow',3,0),.5);assert.equal(chartProgress(54,30,24,'sequence',3,2),1);
 assert.match(directorGuide(),/layout.free/);assert.match(directorGuide(),/运行时任意动态插拔/);
});
