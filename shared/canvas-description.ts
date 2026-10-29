import {canvasLeaves, type CanvasBlock, type LeafBlock} from './canvas';
import type {Scene} from './schema';

export const blockLabels: Record<LeafBlock['type'], string> = {
  TopologyBlock: '拓扑关系', CompareBlock: '对比矩阵', TimelineBlock: '时间轴', BarChartBlock: '柱状图', TreeBlock: '层级树', IconBlock: '语义图标',
  CodeBlock: '代码', BulletBlock: '要点列表', CalloutBlock: '提示卡', StatBlock: '数据卡', DiagramBlock: '节点图',
};
export const layoutLabels = {'split-2-1': '主辅分栏 · 2:1', grid: '等宽双列', stacked: '纵向堆叠'};
export function blockLabel(block: LeafBlock) {
  return block.type === 'CalloutBlock' ? {info: '说明卡', warning: '警告卡', success: '结论卡'}[block.props.variant] : blockLabels[block.type];
}
export function blockTitle(block: LeafBlock) {
  switch (block.type) {
    case 'TopologyBlock': return `${block.props.heading} · ${block.props.nodes.length}节点`;
    case 'CompareBlock': return `${block.props.heading} · ${block.props.columns.join(' / ')}`;
    case 'TimelineBlock': return `${block.props.heading} · ${block.props.events.length}阶段`;
    case 'BarChartBlock': return `${block.props.heading} · ${block.props.bars.length}项数据`;
    case 'TreeBlock': return `${block.props.heading} · ${block.props.nodes.length}节点`;
    case 'IconBlock': return `${block.props.name} · ${block.props.label}`;
    case 'CodeBlock': return `${block.props.language || '代码'} · ${block.props.code.split('\n').length} 行`;
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
