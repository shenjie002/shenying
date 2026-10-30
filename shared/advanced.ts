import {z} from 'zod';
const id=z.string().regex(/^[a-zA-Z0-9_-]+$/).max(60),label=z.string().min(1).max(40);
const sentence=z.number().int().min(1).max(50);
export const transferSchema=z.object({containers:z.array(z.object({id,label}).strict()).min(2).max(3),cards:z.array(z.object({id,label}).strict()).min(1).max(6),steps:z.array(z.object({sentence,assignments:z.array(z.object({card:id,container:id}).strict()).min(1).max(6)}).strict()).min(2).max(8),durationFrames:z.number().int().min(6).max(60).default(24)}).strict();
export const balanceSchema=z.object({leftLabel:label,rightLabel:label,steps:z.array(z.object({sentence,tilt:z.enum(['left','center','right'])}).strict()).min(1).max(8),durationFrames:z.number().int().min(12).max(90).default(36)}).strict();
export const counterSchema=z.object({sentence,from:z.number().finite().min(-1e9).max(1e9).default(0),to:z.number().finite().min(-1e9).max(1e9),decimals:z.number().int().min(0).max(2).default(0),unit:z.string().max(16).default(''),kind:z.enum(['reveal','change']),durationFrames:z.number().int().min(6).max(90).default(30)}).strict();
export const milestonesSchema=z.array(z.object({sentence,event:z.number().int().min(1).max(5)}).strict()).min(1).max(10);
export function stepAt(steps:{sentence:number}[],starts:number[],frame:number){let index=-1;steps.forEach((s,i)=>{if(starts[s.sentence-1]!==undefined&&frame>=starts[s.sentence-1])index=i;});return index;}
export function easeProgress(frame:number,start:number,duration:number,moving=true){if(frame<start)return 0;if(!moving)return 1;const p=Math.min(1,(frame-start)/duration);return p*p*(3-2*p);}
export function counterValue(c:z.infer<typeof counterSchema>,frame:number,start:number,moving=true){return c.from+(c.to-c.from)*easeProgress(frame,start,c.durationFrames,moving);}
export const advancedGuide=`受控高级表达：TransferContainerBlock props={containers:[{id,label}]（2～3）,cards:[{id,label}]（1～6）,steps:[{sentence,assignments:[{card,container}]}]（2～8完整快照）,durationFrames?:6～60。每步必须完整列出全部卡片，ID唯一且引用有效，按句首平滑转移；同容器按固定卡片顺序排列，空白预留，允许卡片路径交叉，不自动避障。首步句号必须绑定该块首次target，后续步骤也绑定该块target；不要把普通对比硬写成归属转移。
BalanceScaleBlock props={leftLabel,rightLabel,steps:[{sentence,tilt:left|center|right}],durationFrames?:12～90}，按句首阻尼倾斜，仅定性权衡示意、不是物理模拟或测量；必须有资料支持倾向，不因出现对比就判胜负，无倾向用CompareBlock。步骤绑定该块target。
StatBlock可选counter={sentence,from,to,decimals:0～2,unit,kind:reveal|change,durationFrames:6～90}；value必须等于to.toFixed(decimals)+unit。reveal必须from=0，仅呈现最终值，不是历史变化；change需原文同时提供起点终点和同单位依据。BarChartBlock可选countUp:true，仅配motion.mode=grow，数字跟随柱子从0显露，不伪造时间序列；无countUp保持最终数值。
TimelineBlock可选milestones:[{sentence,event}]，event从1开始，可回看，sentence严格递增；按句首标记已完成/当前/未开始，仅展开当前详情，不与motion同时使用。每个句号必须真实存在，原文没有日期不要编造日期。
动画只用Remotion帧驱动，animation=none冻结过渡但保留句首状态切换。创作策略：提出问题→解释结构/变化→展示来源证据→对照→收束仅作参考，不强制套五段或每幕堆块；根据阅读负担拆幕，复杂块优先独占，竖屏不挤多列。`;
