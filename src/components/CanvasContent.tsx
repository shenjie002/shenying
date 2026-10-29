import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {TimedScene} from '../../shared/schema';
import {canvasLeaves, type CanvasBlock, type LeafBlock} from '../../shared/canvas';
import {activeTarget, eventFrame} from '../../shared/visual';
import {Heading, Highlight, Reveal} from './Visuals';

type CanvasScene = Extract<TimedScene, {template: 'CanvasSlide'}>;
function Content({block}: {block: LeafBlock}) {
  switch (block.type) {
    case 'CodeBlock': return <><div style={{color: '#94a8d0', fontSize: 18, marginBottom: 18}}>● ● ●　{block.props.language}</div><pre style={{margin: 0, fontSize: 24, lineHeight: 1.55, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}><Highlight code={block.props.code}/></pre></>;
    case 'BulletBlock': return <><h2 style={{fontSize: 30, margin: '0 0 20px'}}>{block.props.heading}</h2>{block.props.bullets.map((text, i) => <div key={i} style={{fontSize: 25, lineHeight: 1.5, marginBottom: 14}}>• {text}</div>)}</>;
    case 'CalloutBlock': return <div style={{fontSize: 29, lineHeight: 1.6, color: {info: '#bed6ff', warning: '#ffdc9a', success: '#a8e3c5'}[block.props.variant]}}><div style={{fontSize: 18, marginBottom: 16}}>{block.props.variant.toUpperCase()}</div>{block.props.text}</div>;
    case 'StatBlock': return <div style={{textAlign: 'center', margin: 'auto'}}><div style={{fontSize: 66, color: '#bdc9ff', fontWeight: 700}}>{block.props.value}</div><div style={{fontSize: 25, marginTop: 18}}>{block.props.label}</div></div>;
    case 'DiagramBlock': return <><h2 style={{fontSize: 28, margin: '0 0 30px'}}>{block.props.heading}</h2><div style={{display: 'flex', alignItems: 'center', gap: 12}}>{block.props.nodes.map((node, i) => <React.Fragment key={i}>{i > 0 && <span style={{color: '#a9baff'}}>→</span>}<div style={{flex: 1, padding: '24px 12px', fontSize: 23, textAlign: 'center', border: `1px solid ${block.props.activeNode === i + 1 ? '#bdcaff' : '#ffffff30'}`, borderRadius: 12, background: '#a9baff10'}}>{node}</div></React.Fragment>)}</div></>;
  }
}
export function CanvasContent({scene}: {scene: CanvasScene}) {
  const frame = useCurrentFrame();
  const leaves = canvasLeaves(scene.props.blocks);
  const active = activeTarget(scene, frame, leaves.length);
  const indexes = new Map(leaves.map((block, index) => [block.id, index]));
  const layout = (blocks: CanvasBlock[], kind: CanvasScene['props']['layout']): React.ReactNode => <div style={{display: 'grid', gridTemplateColumns: kind === 'stacked' || blocks.length === 1 ? 'minmax(0,1fr)' : kind === 'split-2-1' ? 'minmax(0,2fr) minmax(0,1fr)' : 'repeat(2,minmax(0,1fr))', gridAutoRows: 'minmax(0,1fr)', gap: 20, height: '100%', minHeight: 0, minWidth: 0}}>{blocks.map(block => {
    if (block.type === 'GroupBlock') return <div key={block.id} style={{minWidth: 0, minHeight: 0}}>{layout(block.blocks, block.layout)}</div>;
    const index = indexes.get(block.id)!;
    return <Reveal key={block.id} scene={scene} delay={eventFrame(scene, index, leaves.length)} style={{minWidth: 0, minHeight: 0, height: '100%'}}><div style={{height: '100%', boxSizing: 'border-box', borderRadius: 20, border: `2px solid ${active === index ? '#b6c4ff' : '#ffffff22'}`, background: '#101e35', padding: 26, overflow: 'hidden', display: 'flex', flexDirection: 'column', overflowWrap: 'anywhere'}}><Content block={block}/></div></Reveal>;
  })}</div>;
  return <><Heading>{scene.props.heading}</Heading><div style={{height: 560}}>{layout(scene.props.blocks, scene.props.layout)}</div></>;
}
