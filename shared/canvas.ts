import {z} from 'zod';

const short = z.string().trim().min(1).max(160);
const common = {id: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(80)};
export const iconNames = ['Code2','Terminal','Cpu','Database','GitBranch','Server','Globe','Layers','Network','ShieldCheck','Zap','Activity','Gauge','TrendingUp','CheckCircle2','TriangleAlert','Info','CircleX','Box','FileText','Settings','Workflow'] as const;
export const chartGuide = `新增图表块（静态内容，整块入场/聚焦，不支持图内逐项动画）：
TopologyBlock props={heading,nodes:[字符串],edges:[{from,to,label?}]}：2～6节点，1～8边，编号从1开始，不自连，仅表达资料明确的关系，不代表实际网络探测。
CompareBlock props={heading,columns:[左标题,右标题],rows:[{label,values:[左内容,右内容]}]}：1～4行，两方案中立矩阵，不默认左对右错。
TimelineBlock props={heading,events:[{label,detail?}]}：2～5个按原文顺序的日期/版本/阶段，不编造年份。
BarChartBlock props={heading,unit?,bars:[{label,value}]}：1～5个非负有限数值，至少一个正值，使用统一零基线，必须来源于文章且单位可比，不把未知量当0；不要把百分比误作百分点。不支持环形图或动态增长条。
TreeBlock props={heading,nodes:[{label,parent}]}：2～6节点，parent=0根，否则指向前面节点的从1开始编号，不支持环或后向引用。
IconBlock props={name,label,tone}：单个语义图标+短标签，tone=neutral|success|warning|danger|accent；name只允许${iconNames.join(',')}。不要JSX、SVG、URL或任意颜色，不编造图标名；与其他信息块组合，不为装饰塞满画面。
CalloutBlock会按warning/info/success自动显示对应警告/信息/成功图标，无需再加IconBlock重复警告。`;
export const leafBlockSchema = z.discriminatedUnion('type', [
  z.object({...common, type: z.literal('CodeBlock'), props: z.object({language: z.string().max(30), code: z.string().min(1).max(2000)})}).strict(),
  z.object({...common, type: z.literal('BulletBlock'), props: z.object({heading: short, bullets: z.array(short).min(1).max(5)})}).strict(),
  z.object({...common, type: z.literal('CalloutBlock'), props: z.object({variant: z.enum(['info', 'warning', 'success']), text: z.string().trim().min(1).max(300)})}).strict(),
  z.object({...common, type: z.literal('StatBlock'), props: z.object({value: short, label: short})}).strict(),
  z.object({...common, type: z.literal('DiagramBlock'), props: z.object({heading: short, nodes: z.array(short).min(2).max(5), activeNode: z.number().int().min(1).max(5).optional()})}).strict(),
  z.object({...common, type: z.literal('TopologyBlock'), props: z.object({heading: short, nodes: z.array(short).min(2).max(6), edges: z.array(z.object({from: z.number().int().min(1).max(6), to: z.number().int().min(1).max(6), label: z.string().max(40).optional()}).strict()).min(1).max(8)})}).strict(),
  z.object({...common, type: z.literal('CompareBlock'), props: z.object({heading: short, columns: z.tuple([short, short]), rows: z.array(z.object({label: short, values: z.tuple([short, short])}).strict()).min(1).max(4)})}).strict(),
  z.object({...common, type: z.literal('TimelineBlock'), props: z.object({heading: short, events: z.array(z.object({label: short, detail: z.string().max(100).optional()}).strict()).min(2).max(5)})}).strict(),
  z.object({...common, type: z.literal('BarChartBlock'), props: z.object({heading: short, unit: z.string().max(24).optional(), bars: z.array(z.object({label: short, value: z.number().finite().min(0).max(1000000000)}).strict()).min(1).max(5)})}).strict(),
  z.object({...common, type: z.literal('TreeBlock'), props: z.object({heading: short, nodes: z.array(z.object({label: short, parent: z.number().int().min(0).max(5)}).strict()).min(2).max(6)})}).strict(),
  z.object({...common, type: z.literal('IconBlock'), props: z.object({name: z.enum(iconNames), label: short, tone: z.enum(['neutral','success','warning','danger','accent'])})}).strict(),
]);
export const canvasLayouts = ['split-2-1', 'grid', 'stacked'] as const;
export type LeafBlock = z.infer<typeof leafBlockSchema>;
export type CanvasBlock = LeafBlock | {id: string; type: 'GroupBlock'; layout: typeof canvasLayouts[number]; blocks: CanvasBlock[]};
function blockSchema(depth: number): z.ZodType<CanvasBlock> {
  if (depth === 0) return leafBlockSchema;
  return z.union([leafBlockSchema, z.object({...common, type: z.literal('GroupBlock'), layout: z.enum(canvasLayouts), blocks: z.array(blockSchema(depth - 1)).min(1).max(4)}).strict()]);
}
export function canvasLeaves(blocks: CanvasBlock[]): LeafBlock[] {
  return blocks.flatMap(block => block.type === 'GroupBlock' ? canvasLeaves(block.blocks) : [block]);
}
export const canvasPropsSchema = z.object({heading: short, layout: z.enum(canvasLayouts), blocks: z.array(blockSchema(2)).min(1).max(4)}).strict().superRefine((value, ctx) => {
  const ids: string[] = [];
  const walk = (blocks: CanvasBlock[]) => blocks.forEach(b => {ids.push(b.id); if (b.type === 'GroupBlock') walk(b.blocks);});
  walk(value.blocks);
  if (new Set(ids).size !== ids.length) ctx.addIssue({code: 'custom', message: '画布块 ID 必须唯一'});
  if (canvasLeaves(value.blocks).length > 8) ctx.addIssue({code: 'custom', message: '每幕最多8个内容块'});
  for (const leaf of canvasLeaves(value.blocks)) {
    if (leaf.type === 'DiagramBlock' && leaf.props.activeNode && leaf.props.activeNode > leaf.props.nodes.length) ctx.addIssue({code: 'custom', message: 'activeNode 超出节点范围'});
    if (leaf.type === 'TopologyBlock' && leaf.props.edges.some(edge => edge.from > leaf.props.nodes.length || edge.to > leaf.props.nodes.length || edge.from === edge.to)) ctx.addIssue({code: 'custom', message: '拓扑连接必须指向不同的已定义节点'});
    if (leaf.type === 'TreeBlock' && leaf.props.nodes.some((node, i) => node.parent > i)) ctx.addIssue({code: 'custom', message: '树的parent必须为0或引用此前的节点'});
    if (leaf.type === 'BarChartBlock' && leaf.props.bars.every(bar => bar.value === 0)) ctx.addIssue({code: 'custom', message: '柱状图至少需要一个正值'});
  }
});
export const iconGuide = '图标是语义锚点，不是主内容。独立IconBlock可能造成大面积空白，应使用简短而有意义的说明，并作为辅助块搭配图表/要点。优先使用CalloutBlock内置状态图标，不能因图标强制夸大结论。';
export const canvasGuide = `CanvasSlide props={heading,layout,blocks}；layout=split-2-1（2:1）,grid（2列）,stacked（纵向）。GroupBlock可嵌套2层，每层1～4块，每幕最多8块。
DiagramBlock props={heading,nodes:[字符串],activeNode?:整数}为2～5节点线性步骤箭头，activeNode从1开始。CodeBlock props={language,code}；BulletBlock props={heading,bullets}（1～5项）；CalloutBlock props={variant:info|warning|success,text}；StatBlock props={value,label}（必须源自文章）。
${chartGuide}
${iconGuide}
narration.target按深度优先内容块从1编号，GroupBlock={id,type:"GroupBlock",layout,blocks}没有props；其他块={id,type,props}，每块唯一id。不支持ImageBlock、BrowserBlock、任意CSS/HTML/URL。GroupBlock不占号，仅控制整块入场/聚焦，不控制块内代码行、节点或柱形；caption不显示。图表与图标整块静态。选型依据文章证据，不强制使用；无真实可比数据不得构造柱图。`;
