import {motionSceneSchema,motionSceneGuide} from './motion-scene';
import {transferSchema,balanceSchema,counterSchema,milestonesSchema,advancedGuide} from './advanced';
import {richTextSchema,imageSchema,cycleSchema,presentationGuide} from './presentation';
import {placementsSchema,connectorSchema,spatialGuide,chartMotionSchema,rectInside} from './spatial';
import {cueSchema,cueGuide} from './cues';
import {z} from 'zod';
import {codeFocusSchema} from './code-focus';
import {mechanismSchema, mechanismGuide} from './mechanism';

const short = z.string().trim().min(1).max(160);
const common = {id: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(80)};
export const iconNames = ['Code2','Terminal','Cpu','Database','GitBranch','Server','Globe','Layers','Network','ShieldCheck','Zap','Activity','Gauge','TrendingUp','CheckCircle2','TriangleAlert','Info','CircleX','Box','FileText','Settings','Workflow'] as const;
export const chartGuide = `图表块（默认静态，可选motion仅按后述规则）：
TopologyBlock props={heading,nodes:[字符串],edges:[{from,to,label?}]}：2～6节点，1～8边，编号从1开始，不自连，仅表达资料明确的关系，不代表实际网络探测。
CompareBlock props={heading,columns:[左标题,右标题],rows:[{label,values:[左内容,右内容]}]}：1～4行，两方案中立矩阵，不默认左对右错。
TimelineBlock props={heading,events:[{label,detail?}]}：2～5个按原文顺序的日期/版本/阶段，不编造年份。
BarChartBlock props={heading,unit?,bars:[{label,value}]}：1～5个非负有限数值，至少一个正值，使用统一零基线，必须来源于文章且单位可比，不把未知量当0；不要把百分比误作百分点。可选motion.grow显露柱形，不支持环形图。
TreeBlock props={heading,nodes:[{label,parent}]}：2～6节点，parent=0根，否则指向前面节点的从1开始编号，不支持环或后向引用。
IconBlock props={name,label,tone}：单个语义图标+短标签，tone=neutral|success|warning|danger|accent；name只允许${iconNames.join(',')}。不要JSX、SVG、URL或任意颜色，不编造图标名；与其他信息块组合，不为装饰塞满画面。
CalloutBlock会按warning/info/success自动显示对应警告/信息/成功图标，无需再加IconBlock重复警告。`;
export const leafBlockSchema = z.discriminatedUnion('type', [
  z.object({...common,type:z.literal('MotionSceneBlock'),props:motionSceneSchema}).strict(),
  z.object({...common,type:z.literal('TransferContainerBlock'),props:transferSchema}).strict(),
  z.object({...common,type:z.literal('BalanceScaleBlock'),props:balanceSchema}).strict(),
  z.object({...common,type:z.literal('RichTextBlock'),props:richTextSchema}).strict(),
  z.object({...common,type:z.literal('ImageBlock'),props:imageSchema}).strict(),
  z.object({...common,type:z.literal('CycleBlock'),props:cycleSchema}).strict(),
  z.object({...common, type:z.literal('MechanismBlock'),props:mechanismSchema}).strict(),
  z.object({...common, type: z.literal('CodeBlock'), props: z.object({language: z.string().max(30), code: z.string().min(1).max(2000), focus: codeFocusSchema.optional()})}).strict(),
  z.object({...common, type: z.literal('BulletBlock'), props: z.object({heading: short, bullets: z.array(short).min(1).max(5)})}).strict(),
  z.object({...common, type: z.literal('CalloutBlock'), props: z.object({variant: z.enum(['info', 'warning', 'success']), text: z.string().trim().min(1).max(300)})}).strict(),
  z.object({...common, type: z.literal('StatBlock'), props: z.object({value: short, label: short,counter:counterSchema.optional()})}).strict(),
  z.object({...common, type: z.literal('DiagramBlock'), props: z.object({heading: short, nodes: z.array(short).min(2).max(5), activeNode: z.number().int().min(1).max(5).optional()})}).strict(),
  z.object({...common, type: z.literal('TopologyBlock'), props: z.object({heading: short, nodes: z.array(short).min(2).max(6), edges: z.array(z.object({from: z.number().int().min(1).max(6), to: z.number().int().min(1).max(6), label: z.string().max(40).optional()}).strict()).min(1).max(8)})}).strict(),
  z.object({...common, type: z.literal('CompareBlock'), props: z.object({heading: short, columns: z.tuple([short, short]), rows: z.array(z.object({label: short, values: z.tuple([short, short])}).strict()).min(1).max(4)})}).strict(),
  z.object({...common, type: z.literal('TimelineBlock'), props: z.object({heading: short, events: z.array(z.object({label: short, detail: z.string().max(100).optional()}).strict()).min(2).max(5),motion:chartMotionSchema.optional(),milestones:milestonesSchema.optional()})}).strict(),
  z.object({...common, type: z.literal('BarChartBlock'), props: z.object({heading: short, unit: z.string().max(24).optional(), bars: z.array(z.object({label: short, value: z.number().finite().min(0).max(1000000000)}).strict()).min(1).max(5),motion:chartMotionSchema.optional(),countUp:z.boolean().optional()})}).strict(),
  z.object({...common, type: z.literal('TreeBlock'), props: z.object({heading: short, nodes: z.array(z.object({label: short, parent: z.number().int().min(0).max(5)}).strict()).min(2).max(6),motion:chartMotionSchema.optional()})}).strict(),
  z.object({...common, type: z.literal('IconBlock'), props: z.object({name: z.enum(iconNames), label: short, tone: z.enum(['neutral','success','warning','danger','accent'])})}).strict(),
]);
export const canvasLayouts = ['split-2-1', 'grid', 'stacked','free'] as const;
export type LeafBlock = z.infer<typeof leafBlockSchema>;
export type CanvasBlock = LeafBlock | {id: string; type: 'GroupBlock'; layout: typeof canvasLayouts[number]; blocks: CanvasBlock[]};
function blockSchema(depth: number): z.ZodType<CanvasBlock,z.ZodTypeDef,unknown> {
  if (depth === 0) return leafBlockSchema;
  return z.union([leafBlockSchema, z.object({...common, type: z.literal('GroupBlock'), layout: z.enum(canvasLayouts), blocks: z.array(blockSchema(depth - 1)).min(1).max(4)}).strict()]);
}
export function canvasLeaves(blocks: CanvasBlock[]): LeafBlock[] {
  return blocks.flatMap(block => block.type === 'GroupBlock' ? canvasLeaves(block.blocks) : [block]);
}
export const canvasPropsSchema = z.object({heading: short, layout: z.enum(canvasLayouts), placements:placementsSchema.optional(),connectors:z.array(connectorSchema).max(12).optional(), cues:cueSchema.optional(), blocks: z.array(blockSchema(2)).min(1).max(4)}).strict().superRefine((value, ctx) => {
  const ids: string[] = [];
  const walk = (blocks: CanvasBlock[]) => blocks.forEach(b => {ids.push(b.id); if (b.type === 'GroupBlock') walk(b.blocks);});
  walk(value.blocks);
  if (new Set(ids).size !== ids.length) ctx.addIssue({code: 'custom', message: '画布块 ID 必须唯一'});
  if (canvasLeaves(value.blocks).length > 8) ctx.addIssue({code: 'custom', message: '每幕最多8个内容块'});
  const leaves=canvasLeaves(value.blocks);
  const checkPlacement=(placed:typeof value.placements)=>placed?.length===leaves.length&&new Set(placed.map(p=>p.id)).size===leaves.length&&placed.every(p=>leaves.some(l=>l.id===p.id)&&rectInside(p));
  if(value.layout==='free'&&!checkPlacement(value.placements))ctx.addIssue({code:'custom',path:['placements'],message:'free布局placements须完整覆盖每个块，ID唯一且矩形位于画布内'});
  const checkConnectors=(connectors:typeof value.connectors)=>!connectors||new Set(connectors.map(c=>c.id)).size===connectors.length&&connectors.every(c=>c.from!==c.to&&leaves.some(l=>l.id===c.from)&&leaves.some(l=>l.id===c.to));
  if(!checkConnectors(value.connectors))ctx.addIssue({code:'custom',path:['connectors'],message:'连线必须连接不同已定义叶块且ID唯一'});
  if(value.layout!=='free'&&(value.placements||value.connectors))ctx.addIssue({code:'custom',message:'placements/connectors仅适用于free布局'});
  const walkGroups=(blocks:CanvasBlock[])=>blocks.forEach(b=>{if(b.type==='GroupBlock'){if(b.layout==='free')ctx.addIssue({code:'custom',message:'GroupBlock不支持free布局，使用根free平铺叶块'});walkGroups(b.blocks);}});walkGroups(value.blocks);
  value.cues?.forEach((cue,i)=>{
    const fail=(message:string)=>ctx.addIssue({code:'custom',path:['cues',i],message});
    if(i>0&&cue.sentence<=value.cues![i-1].sentence) fail('画布步骤句号必须递增');
    if((cue.layout??value.layout)==='free'&&!checkPlacement(cue.placements??value.placements))fail('free布局cue必须提供完整有效placements');
    if(!checkConnectors(cue.connectors))fail('cue连线引用无效');
    if(cue.blocks.length!==leaves.length||new Set(cue.blocks.map(b=>b.id)).size!==leaves.length||cue.blocks.some(b=>!leaves.some(l=>l.id===b.id))) fail('每步必须完整覆盖全部叶块ID');
    if(cue.focus&&!cue.blocks.some(b=>b.id===cue.focus&&b.visible)) fail('focus必须指向本步可见叶块');
    cue.blocks.forEach(b=>{if(!b.item)return;const leaf=leaves.find(l=>l.id===b.id);const limit=leaf?.type==='DiagramBlock'||leaf?.type==='TopologyBlock'||leaf?.type==='TreeBlock'?leaf.props.nodes.length:leaf?.type==='BulletBlock'?leaf.props.bullets.length:leaf?.type==='CompareBlock'?leaf.props.rows.length:leaf?.type==='TimelineBlock'?leaf.props.events.length:leaf?.type==='BarChartBlock'?leaf.props.bars.length:0;if(b.item>limit)fail('item超出该块支持的局部高亮范围');});
  });
  for (const leaf of leaves) {
    const fail=(message:string)=>ctx.addIssue({code:'custom',message});
    if(leaf.type==='MotionSceneBlock'){
      const p=leaf.props,ids=p.objects.map(o=>o.id);if(new Set(ids).size!==ids.length)fail('运动对象ID必须唯一');
      const grouped=p.stagger?.flatMap(g=>g.objects)??[];
      if(new Set(grouped).size!==grouped.length||grouped.some(id=>!ids.includes(id)))fail('错峰对象ID必须存在且不得跨组重复');
      p.focus?.forEach(f=>{if(new Set(f.ids).size!==f.ids.length||f.ids.some(id=>!ids.includes(id)))fail('focus引用必须唯一且为已定义运动对象');});
      p.stagger?.forEach(g=>g.objects.forEach(id=>{const first=p.objects.find(o=>o.id===id)?.keys[0];if(!first||first.sentence!==g.sentence||first.at!==0)fail('错峰对象首关键帧必须匹配组sentence且at=0');}));
      if(new Set(p.links.map(l=>l.id)).size!==p.links.length||p.links.some(l=>l.from===l.to||!ids.includes(l.from)||!ids.includes(l.to)||l.untilSentence!==undefined&&l.untilSentence<=l.sentence))fail('运动连线引用或时间范围无效');
      p.objects.forEach(o=>{if(o.keys.some(k=>k.x-o.width*k.scale/2<0||k.x+o.width*k.scale/2>100||k.y-o.height*k.scale/2<0||k.y+o.height*k.scale/2>100))fail('运动对象边界越界');});
    }
    if(leaf.type==='TransferContainerBlock'){
      const p=leaf.props,cs=p.cards.map(c=>c.id),groups=p.containers.map(c=>c.id);
      if(new Set(cs).size!==cs.length||new Set(groups).size!==groups.length)fail('容器和卡片各自ID必须唯一');
      p.steps.forEach(s=>{if(s.assignments.length!==cs.length||new Set(s.assignments.map(a=>a.card)).size!==cs.length||s.assignments.some(a=>!cs.includes(a.card)||!groups.includes(a.container)))fail('转移步骤必须完整覆盖卡片并引用有效容器');});
    }
    if(leaf.type==='StatBlock'&&leaf.props.counter){const c=leaf.props.counter;if(leaf.props.value!==c.to.toFixed(c.decimals)+c.unit||c.kind==='reveal'&&c.from!==0)fail('计数最终值必须匹配value，reveal必须从0开始');}
    if(leaf.type==='BarChartBlock'&&leaf.props.countUp&&leaf.props.motion?.mode!=='grow')fail('countUp仅用于grow柱形显露');
    if(leaf.type==='TimelineBlock'&&leaf.props.milestones){if(leaf.props.motion)fail('时间轴milestones不能与motion混用');if(leaf.props.milestones.some(s=>s.event>leaf.props.events.length))fail('时间轴event越界');}
    if(leaf.type==='ImageBlock'&&leaf.props.highlight){const r=leaf.props.highlight;if(r.x+r.width>100||r.y+r.height>100)ctx.addIssue({code:'custom',message:'图片高亮框不能越界'});}
    if((leaf.type==='TimelineBlock'||leaf.type==='TreeBlock')&&leaf.props.motion?.mode==='grow')ctx.addIssue({code:'custom',message:'时间轴与树只支持sequence/none'});
    if (leaf.type === 'DiagramBlock' && leaf.props.activeNode && leaf.props.activeNode > leaf.props.nodes.length) ctx.addIssue({code: 'custom', message: 'activeNode 超出节点范围'});
    if (leaf.type === 'TopologyBlock' && leaf.props.edges.some(edge => edge.from > leaf.props.nodes.length || edge.to > leaf.props.nodes.length || edge.from === edge.to)) ctx.addIssue({code: 'custom', message: '拓扑连接必须指向不同的已定义节点'});
    if (leaf.type === 'TreeBlock' && leaf.props.nodes.some((node, i) => node.parent > i)) ctx.addIssue({code: 'custom', message: '树的parent必须为0或引用此前的节点'});
    if (leaf.type === 'BarChartBlock' && leaf.props.bars.every(bar => bar.value === 0)) ctx.addIssue({code: 'custom', message: '柱状图至少需要一个正值'});
  }
});
export const iconGuide = '图标是语义锚点，不是主内容。独立IconBlock可能造成大面积空白，应使用简短而有意义的说明，并作为辅助块搭配图表/要点。优先使用CalloutBlock内置状态图标，不能因图标强制夸大结论。';
export const canvasGuide = `CanvasSlide props={heading,layout,blocks}；layout=split-2-1（2:1）,grid（2列）,stacked（纵向）。GroupBlock可嵌套2层，每层1～4块，每幕最多8块。
DiagramBlock props={heading,nodes:[字符串],activeNode?:整数}为2～5节点线性步骤箭头，activeNode从1开始。BalanceScaleBlock/TransferContainerBlock分别按高级动作句号切换定性倾角/卡片归属；StatBlock.counter按句首计数，BarChartBlock.countUp依随柱形显露，TimelineBlock.milestones标出当前状态。详见前置契约。CodeBlock props={language,code,focus?:[{sentence,line}]}；focus绑定本幕旁白句首与真实代码行号（含空行），严格递增sentence，允许回看行；每步句子必须有有效画布target，可以指向同句联动的MechanismBlock，不要求target指向代码块。代码块仍须至少有一句target引用，首次focus不得早于代码块首次target句。未提供focus时保持静态；提供后按句首聚焦并自动展示当前行附近最多8行，pace=all不取消内部行聚焦。可用grid等宽分栏实现左代码右机制，二者用相同sentence联动，不支持无缝变形或自由镜头；BulletBlock props={heading,bullets}（1～5项）；CalloutBlock props={variant:info|warning|success,text}；StatBlock props={value,label}（必须源自文章）。
${motionSceneGuide}
${advancedGuide}
${presentationGuide}
${spatialGuide}
${cueGuide}
${mechanismGuide}
${chartGuide}
${iconGuide}
narration.target按深度优先内容块从1编号，GroupBlock={id,type:"GroupBlock",layout,blocks}没有props；其他块={id,type,props}，每块唯一id。支持受控本地ImageBlock，不支持BrowserBlock、任意CSS/HTML/URL。GroupBlock不占号，target仅控制内容块整块入场/聚焦，不控制块内代码行、节点或柱形（块内动作另用声明字段）；caption不显示。内部动作分别使用CodeBlock.focus、MechanismBlock.steps、MotionSceneBlock的keys/camera/links、BarChart.motion/countUp、Timeline.motion或milestones、Tree.motion及StatBlock.counter；画布局部强调使用受支持的cues.item，不把它写成target。未声明内部动作的图表图标保持静态。选型依据文章证据，不强制使用；无真实可比数据不得构造柱图。`;
