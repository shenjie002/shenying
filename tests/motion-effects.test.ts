import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ambientParticles,springProgress,staggerReveal,ambientDrift} from '../shared/motion-effects';
import {motionKeySchema,motionPose} from '../shared/motion-scene';
import {scriptSchema} from '../shared/schema';
import {visualSchema} from '../shared/style';
import {rendererGuide} from '../shared/capabilities';
import effectsSample from '../input/motion-effects-study.json';
import sample from '../input/agent-boundary-20s-study.json';

test('三种弹簧可超调且精确停靠，非空间属性有界，none保持时刻快照',()=>{
 for(const mode of ['spring-soft','spring-bouncy','spring-snappy','spring-jelly'] as const){
  assert.equal(springProgress(mode,0,30),0);assert.equal(springProgress(mode,30,30),1);
  const keys=[motionKeySchema.parse({sentence:1,at:0,x:30,y:50,opacity:0,scale:.8,easing:mode}),motionKeySchema.parse({sentence:1,at:1,x:60,y:50,opacity:1,scale:1})];
  const segments=[{from:0,durationInFrames:31}];
  for(let frame=0;frame<=30;frame++){const p=motionPose(keys,segments,frame);assert.ok(p.opacity>=0&&p.opacity<=1);assert.deepEqual(p,motionPose(keys,segments,frame));}
  assert.equal(motionPose(keys,segments,30).x,60);assert.equal(motionPose(keys,segments,15,false).x,30);
 }
 assert.ok(Array.from({length:29},(_,i)=>springProgress('spring-bouncy',i+1,30)).some(p=>p>1));
});
test('环境粒子确定、分层、冻结且受Schema限制',()=>{
 const a=ambientParticles(120,true,'low',.5);assert.deepEqual(a,ambientParticles(120,true,'low',.5));
 assert.notDeepEqual(a,ambientParticles(240,true,'low',.5));assert.deepEqual(ambientParticles(120,false,'low',.5),ambientParticles(0,false,'low',.5));
 assert.equal(a.length,28);assert.equal(ambientParticles(0,true,'medium',1).length,52);assert.ok(a.every(p=>p.x>=0&&p.x<100&&p.y>=0&&p.y<100));
 assert.ok(visualSchema.safeParse({background:'plain',animation:'spring',pace:'all',ambient:{kind:'stardust'}}).success);
 assert.ok(!visualSchema.safeParse({background:'plain',animation:'spring',pace:'all',ambient:{kind:'stardust',intensity:2}}).success);
});
test('错峰在固定帧按组顺序揭示、seek确定且none取消等待',()=>{
 const group={objects:['a','b','c'],intervalFrames:4,durationFrames:24,preset:'spring-bouncy' as const};
 assert.equal(staggerReveal(group,'b',3,0).opacity,0);
 assert.ok(staggerReveal(group,'a',4,0).opacity>0);
 assert.equal(staggerReveal(group,'c',7,0).opacity,0);
 assert.deepEqual(staggerReveal(group,'c',50,0),{opacity:1,offsetY:0});
 assert.deepEqual(staggerReveal(group,'b',10,0),staggerReveal(group,'b',10,0));
 assert.deepEqual(staggerReveal(group,'c',0,0,false),{opacity:1,offsetY:0});
 assert.ok(scriptSchema.safeParse(effectsSample).success);
});
test('错峰拒绝未知ID、重复分组与不一致首句，能力自动进入renderer',()=>{
 const data=structuredClone(sample) as any;const p=data.scenes[0].props.blocks[0].props;
 p.stagger=[{sentence:1,objects:['company','question'],intervalFrames:4}];p.objects[1].keys[0].at=0;
 assert.ok(scriptSchema.safeParse(data).success);
 p.stagger[0].objects[1]='missing';assert.ok(!scriptSchema.safeParse(data).success);
 p.stagger[0].objects=['company','company'];assert.ok(!scriptSchema.safeParse(data).success);
 p.stagger[0].objects=['company','question'];p.stagger[0].sentence=2;assert.ok(!scriptSchema.safeParse(data).success);
 for(const text of ['spring-bouncy','intervalFrames','visual.ambient','pace=all不关闭显式stagger'])assert.ok(rendererGuide().includes(text));
});

test('环境呼吸视差缓慢、确定、有界，静止模式冻结',()=>{
 const a=ambientDrift(600,true);
 assert.deepEqual(a,ambientDrift(600,true));
 assert.deepEqual(ambientDrift(600,false),ambientDrift(0,false));
 assert.notDeepEqual(a,ambientDrift(900,true));
 for(let f=0;f<3000;f+=7){const p=ambientDrift(f,true);assert.ok(Math.abs(p.x)<13&&Math.abs(p.y)<11);assert.ok(p.scale>=.97&&p.scale<=1.03);}
 // Neighbouring frames move only slightly: no visible jitter.
 const d1=ambientDrift(600,true),d2=ambientDrift(601,true);
 assert.ok(Math.abs(d1.x-d2.x)<.5&&Math.abs(d1.y-d2.y)<.5);
});

test('spring-jelly比柔和弹簧回弹更明显，但仍有界并精确停靠',()=>{
 const peak=(m:'spring-soft'|'spring-jelly')=>{let max=0;for(let f=1;f<30;f++)max=Math.max(max,springProgress(m,f,30));return max;};
 assert.ok(peak('spring-jelly')>peak('spring-soft'));
 assert.ok(peak('spring-jelly')>1.03);
 assert.equal(springProgress('spring-jelly',30,30),1);
});
