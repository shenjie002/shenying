import {z} from 'zod';

const id = z.string().regex(/^[a-zA-Z0-9_-]+$/).max(40);
const label = z.string().trim().min(1).max(32);
export const mechanismSchema = z.object({
  heading: label,
  entities: z.array(z.object({id, label}).strict()).min(2).max(4),
  containers:z.array(z.object({id,label}).strict()).max(4).optional(),
  steps: z.array(z.object({
    sentence: z.number().int().min(1).max(50),
    caption: z.string().trim().min(1).max(100),
    states: z.array(z.object({entity: id, text: label, tone: z.enum(['neutral','active','muted','warning']), visible:z.boolean().optional(), slot:z.number().int().min(1).max(4).optional(), container:id.optional()}).strict()).min(2).max(4),
    relations: z.array(z.object({from: id, to: id, label: z.string().trim().min(1).max(16), kind: z.enum(['solid','dashed']), emphasis:z.enum(['normal','highlight','dim']).optional()}).strict()).max(4),
  }).strict()).min(2).max(6),
}).strict().superRefine((value, ctx) => {
  const ids = new Set(value.entities.map(e=>e.id));
  if (ids.size !== value.entities.length) ctx.addIssue({code:'custom',path:['entities'],message:'实体ID不能重复'});
  const containers=new Set(value.containers?.map(c=>c.id)??[]);
  if(containers.size!==(value.containers?.length??0))ctx.addIssue({code:'custom',message:'容器ID不能重复'});
  value.steps.forEach((step,i)=>{
    const fail=(message:string)=>ctx.addIssue({code:'custom',path:['steps',i],message});
    if(i>0 && step.sentence<=value.steps[i-1].sentence) fail('步骤句号必须严格递增');
    if(step.states.length!==ids.size || new Set(step.states.map(s=>s.entity)).size!==ids.size || step.states.some(s=>!ids.has(s.entity))) fail('每步必须为所有实体提供且仅提供一个状态');
    const slots=step.states.filter(s=>s.visible!==false).map(s=>s.slot??value.entities.findIndex(e=>e.id===s.entity)+1);
    if(new Set(slots).size!==slots.length || slots.some(slot=>slot>value.entities.length))fail('可见实体槽位必须唯一且不超出实体数');
    if(step.states.some(s=>s.container&&!containers.has(s.container)))fail('实体归属必须引用已定义容器');
    if(step.relations.some(r=>step.states.some(s=>(s.entity===r.from||s.entity===r.to)&&s.visible===false)))fail('关系不能连接隐藏实体');
    if(step.relations.some(r=>!ids.has(r.from)||!ids.has(r.to)||r.from===r.to)) fail('关系必须连接不同的已定义实体');
    if(new Set(step.relations.map(r=>`${r.from}:${r.to}`)).size!==step.relations.length) fail('同一步同方向关系不能重复');
  });
});
export type Mechanism = z.infer<typeof mechanismSchema>;

/** Pure frame selection: source is measured narration timing, never wall clock. */
export function mechanismAt(props:Mechanism, starts:number[], frame:number) {
  let index=0;
  for(let i=0;i<props.steps.length;i++) if(frame >= (starts[props.steps[i].sentence-1] ?? Infinity)) index=i;
  const from=starts[props.steps[index].sentence-1] ?? 0;
  return {index, step:props.steps[index], previous:props.steps[Math.max(0,index-1)], progress:Math.max(0,Math.min(1,(frame-from)/12))};
}
export const mechanismGuide = `MechanismBlock是受约束的状态演示，不是静态图或任意动画。props={heading,entities:[{id,label}],steps:[{sentence,caption,states:[{entity,text,tone}],relations:[{from,to,label,kind}]}]}。entities为2～4个固定身份、默认固定位置的实体，步骤2～6个。每步必须提供每个实体的完整状态快照，不继承上一帧；tone=neutral|active|muted|warning只是视觉强调，不代表自动判定事实。relations最多4个有向关系，kind=solid|dashed仅线型，不自连或重复；无关系填[]。实体label/状态text最多32字，关系label最多16字，caption最多100字。
step.sentence引用所在幕narration从1开始的句号，严格递增；每步对应句子的target必须指向该MechanismBlock的画布编号。第一步在块入场句触发（该块第一次被target引用的句号必须等于第一步sentence）；用静音估算/实测分句句首驱动。实体身份保持，默认上下位置固定；states可选visible（默认true）、slot（1～实体数的预设行位置，可见实体不可占同槽）、container（引用props.containers:[{id,label}]，最多4个容器，以归属标签显示，不是嵌套物理框）。slot改变时用12帧在预设行间移动（目标旧槽被占用时采用淡出换位避免交叉遮挡），visible改变时淡入淡出，tone用于局部强调；relations可选emphasis=normal|highlight|dim。关系不能连接隐藏实体。每个快照都必须提供全部实体，省略可选字段恢复默认，不继承上一快照。不支持自由坐标、复制操作（可预定义不同ID并显隐，但不得无依据制造副本）、任意路径或真实物理容器。状态和关系线12帧淡化过渡，不模拟执行或真实内存、不做连线追踪，animation=none立即切换状态。建议该块单独占画布主体（一个块时全宽），不要塞进窄小辅助卡片。caption在块内显示，不是scene.narration.caption。
先在内部规划：本幕理解目标→资料中的对象与关系→初始状态→每句带来的变化→结束结论，再输出JSON。只有资料明确描述状态/关系变化才用MechanismBlock；观点、长文、数据比较用现有模板，不为动画编造过程。状态文字必须真实且简短；不能仅把整段解释拆成多张卡片。`;
