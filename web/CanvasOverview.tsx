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
    {unbound.length > 0 && <p className="canvas-binding-warning" role="status">未绑定旁白：{unbound.map(block => `#${numbers.get(block.id)} ${blockLabel(block)}`).join('、')}。这些块仍可能按默认时序入场，请核对讲解节奏。</p>}
    <p className="canvas-overview-note">绑定控制整块入场／边框聚焦，不会高亮块内某一行代码或某个图节点。重复绑定不会重复入场。</p>
  </section>;
}
