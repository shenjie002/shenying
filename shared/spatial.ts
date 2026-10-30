import {z} from 'zod';
const id=z.string().regex(/^[a-zA-Z0-9_-]+$/).max(80);
export const rectSchema=z.object({id,x:z.number().min(0).max(100),y:z.number().min(0).max(100),width:z.number().min(12).max(100),height:z.number().min(12).max(100),layer:z.number().int().min(0).max(10).default(0)}).strict();
export const placementsSchema=z.array(rectSchema).min(1).max(8);
export type Placement=z.infer<typeof rectSchema>;
export const lineStyleSchema=z.object({
  stroke:z.enum(['solid','dashed','dotted']).default('solid'),
  arrow:z.enum(['none','end','both']).default('end'),
  route:z.enum(['straight','elbow','curve']).default('straight'),
  motion:z.enum(['none','draw','flow','pulse']).default('none'),
  tone:z.enum(['neutral','accent','warning']).default('accent'),
}).strict();
export type LineStyle=z.infer<typeof lineStyleSchema>;
export const connectorSchema=z.object({id,from:id,to:id,fromAnchor:z.enum(['top','right','bottom','left']).default('right'),toAnchor:z.enum(['top','right','bottom','left']).default('left'),label:z.string().max(24).optional(),style:lineStyleSchema.default({}),sentence:z.number().int().min(1).max(50).optional()}).strict();
export const chartMotionSchema=z.object({mode:z.enum(['none','grow','sequence']),sentence:z.number().int().min(1).max(50),durationFrames:z.number().int().min(6).max(90).default(24)}).strict();
export function rectInside(r:Placement){return r.x+r.width<=100&&r.y+r.height<=100;}
export function anchor(r:Placement,side:'top'|'right'|'bottom'|'left') {
  return side==='top'?{x:r.x+r.width/2,y:r.y}:side==='bottom'?{x:r.x+r.width/2,y:r.y+r.height}:side==='left'?{x:r.x,y:r.y+r.height/2}:{x:r.x+r.width,y:r.y+r.height/2};
}
export function connectorPath(a:{x:number;y:number},b:{x:number;y:number},route:LineStyle['route']) {
  if(route==='elbow')return `M ${a.x} ${a.y} H ${(a.x+b.x)/2} V ${b.y} H ${b.x}`;
  if(route==='curve')return `M ${a.x} ${a.y} C ${(a.x+b.x)/2} ${a.y}, ${(a.x+b.x)/2} ${b.y}, ${b.x} ${b.y}`;
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}
export function motionProgress(frame:number,start:number|undefined,duration:number,moving=true) {
  if(start===undefined||frame<start)return 0;
  return moving?Math.max(0,Math.min(1,(frame-start)/duration)):1;
}
export const spatialGuide=`自由画布：CanvasSlide.layout=free时，props.placements完整覆盖所有叶块，格式[{id,x,y,width,height,layer?}]；坐标为内容区百分比0～100，不是屏幕像素，width/height>=12，矩形不得越界。Group仅保留target编号树，自由模式按叶块平铺；layer=0～10默认0，允许有意重叠但AI应避免文字遮挡与过小内容。cues可带完整placements快照及layout=free按句切换位置/尺寸（即时重排，不是平滑镜头）；从free切换预设布局忽略placements。
自由模式可选props.connectors（最多12条）连接叶块ID：{id,from,to,fromAnchor?,toAnchor?,label?,sentence?,style?}，anchor=top|right|bottom|left，默认right→left；style={stroke:solid|dashed|dotted,arrow:none|end|both,route:straight|elbow|curve,motion:none|draw|flow|pulse,tone:neutral|accent|warning}。sentence为出现/动画起始句号，省略从幕首开始；draw一次绘制，flow循环流动虚线，pulse低频透明度变化。仅在free布局展示，隐藏/聚焦时不连接不可见块。连线仅为资料关系的概念示意，流动不代表实时流量或测量，不能伪造因果。流动/绘制不会改变标签或数据，animation=none保留静态完整线条。
BarChartBlock、TimelineBlock、TreeBlock可选props.motion={mode:none|grow|sequence,sentence,durationFrames?}，durationFrames=6～90默认24。Bar支持grow（所有柱按同一进度从零显露，默认最终数值固定显示，countUp=true时受控计数）或sequence（按项显露）；Timeline/Tree只支持sequence，未知模式拒绝。动画从本幕有效旁白句首开始，结束保留全量。数值必须源自文章，阶段/树关系不能因动画编造；不是数据随时间变化，不支持任意图表种类。`;
