import type {Scene} from '../shared/schema';
import {canvasLeaves, type CanvasBlock} from '../shared/canvas';
import {blockLabel, blockTitle, canvasBindings, canvasSummary, layoutLabels} from '../shared/canvas-description';

type CanvasScene = Extract<Scene, {template: 'CanvasSlide'}>;
export function CanvasOverview({scene}: {scene: CanvasScene}) {
  const leaves = canvasLeaves(scene.props.blocks);
  const numbers = new Map(leaves.map((block, index) => [block.id, index + 1]));
  const bindings = canvasBindings(scene);
  const draw = (blocks: CanvasBlock[], layout: CanvasScene['props']['layout']) => <div className={`canvas-map canvas-map-${layout}${blocks.length === 1 ? ' canvas-map-single' : ''}`}>{blocks.map(block => block.type === 'GroupBlock'
    ? <div className="canvas-map-group" key={block.id}><div className="canvas-map-group-title">嵌套容器 · {layoutLabels[block.layout]}</div>{draw(block.blocks, block.layout)}</div>
    : <div className={`canvas-map-block canvas-map-${block.type}`} key={block.id}><div className="canvas-map-block-heading"><b>#{numbers.get(block.id)}</b><strong>{blockLabel(block)}</strong></div><p title={blockTitle(block)}>{blockTitle(block)}</p><code>{block.id}</code></div>)}</div>;
  const unbound = leaves.filter(block => !scene.narration?.some(segment => segment.target === numbers.get(block.id)));
  return <section className="canvas-overview" aria-label="画布组合说明"><div className="canvas-overview-heading"><strong>{canvasSummary(scene.props.blocks)}</strong><span>{leaves.length} 个内容块 · {layoutLabels[scene.props.layout]}</span></div>
    <p className="canvas-overview-note">下面是布局结构示意，不是最终画面截图。编号对应旁白 target，嵌套容器不占编号。</p>
    <div aria-label="布局结构示意">{draw(scene.props.blocks, scene.props.layout)}</div>
    <details className="canvas-binding-details" open><summary>旁白 → 画面绑定 · {bindings.length} 句</summary>{bindings.length ? <ol className="canvas-binding-list">{bindings.map(binding => <li key={binding.sentence}><span className={binding.invalid ? 'canvas-binding-error' : 'canvas-binding-target'}>{binding.target === undefined ? binding.label : `#${binding.target} ${binding.label}`}</span><p>{binding.text}</p>{binding.title && <small>{binding.title}</small>}</li>)}</ol> : <p className="canvas-overview-note">未设置分句旁白，内容块会按默认节奏依次展示。</p>}</details>
    {leaves.some(block => block.type === 'IconBlock') && <p className="canvas-binding-warning" role="status">包含独立语义图标块：请确认它作为辅助信息，不会占用过大的空白区域；警告与提示优先使用自带图标的提示卡。</p>}
    {scene.props.layout==='free'&&<div className="canvas-binding-details"><strong>自由布局 · 百分比坐标</strong><ul>{scene.props.placements?.map(p=><li key={p.id}>{p.id}：位置({p.x}, {p.y}) · 尺寸{p.width}×{p.height} · 层{p.layer}</li>)}</ul><p>{scene.props.connectors?.length??0}条跨块连线；结构缩略图不代表真实坐标，请在播放器检查遮挡。</p></div>}
    {scene.props.cues&&<details open className="canvas-binding-details"><summary>幕内视图与显隐 · {scene.props.cues.length}步</summary><ol>{scene.props.cues.map(cue=><li key={cue.sentence}>第{cue.sentence}句：{cue.focus?`全宽聚焦 ${cue.focus}`:`布局 ${cue.layout??scene.props.layout}`} · 可见 {cue.blocks.filter(b=>b.visible).map(b=>b.id).join('、')}</li>)}</ol><p>按旁白句首切换；修改ID或旁白后需重新校验。</p></details>}
    {unbound.length > 0 && <p className="canvas-binding-warning" role="status">未绑定旁白：{unbound.map(block => `#${numbers.get(block.id)} ${blockLabel(block)}`).join('、')}。这些块仍可能按默认时序入场，请核对讲解节奏。</p>}
    {leaves.filter(block=>block.type==='MechanismBlock').map(block=><details key={block.id} className="canvas-binding-details" open><summary>状态演示 · {block.props.heading}</summary><ol>{block.props.steps.map(step=><li key={step.sentence}>第{step.sentence}句：{step.caption}（{step.relations.length}条关系）</li>)}</ol><p>实体位置保持不变，句首更新状态与关系；静音为估算时序，不是程序执行记录。</p></details>)}
    {leaves.filter(block=>block.type==='CodeBlock' && block.props.focus).map(block=>block.type==='CodeBlock' && <details key={block.id} className="canvas-binding-details" open><summary>代码行联动 · {block.id}</summary><ol>{block.props.focus?.map(step=><li key={step.sentence}>第{step.sentence}句 → 第{step.line}行</li>)}</ol></details>)}
    <p className="canvas-overview-note">target控制整块入场／边框聚焦，重复绑定不会重复入场。CodeBlock.focus按句首聚焦代码行，MechanismBlock.steps.sentence按同一时钟更新状态快照；可使用相同句号联动，不是程序执行或逐词对齐。</p>
  </section>;
}
