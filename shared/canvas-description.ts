import {canvasLeaves, type CanvasBlock, type LeafBlock} from './canvas';
import type {Scene} from './schema';

export const blockLabels: Record<LeafBlock['type'], string> = {
  TransferContainerBlock:'卡片归属转移',BalanceScaleBlock:'定性天平',
  RichTextBlock:'富文本',MotionSceneBlock:'连续过程舞台',ImageBlock:'图片证据',CycleBlock:'循环示意',
  MechanismBlock:'状态演示',
  TopologyBlock: '拓扑关系', CompareBlock: '对比矩阵', TimelineBlock: '时间轴', BarChartBlock: '柱状图', TreeBlock: '层级树', IconBlock: '语义图标',
  CodeBlock: '代码', BulletBlock: '要点列表', CalloutBlock: '提示卡', StatBlock: '数据卡', DiagramBlock: '节点图',
};
export const layoutLabels = {'split-2-1': '主辅分栏 · 2:1', grid: '等宽双列', stacked: '纵向堆叠', free:'自由错落画布'};
export function blockLabel(block: LeafBlock) {
  return block.type === 'CalloutBlock' ? {info: '说明卡', warning: '警告卡', success: '结论卡'}[block.props.variant] : blockLabels[block.type];
}
export function blockTitle(block: LeafBlock) {
  switch (block.type) {
    case 'MotionSceneBlock':return `${block.props.description}；${block.props.objects.map(o=>o.label).join('、')}`;
    case 'RichTextBlock':return block.props.segments.map(s=>s.text).join('');
    case 'TransferContainerBlock':return `${block.props.containers.map(c=>c.label).join(' ↔ ')}；${block.props.cards.map(c=>c.label).join('、')}`;
    case 'BalanceScaleBlock':return `${block.props.leftLabel} / ${block.props.rightLabel}（定性示意）`;
    case 'ImageBlock':return block.props.caption??block.props.src;
    case 'CycleBlock':return block.props.label;
    case 'MechanismBlock': return `${block.props.heading} · ${block.props.steps.length}步状态变化`;
    case 'TopologyBlock': return `${block.props.heading} · ${block.props.nodes.length}节点`;
    case 'CompareBlock': return `${block.props.heading} · ${block.props.columns.join(' / ')}`;
    case 'TimelineBlock': return `${block.props.heading} · ${block.props.events.length}阶段`;
    case 'BarChartBlock': return `${block.props.heading} · ${block.props.bars.length}项数据`;
    case 'TreeBlock': return `${block.props.heading} · ${block.props.nodes.length}节点`;
    case 'IconBlock': return `${block.props.name} · ${block.props.label}`;
    case 'CodeBlock': return `${block.props.language || '代码'} · ${block.props.code.split('\n').length} 行${block.props.focus ? ` · ${block.props.focus.length}步句首行聚焦` : ''}`;
    case 'BulletBlock': return block.props.heading;
    case 'CalloutBlock': return block.props.text;
    case 'StatBlock': return `${block.props.value} · ${block.props.label}`;
    case 'DiagramBlock': return `${block.props.heading}：${block.props.nodes.join(' → ')}`;
  }
}
export function canvasSummary(blocks: CanvasBlock[]) {return canvasLeaves(blocks).map(blockLabel).join(' ＋ ');}
export function canvasBindings(scene: Extract<Scene, {template: 'CanvasSlide'}>) {
  const leaves = canvasLeaves(scene.props.blocks);
  return (scene.narration ?? []).map((segment, index) => {
    const block = segment.target === undefined ? undefined : leaves[segment.target - 1];
    return {sentence: index + 1, text: segment.text, target: segment.target,
      label: block ? blockLabel(block) : segment.target === undefined ? '无绑定 · 过渡讲解' : '目标不存在',
      title: block ? blockTitle(block) : '', invalid: segment.target !== undefined && !block};
  });
}
