import {test} from 'node:test';
import assert from 'node:assert/strict';
import {motionSceneSchema,focusPose,motionIconNames} from '../shared/motion-scene';
import {scriptSchema} from '../shared/schema';

const segments=[{from:0,durationInFrames:90},{from:93,durationInFrames:90},{from:186,durationInFrames:90}];
const focus=[{sentence:1,at:0,ids:['a','b'],dimOpacity:.3,blur:0},{sentence:2,at:0,ids:['b'],dimOpacity:.2,blur:2.5},{sentence:3,at:0,ids:['a','b','c'],dimOpacity:.2,blur:2.5}];

test('聚焦降噪：成员切换插值、静止立即切、未知引用与重复ID被拒绝',()=>{
 assert.deepEqual(focusPose(focus,segments,10,'a'),{dim:1,blur:0,active:true});
 assert.equal(focusPose(focus,segments,100,'a').dim,.2);
 const fading=focusPose(focus,segments,180,'a');
 assert.ok(fading.dim>.2&&fading.dim<1);assert.ok(fading.blur>0&&fading.blur<2.5);
 assert.equal(focusPose(focus,segments,186,'a').dim,1);
 assert.equal(focusPose(focus,segments,100,'b').dim,1);
 assert.deepEqual(focusPose(focus,segments,140,'c'),{dim:.2,blur:2.5,active:false});
 assert.equal(focusPose(focus,segments,180,'a',false).dim,.2);
 assert.equal(focusPose([],segments,140,'a').dim,1);
 assert.deepEqual(focusPose([focus[0]],segments,50,'a'),{dim:1,blur:0,active:true});
});

test('卡片微标签与图标受Schema限制，旧对象无需新字段',()=>{
 const base={description:'示意',objects:[{id:'a',label:'模型',shape:'panel',badge:'示意',icon:'Brain',keys:[{sentence:1,x:30,y:30},{sentence:2,x:50,y:50}]}],links:[]};
 assert.ok(motionSceneSchema.safeParse(base).success);
 assert.ok(motionSceneSchema.safeParse({...base,objects:[{id:'a',label:'模型',shape:'panel',keys:[{sentence:1,x:30,y:30},{sentence:2,x:50,y:50}]}]}).success);
 assert.ok(!motionSceneSchema.safeParse({...base,objects:[{...base.objects[0],badge:'这个标签明显超过十二个字的长度'}]}).success);
 assert.ok(!motionSceneSchema.safeParse({...base,objects:[{...base.objects[0],icon:'Rocket'}]}).success);
 for(const name of ['Brain','Workflow','Terminal'])assert.ok(motionIconNames.includes(name as never));
 assert.ok(motionSceneSchema.safeParse({...base,focus}).success);
 assert.ok(!motionSceneSchema.safeParse({...base,focus:[{sentence:1,ids:['a'],blur:9}]}).success);
});

test('聚焦与错峰要求有效旁白句号并进入共用能力契约',()=>{
 const scene=(extra:Record<string,unknown>)=>({title:'t',scenes:[{id:'s',template:'CanvasSlide',voiceover:'建立。 变化。',subtitles:true,visual:{background:'plain',animation:'gentle',pace:'all'},narration:[{text:'建立。',target:1},{text:'变化。',target:1}],props:{heading:'h',layout:'stacked',blocks:[{id:'m',type:'MotionSceneBlock',props:{description:'示意',objects:[{id:'a',label:'模型',shape:'panel',keys:[{sentence:1,x:30,y:30},{sentence:2,x:50,y:50}]}],links:[],...extra}}]}}]});
 assert.ok(scriptSchema.safeParse(scene({focus:[{sentence:1,ids:['a']},{sentence:2,ids:['a']}]})).success);
 assert.ok(!scriptSchema.safeParse(scene({focus:[{sentence:1,ids:['a']},{sentence:2,ids:['a']},{sentence:2,ids:['a']}]})).success);
 assert.ok(!scriptSchema.safeParse(scene({focus:[{sentence:3,ids:['a']}]})).success);
 assert.ok(!scriptSchema.safeParse(scene({focus:[{sentence:1,ids:['missing']}]})).success);
});

test('微场景与微观动效字段受控：reveal/float/capsule/glow 有上限且默认兼容',()=>{
 const base={description:'示意',objects:[{id:'a',label:'标题',shape:'text',keys:[{sentence:1,x:50,y:40},{sentence:2,at:1,x:50,y:40}]}],links:[]};
 assert.ok(motionSceneSchema.safeParse(base).success);
 const o=base.objects[0] as Record<string,unknown>;
 for(const reveal of ['fade','rise','wipe','typewriter','pop'])assert.ok(motionSceneSchema.safeParse({...base,objects:[{...o,reveal}]}).success,reveal);
 assert.ok(!motionSceneSchema.safeParse({...base,objects:[{...o,reveal:'explode'}]}).success);
 assert.ok(!motionSceneSchema.safeParse({...base,objects:[{...o,float:4}]}).success);
 assert.ok(motionSceneSchema.safeParse({...base,objects:[{...o,float:2,capsule:true,glow:true,revealFrames:14}]}).success);
 assert.ok(!motionSceneSchema.safeParse({...base,objects:[{...o,revealFrames:60}]}).success);
});
