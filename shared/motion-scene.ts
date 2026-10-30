import {springNames,springProgress,staggerSchema,effectsGuide} from './motion-effects';
import {z} from 'zod';
const ref=z.string().regex(/^[a-zA-Z0-9_-]+$/).max(60);
export const motionIconNames=['Brain','Workflow','Terminal','FileText','Cpu','Database','Server','Globe','Layers','Box','Sparkles','Zap','Activity','Gauge','TrendingUp','ShieldCheck','Network','GitBranch','Settings','Code2'] as const;
export const motionKeySchema=z.object({sentence:z.number().int().min(1).max(50),at:z.number().min(0).max(1).default(0),x:z.number().min(5).max(95),y:z.number().min(8).max(92),scale:z.number().min(.3).max(1.5).default(1),opacity:z.number().min(0).max(1).default(1),rotation:z.number().min(-720).max(720).default(0),progress:z.number().min(0).max(1).default(1),fontSize:z.number().min(16).max(60).default(22),fontWeight:z.number().min(400).max(900).default(700),emphasis:z.number().min(0).max(1).default(1),jitter:z.number().min(0).max(3).default(0),easing:z.enum(['smooth','linear','settle',...springNames]).default('smooth')}).strict();
export const focusKeySchema=z.object({sentence:z.number().int().min(1).max(50),at:z.number().min(0).max(1).default(0),ids:z.array(ref).min(1).max(12),dimOpacity:z.number().min(.05).max(1).default(.28),blur:z.number().min(0).max(6).default(0)}).strict();
export const motionSceneSchema=z.object({stagger:staggerSchema.optional(),focus:z.array(focusKeySchema).min(1).max(12).optional(),description:z.string().min(1).max(140),camera:z.array(z.object({sentence:z.number().int().min(1).max(50),at:z.number().min(0).max(1).default(0),x:z.number().min(10).max(90).default(50),y:z.number().min(10).max(90).default(50),zoom:z.number().min(1).max(2.4).default(1),easing:z.enum(['smooth','linear','settle',...springNames]).optional()}).strict()).min(2).max(12).optional(),objects:z.array(z.object({id:ref,label:z.string().min(1).max(40),detail:z.string().max(70).optional(),badge:z.string().trim().min(1).max(12).optional(),icon:z.enum(motionIconNames).optional(),reveal:z.enum(['fade','rise','wipe','typewriter','pop']).default('fade'),revealFrames:z.number().int().min(6).max(45).default(16),float:z.number().min(0).max(3).default(0),capsule:z.boolean().default(false),glow:z.boolean().default(false),shape:z.enum(['panel','token','ring','text','resource']),tone:z.enum(['normal','accent','warning','muted','teal','rose','highlight']).default('normal'),width:z.number().min(6).max(65).default(22),height:z.number().min(5).max(40).default(14),keys:z.array(motionKeySchema).min(2).max(24)}).strict()).min(1).max(12),links:z.array(z.object({id:ref,from:ref,to:ref,label:z.string().max(25).optional(),sentence:z.number().int().min(1).max(50),untilSentence:z.number().int().min(1).max(50).optional(),flow:z.enum(['none','forward','reverse']).default('none'),periodFrames:z.number().int().min(30).max(180).default(75),dashed:z.boolean().default(false)}).strict()).max(12).default([])}).strict();
export type MotionScene=z.infer<typeof motionSceneSchema>;
export type MotionKey=z.infer<typeof motionKeySchema>;
export type FocusKey=z.infer<typeof focusKeySchema>;
type Segment={from:number;durationInFrames:number};
export function keyFrame(key:Pick<MotionKey,'sentence'|'at'>,segments:Segment[]){const s=segments[key.sentence-1];return s?s.from+key.at*Math.max(0,s.durationInFrames-1):Infinity;}
export function motionPose(keys:MotionKey[],segments:Segment[],frame:number,moving=true):MotionKey{
 let i=-1;keys.forEach((k,n)=>{if(keyFrame(k,segments)<=frame)i=n;});
 if(i<0)return {...keys[0],opacity:0};
 const a=keys[i],b=keys[i+1];if(!b||!moving)return a;
 const start=keyFrame(a,segments),end=keyFrame(b,segments),raw=Math.min(1,Math.max(0,(frame-start)/(end-start))),p=a.easing==='linear'?raw:a.easing==='settle'?1-Math.pow(1-raw,3):raw*raw*(3-2*raw);
 const spatial=a.easing.startsWith('spring-')?springProgress(a.easing as typeof springNames[number],frame-start,end-start):p;
 const mix=(field:'x'|'y'|'scale'|'opacity'|'rotation'|'progress'|'fontSize'|'fontWeight'|'emphasis'|'jitter')=>a[field]+(b[field]-a[field])*(['x','y','scale','rotation'].includes(field)?spatial:p);
 return {...a,x:mix('x'),y:mix('y'),scale:mix('scale'),opacity:mix('opacity'),rotation:mix('rotation'),progress:mix('progress'),fontSize:mix('fontSize'),fontWeight:mix('fontWeight'),emphasis:mix('emphasis'),jitter:mix('jitter')};
}
/** Per-object focus state: focused items stay clear, others dim and optionally blur. Membership changes interpolate. */
export function focusPose(focus:FocusKey[],segments:Segment[],frame:number,id:string,moving=true){
 let i=-1;focus.forEach((k,n)=>{if(keyFrame(k,segments)<=frame)i=n;});
 if(i<0)return {dim:1,blur:0,active:true};
 const state=(k:FocusKey)=>k.ids.includes(id)?{dim:1,blur:0,active:true}:{dim:k.dimOpacity,blur:k.blur,active:false};
 const a=state(focus[i]),next=focus[i+1];
 if(!next||!moving)return a;
 const b=state(next),end=keyFrame(next,segments),start=end-12;
 const raw=Math.min(1,Math.max(0,(frame-start)/12)),p=raw*raw*(3-2*raw);
 const dim=a.dim+(b.dim-a.dim)*p,blur=a.blur+(b.blur-a.blur)*p;
 return {dim,blur,active:dim>.99};
}
/** Camera keys have their own zoom range (1–2.4); never route them through the object scale schema. */
export function cameraPose(keys:NonNullable<MotionScene['camera']>,segments:Segment[],frame:number,moving=true){
 let i=-1;keys.forEach((k,n)=>{if(keyFrame(k,segments)<=frame)i=n;});
 if(i<0)return {...keys[0],scale:keys[0].zoom};
 const a=keys[i],b=keys[i+1];
 if(!b||!moving)return {...a,scale:a.zoom};
 const start=keyFrame(a,segments),end=keyFrame(b,segments),raw=Math.min(1,Math.max(0,(frame-start)/(end-start)));
 const easing=a.easing??'smooth';
 const p=easing==='linear'?raw:easing==='settle'?1-Math.pow(1-raw,3):easing.startsWith('spring-')?springProgress(easing as typeof springNames[number],frame-start,end-start):raw*raw*(3-2*raw);
 const mix=(f:'x'|'y'|'zoom')=>a[f]+(b[f]-a[f])*p;
 return {x:mix('x'),y:mix('y'),zoom:mix('zoom'),scale:mix('zoom')};
}
export function toneMix(a:string,b:string,p:number){return '#'+[0,1,2].map(i=>Math.round(parseInt(a.slice(1+i*2,3+i*2),16)*(1-p)+parseInt(b.slice(1+i*2,3+i*2),16)*p).toString(16).padStart(2,'0')).join('');}
export const motionSceneGuide=`连续过程MotionSceneBlock props={description,objects,links?,camera?,stagger?}。${effectsGuide} 关键帧另支持fontSize:16～60（默认22）、fontWeight:400～900（默认700，字体不支持连续字重时分档）、emphasis:0～1（默认1，正常文字渐变为对象tone强调色）、jitter:0～3（舞台单位微抖幅度，默认0，帧驱动非随机）、easing:smooth|linear|settle|spring-soft|spring-bouncy|spring-snappy（默认smooth，控制从本关键帧到下一帧，settle快速进入缓慢停稳且不超调；spring预设按前述空间弹簧规则）。只在短暂交接/提醒处设置jitter，前后回到0，不对整幕/阅读正文持续抖动；不高频闪烁。camera可选2～12完整关键帧[{sentence,at?,x?:10～90,y?:10～90,zoom?:1～2.4,easing?}]，中心默认50/50、zoom默认1；平滑推拉平移仅作用舞台内容，字幕/标题不动，不是整幕交叉溶解；需要保留四周安全边距，允许有意裁切但必须人工验收。字号放大要预留空间，避免框内文字溢出。这是受控二维运动舞台，不是执行代码或真实仿真。objects 1～12个，{id,label,detail?,badge?,icon?,shape:panel|token|ring|text|resource,tone:normal|accent|warning|muted|teal|rose|highlight（暖黄荧光笔式重点，随主题适配）,width?:6～65,height?:5～40,keys:[{sentence,at?:0～1,x:5～95,y:8～92,scale?:0.3～1.5,opacity?:0～1,rotation?:-720～720,progress?:0～1}]}；width/height和x/y为内部舞台百分比，x/y是中心点，矩形含缩放不得越界。keys 2～24个完整姿态快照，省略姿态字段恢复默认，不继承。sentence绑定本幕真实旁白，at为该句持续时间内比例，不是猜测秒数；关键帧时刻严格递增。引擎在关键帧间连续平滑插值，可跨句、错开、重叠、放大聚焦与重新组织；开始前对象隐藏，结束后保持。reveal可选fade|rise|wipe|typewriter|pop（默认fade，首次出现时执行，wipe为从左至右擦除，typewriter按字符逐字出现，pop带轻微过冲）；revealFrames 6～45默认16，建议12～20，过长会显得慢。float 0～3默认0为极轻的正弦漂浮（帧驱动，animation=none冻结），只给少量主体用，不要全屏抖动。capsule=true让text带圆角胶囊底座，glow=true加柔和光晕底，用于标题/关键词避免“大字报”。
badge为1～12字微标签（如“示意”“公司自报”“数据”），渲染在卡片右上角；icon限${motionIconNames.join(',')}，仅panel/token/resource显示，作为语义锚点而非装饰。panel为半透明渐变玻璃卡（细边、圆角、柔和投影），text不画框；不要把全部文字都做成卡片，也不要编造认证/来源标签。
focus可选1～12完整快照[{sentence,at?,ids:[对象ID],dimOpacity:0.05～1默认0.28,blur:0～6默认0}]：ids为当前讲解主体，其余对象自动降到dimOpacity并可高斯模糊；成员变化按句首平滑过渡，不改变对象关键帧或连线的字义时钟。聚焦集合应为读者此刻真正要看的对象，不要全员常驻焦点；animation=none立即切换。实现是视觉降噪，不是真实景深或物理遮挡。环形progress绘制弧线，resource显示管理信息/内容条，token用于明确标注的责任或访问标记；不能假称真实内存消息。links=[{id,from,to,label?,sentence,untilSentence?,flow:none|forward|reverse,periodFrames?:30～180,dashed?}]连接对象中心，跟随对象移动并在边缘结束，flow用连续行进点表达示意流转，untilSentence到句首停止并隐藏；无自动避障。animation=none冻结插值和流动但仍按关键帧时刻切换。建议复杂过程单个全宽块，pace=all；不要把连续过程写成几次高亮或统一横移，按建立→动作→接收/处理→结果组织错峰轨道，同时为阅读留停顿；静态资料不强造过程。description显示在舞台底部，注明概念示意/非实测。`;
