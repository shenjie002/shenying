import {spring} from 'remotion';
import {z} from 'zod';

export const springNames = ['spring-soft','spring-bouncy','spring-snappy','spring-jelly'] as const;
export const springConfigs = {
  'spring-soft': {damping: 18, stiffness: 100, mass: 0.8},
  'spring-bouncy': {damping: 10, stiffness: 150, mass: 0.7},
  'spring-snappy': {damping: 16, stiffness: 210, mass: 0.65},
  'spring-jelly': {damping: 7, stiffness: 320, mass: 0.6},
};
export function springProgress(mode: keyof typeof springConfigs, frame: number, duration: number) {
  if(frame<=0)return 0;
  if(frame>=duration)return 1;
  return spring({frame,fps:30,durationInFrames:Math.max(2,Math.round(duration)),config:springConfigs[mode]});
}
/** Entrance overlay does not shift narration or semantic pose clocks. */
export function staggerReveal(group:{objects:string[];intervalFrames:number;durationFrames:number;preset:keyof typeof springConfigs},id:string,frame:number,start:number,moving=true){
 if(!moving)return {opacity:1,offsetY:0};
 const local=frame-start-group.objects.indexOf(id)*group.intervalFrames;
 return {opacity:Math.max(0,Math.min(1,local/8)),offsetY:(1-springProgress(group.preset,local,group.durationFrames))*28};
}
/** Very slow ambient breathing. Frozen when animation=none; deterministic per frame. */
export function ambientDrift(frame:number,moving:boolean){
 const t=moving?frame:0;
 return {x:Math.sin(t/120)*8+Math.sin(t/43)*2,y:Math.cos(t/150)*6+Math.cos(t/57)*1.6,scale:1+Math.sin(t/210)*.018+Math.sin(t/83)*.005};
}
export const ambientSchema=z.object({kind:z.enum(['stardust','glow']),density:z.enum(['low','medium']).default('low'),intensity:z.number().min(0).max(1).default(.5)}).strict();
export const staggerSchema=z.array(z.object({sentence:z.number().int().min(1).max(50),objects:z.array(z.string().regex(/^[a-zA-Z0-9_-]+$/).max(60)).min(2).max(12),intervalFrames:z.number().int().min(3).max(12).default(4),durationFrames:z.number().int().min(12).max(45).default(24),preset:z.enum(springNames).default('spring-soft')}).strict()).min(1).max(6);
/** Stable seeds and absolute frame coordinates: no random state or CSS clocks. */
export function ambientParticles(frame:number,moving:boolean,density:'low'|'medium',intensity:number){
 const t=moving?frame:0;
 return Array.from({length:density==='low'?28:52},(_,i)=>{
  const depth=1+i%3;
  return {x:((i*73.37+Math.sin(t/210+i)*depth*.65)%100+100)%100,y:((i*47.13+Math.cos(t/270+i*1.7)*depth*.8)%100+100)%100,size:1+depth,opacity:intensity*(.08+depth*.035)*(0.7+Math.sin(t/100+i)*.3),blur:depth===3?1.2:0};
 });
}
export const effectsGuide='通用运动增强：visual.ambient可选{kind:stardust|glow,density:low|medium,intensity:0～1}，默认不启用，低对比慢漂移星尘或弥散光晕，不代表真实物理。启用后整个环境层另有极慢的层内呼吸与平移视差（约二十五秒与九秒双层周期，幅度小于十二像素），aurora/glow背景光也会随同一视差轻微位移缩放；animation=none时整体冻结在原位。MotionScene关键帧easing另支持spring-soft/spring-bouncy/spring-snappy/spring-jelly，控制至下一关键帧的位置/缩放/旋转弹簧超调；透明度/进度/字重/颜色保持有界平滑，终点精确停靠，无碰撞仿真。MotionScene.props.stagger可选[{sentence,objects:[对象ID按入场顺序],intervalFrames:3～12默认4,durationFrames:12～45默认24,preset:spring-soft|spring-bouncy|spring-snappy|spring-jelly}]；同组对象首关键帧须为指定sentence的at=0，各组对象不得重复。仅叠加一次淡入与向上28舞台单位弹簧揭示，不平移语义关键帧或连线时钟；对象请从可读稳定首姿态开始，不重复写透明度0的入场。句长不足仍按固定帧完成，必要时延长旁白阅读停顿。animation=none关闭揭示等待/位移并冻结氛围，仍保留关键帧状态切换；pace=all不关闭显式stagger。不对阅读正文持续弹跳，保留边距并人工检查超调裁切。';
