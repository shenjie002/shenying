import {z} from 'zod';

const short = z.string().trim().min(1).max(160);
const common = {id: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(80)};
export const leafBlockSchema = z.discriminatedUnion('type', [
  z.object({...common, type: z.literal('CodeBlock'), props: z.object({language: z.string().max(30), code: z.string().min(1).max(2000)})}).strict(),
  z.object({...common, type: z.literal('BulletBlock'), props: z.object({heading: short, bullets: z.array(short).min(1).max(5)})}).strict(),
  z.object({...common, type: z.literal('CalloutBlock'), props: z.object({variant: z.enum(['info', 'warning', 'success']), text: z.string().trim().min(1).max(300)})}).strict(),
  z.object({...common, type: z.literal('StatBlock'), props: z.object({value: short, label: short})}).strict(),
  z.object({...common, type: z.literal('DiagramBlock'), props: z.object({heading: short, nodes: z.array(short).min(2).max(5), activeNode: z.number().int().min(1).max(5).optional()})}).strict(),
]);
export const canvasLayouts = ['split-2-1', 'grid', 'stacked'] as const;
export type LeafBlock = z.infer<typeof leafBlockSchema>;
export type CanvasBlock = LeafBlock | {id: string; type: 'GroupBlock'; layout: typeof canvasLayouts[number]; blocks: CanvasBlock[]};
// Bounded recursion: at most two group levels, no arbitrary styles, URLs or executable markup.
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
  }
});
export const canvasGuide = 'CanvasSlide props={heading,layout,blocks}；layout为split-2-1（2:1分栏）、grid（两列网格）、stacked（纵向堆叠）。blocks每层1～4块，最多8个内容块，GroupBlock最多嵌套两层。每块唯一id。内容块：CodeBlock props={language,code}（静态代码，建议6行以内）；BulletBlock props={heading,bullets}（1～5项）；CalloutBlock props={variant:info|warning|success,text}；StatBlock props={value,label}（数据必须来源于原文）；DiagramBlock props={heading,nodes:[字符串],activeNode?:整数}（2～5节点横向静态箭头，activeNode从1开始）；GroupBlock={id,type:"GroupBlock",layout,blocks}没有props。其他块={id,type,props}。不支持ArchitectureBlock、ImageBlock、BrowserBlock、任意坐标、CSS或HTML。narration.target按深度优先遍历内容块从1编号，仅控制整个块首次入场及边框聚焦，不控制块内代码行、列表项、图节点。caption无解释区。按首次展示顺序安排target，代码和图内内容为静态；pace=all所有块开头显示，但边框焦点仍随讲解变化。标题固定，内容区高度受限，推荐2～4块，避免小块长文。';
