import {placementsSchema,connectorSchema} from './spatial';
import {z} from 'zod';

const ref=z.string().regex(/^[a-zA-Z0-9_-]+$/).max(80);
export const cueSchema=z.array(z.object({
  sentence:z.number().int().min(1).max(50),
  layout:z.enum(['split-2-1','grid','stacked','free']).optional(),
  placements:placementsSchema.optional(),
  connectors:z.array(connectorSchema).max(12).optional(),
  focus:ref.optional(),
  blocks:z.array(z.object({id:ref,visible:z.boolean(),emphasis:z.enum(['normal','highlight','dim']),
    item:z.number().int().min(1).max(100).optional(),
  }).strict()).min(1).max(8),
}).strict()).min(1).max(30);
export type Cues=z.infer<typeof cueSchema>;
/** Complete snapshots; random seek is equivalent to sequential playback. */
export function cueAt(cues:Cues|undefined,starts:number[],frame:number) {
  let selected:Cues[number]|undefined;
  for(const cue of cues??[]) if(frame>=(starts[cue.sentence-1]??Infinity)) selected=cue;
  return selected;
}
export const cueGuide=`CanvasSlide props.cues可选，格式[{sentence,layout?,focus?,blocks:[{id,visible,emphasis,item?}]}]，1～30步，句号从1开始严格递增且必须有narration。每步blocks必须完整覆盖本幕所有叶块（GroupBlock不占），id稳定且唯一；visible为显隐，emphasis=normal|highlight|dim。每步独立完整快照，不继承前步。focus可指定一个visible叶块临时全宽展示其他块隐藏，下一步省略focus恢复布局；layout只切换根容器的split-2-1/grid/stacked，嵌套Group不改变。显隐和布局为句首即时切换，不承诺无缝形变；原旁白入场等待仍存在，使用cues控制显隐时建议visual.pace=all。
item为局部高亮的从1开始索引，仅支持DiagramBlock节点、TopologyBlock节点、BulletBlock项目、CompareBlock行、TimelineBlock阶段、BarChartBlock柱、TreeBlock节点；代码用CodeBlock.focus，机制实体/关系用MechanismBlock快照。省略item清除高亮。不是任意文字圈选。每步sentence只驱动画面，不改变旁白内容；需要同句联动时使用相同句号。不得生成任意CSS/坐标/JS。`;
