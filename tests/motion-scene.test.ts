import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scriptSchema} from '../shared/schema';
import {motionKeySchema,motionSceneSchema,motionPose,keyFrame,cameraPose,toneMix} from '../shared/motion-scene';
import {buildMessages} from '../server/article';
import {articleRequestSchema} from '../shared/article';
const raw=()=>JSON.parse(fs.readFileSync('input/continuous-motion-example.json','utf8'));
test('连续轨道在句中插值，重叠动作可随机seek，静止保持关键姿态',()=>{
 const keys=[motionKeySchema.parse({sentence:1,at:0,x:20,y:30}),motionKeySchema.parse({sentence:1,at:1,x:80,y:70,scale:.5,opacity:0})],segments=[{from:10,durationInFrames:101}];
 assert.equal(keyFrame(keys[1],segments),110);assert.equal(motionPose(keys,segments,60).x,50);assert.equal(motionPose(keys,segments,60).opacity,.5);assert.equal(motionPose(keys,segments,0).opacity,0);assert.equal(motionPose(keys,segments,60,false).x,20);assert.equal(motionPose(keys,segments,110,false).x,80);assert.deepEqual(motionPose(keys,segments,60),motionPose(keys,segments,60));
});
test('连续舞台拒绝未知路径、重复ID、错引用、乱序/越界关键帧和缺旁白',()=>{
 for(const change of [(p:any)=>p.objects.push(p.objects[0]),(p:any)=>p.links[0].to='missing',(p:any)=>p.objects[0].keys[1].sentence=50,(p:any)=>p.objects[0].keys[1].at=0,(p:any)=>p.objects[0].keys[0].x=0,(p:any)=>p.objects[0].css='url(x)']){const r=raw(),p=r.scenes[2].props.blocks[0].props;change(p);assert.equal(scriptSchema.safeParse(r).success,false);}
 assert.ok(scriptSchema.safeParse(raw()).success);
});
test('字阶、字重、重点渐色与镜头插值确定且静止不推进',()=>{
 const segments=[{from:0,durationInFrames:101}],keys=[motionKeySchema.parse({sentence:1,x:30,y:40,fontSize:20,fontWeight:400,emphasis:0,jitter:0}),motionKeySchema.parse({sentence:1,at:1,x:60,y:50,fontSize:40,fontWeight:800,emphasis:1,jitter:2})];
 const pose=motionPose(keys,segments,50);assert.equal(pose.fontSize,30);assert.equal(pose.fontWeight,600);assert.equal(pose.emphasis,.5);assert.equal(pose.jitter,1);assert.equal(motionPose(keys,segments,50,false).fontSize,20);
 assert.equal(toneMix('#000000','#ffffff',.5),'#808080');
 const camera=[{sentence:1,at:0,x:50,y:50,zoom:1},{sentence:1,at:1,x:60,y:50,zoom:1.2}];assert.equal(cameraPose(camera,segments,50).scale,1.1);assert.equal(cameraPose(camera,segments,50).x,55);assert.equal(cameraPose(camera,segments,50,false).scale,1);
 const invalid=raw();invalid.scenes[2].props.blocks[0].props.camera=[camera[1],camera[0]];assert.equal(scriptSchema.safeParse(invalid).success,false);
 for(const field of [{fontSize:100},{fontWeight:1000},{jitter:10},{emphasis:2},{easing:'css'}])assert.equal(motionKeySchema.safeParse({sentence:1,x:50,y:50,...field}).success,false);
});
test('实际生成提示包含连续过程而非只做高亮，并明确概念边界',()=>{
 const p=buildMessages(articleRequestSchema.parse({article:'用于验证模型生成能力契约的资料。'.repeat(10)}))[0].content;assert.match(p,/MotionSceneBlock/);assert.match(p,/关键帧间连续平滑插值/);assert.match(p,/不是真实|不是执行代码或真实仿真/);
});

test('镜头可推近到2.4且不经过对象scale上限（回归：曾误用motionKeySchema）',()=>{
 const segments=[{from:0,durationInFrames:60}];
 const keys=[{sentence:1,at:0,x:50,y:50,zoom:1},{sentence:1,at:1,x:40,y:60,zoom:2.4,easing:'settle' as const}];
 assert.equal(cameraPose(keys,segments,0).scale,1);
 assert.equal(cameraPose(keys,segments,59).scale,2.4);
 const mid=cameraPose(keys,segments,30);
 assert.ok(mid.scale>1&&mid.scale<2.4);
 assert.equal(cameraPose(keys,segments,30,false).scale,1);
 assert.ok(motionSceneSchema.safeParse({description:'d',objects:[{id:'a',label:'A',shape:'panel',keys:[{sentence:1,x:50,y:50},{sentence:1,at:1,x:50,y:50}]}],camera:keys,links:[]}).success);
 assert.ok(!motionSceneSchema.safeParse({description:'d',objects:[{id:'a',label:'A',shape:'panel',keys:[{sentence:1,x:50,y:50},{sentence:1,at:1,x:50,y:50}]}],camera:[{sentence:1,zoom:2.6},{sentence:1,at:1,zoom:1}],links:[]}).success);
});
