import {MotionSceneContent} from './MotionSceneContent';
import {TransferContent,BalanceContent} from './AdvancedContent';
import {counterValue,stepAt} from '../../shared/advanced';
import {PresentationContent,ThemeContext} from './PresentationContent';
import {CanvasConnectors} from './CanvasConnectors';
import {chartProgress} from '../../shared/chart-motion';
import {cueAt} from '../../shared/cues';
import {CanvasCodeContent} from './CanvasCodeContent';
import {MechanismContent} from './MechanismContent';
import React,{useContext} from 'react';
import {Code2, Terminal, Cpu, Database, GitBranch, Server, Globe, Layers, Network, ShieldCheck, Zap, Activity, Gauge, TrendingUp, CheckCircle2, TriangleAlert, Info, CircleX, Box, FileText, Settings, Workflow} from 'lucide-react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
import type {TimedScene} from '../../shared/schema';
import {canvasLeaves, type CanvasBlock, type LeafBlock} from '../../shared/canvas';
import {canvasFocus} from '../../shared/style';
import {activeTarget, eventFrame, visualOf} from '../../shared/visual';
import {Heading, Reveal} from './Visuals';

const iconMap = {Code2, Terminal, Cpu, Database, GitBranch, Server, Globe, Layers, Network, ShieldCheck, Zap, Activity, Gauge, TrendingUp, CheckCircle2, TriangleAlert, Info, CircleX, Box, FileText, Settings, Workflow};
const iconColor = {neutral: '#b9c5da', success: '#83d6ad', warning: '#f2c776', danger: '#f08a8a', accent: '#aebaff'};
function Content({block,scene,item}: {block: LeafBlock;scene:TimedScene;item?:number}) {
  const frame=useCurrentFrame(),theme=useContext(ThemeContext);
  const progress=(index:number,count:number)=>{const motion=(block.type==='BarChartBlock'||block.type==='TimelineBlock'||block.type==='TreeBlock')?block.props.motion:undefined;return chartProgress(frame,motion?scene.narrationSegments?.[motion.sentence-1]?.from:undefined,motion?.durationFrames??24,motion?.mode,count,index,scene.visual?.animation!=='none');};
  const mark=(index:number)=>item===index+1?{background:'#a9c7ff24',outline:'2px solid #b6d6ff',borderRadius:6}:{};
  switch (block.type) {
    case 'MotionSceneBlock':return <MotionSceneContent props={block.props} scene={scene}/>;
    case 'TransferContainerBlock':return <TransferContent block={block} scene={scene}/>;
    case 'BalanceScaleBlock':return <BalanceContent block={block} scene={scene}/>;
    case 'RichTextBlock':case 'ImageBlock':case 'CycleBlock':return <PresentationContent block={block} scene={scene}/>;
    case 'MechanismBlock': return <MechanismContent props={block.props} scene={scene}/>;
    case 'CodeBlock': return <CanvasCodeContent props={block.props} scene={scene}/>;
    case 'BulletBlock': return <><h2 style={{fontSize: 30, margin: '0 0 20px'}}>{block.props.heading}</h2>{block.props.bullets.map((text, i) => <div key={i} style={{...mark(i),fontSize: 25, lineHeight: 1.5, marginBottom: 14}}>• {text}</div>)}</>;
    case 'CalloutBlock': {const Icon = block.props.variant === 'warning' ? TriangleAlert : block.props.variant === 'success' ? CheckCircle2 : Info; return <div style={{fontSize: 26, lineHeight: 1.6, color: {info: '#bed6ff', warning: '#ffdc9a', success: '#a8e3c5'}[block.props.variant]}}><Icon size={26} style={{verticalAlign: 'middle', marginRight: 10}}/>{block.props.text}</div>;}
    case 'StatBlock': return <div style={{textAlign: 'center', margin: 'auto'}}><div style={{fontSize: 66, color: '#bdc9ff', fontWeight: 700}}>{block.props.counter?(counterValue(block.props.counter,frame,scene.narrationSegments?.[block.props.counter.sentence-1]?.from??Infinity,scene.visual?.animation!=='none').toFixed(block.props.counter.decimals)+block.props.counter.unit):block.props.value}</div><div style={{fontSize: 25, marginTop: 18}}>{block.props.label}</div></div>;
    case 'DiagramBlock': return <><h2 style={{fontSize: 28, margin: '0 0 30px'}}>{block.props.heading}</h2><div style={{display: 'flex', alignItems: 'center', gap: 12}}>{block.props.nodes.map((node, i) => <React.Fragment key={i}>{i > 0 && <span style={{color: '#a9baff'}}>→</span>}<div style={{flex: 1, padding: '24px 12px', fontSize: 23, textAlign: 'center', border: `1px solid ${item === i+1 || block.props.activeNode === i + 1 ? '#bdcaff' : '#ffffff30'}`, borderRadius: 12, background: '#a9baff10'}}>{node}</div></React.Fragment>)}</div></>;
    case 'TopologyBlock': {const count=block.props.nodes.length; const point=(i:number)=>({x:80+(Math.floor(i/2)%2 === 0 ? i%2 : 1-i%2)*260,y:42+Math.floor(i/2)*95}); return <><h2 style={{fontSize:26,margin:'0 0 14px'}}>{block.props.heading}</h2><svg viewBox={`0 0 440 ${Math.ceil(count/2)*95}`} style={{width:'100%',flex:1,minHeight:0}} aria-label={block.props.heading}>{block.props.edges.map((edge,i)=>{const a=point(edge.from-1), b=point(edge.to-1); const angle=Math.atan2(b.y-a.y,b.x-a.x), dx=Math.cos(angle), dy=Math.sin(angle), offset=Math.min(Math.abs(dx)<0.001?Infinity:65/Math.abs(dx),Math.abs(dy)<0.001?Infinity:23/Math.abs(dy));const x=b.x-dx*offset,y=b.y-dy*offset;return <g key={i}><line x1={a.x+dx*offset} y1={a.y+dy*offset} x2={x} y2={y} stroke="#96abd7" strokeWidth={2}/><path d={`M ${x-9*dx+5*dy} ${y-9*dy-5*dx} L ${x} ${y} L ${x-9*dx-5*dy} ${y-9*dy+5*dx}`} fill="none" stroke="#96abd7" strokeWidth={2}/>{edge.label && <text x={(a.x+b.x)/2} y={(a.y+b.y)/2-8} textAnchor="middle" fill="#b9c7e5" fontSize={13}>{edge.label}</text>}</g>;})}{block.props.nodes.map((node,i)=>{const p=point(i);return <g key={i}><rect x={p.x-65} y={p.y-23} width={130} height={46} rx={8} fill="#162a47" stroke={item===i+1?'#f7d893':'#91a9d6'} strokeWidth={item===i+1?4:1}/><text x={p.x} y={p.y+5} textAnchor="middle" fill="#e2eaff" fontSize={14}>{node.length>14 ? node.slice(0,13)+'…' : node}</text></g>;})}</svg></>;}
    case 'CompareBlock': return <><h2 style={{fontSize:25,margin:'0 0 12px'}}>{block.props.heading}</h2><table style={{width:'100%',borderCollapse:'collapse',fontSize:23}}><thead><tr><th></th>{block.props.columns.map(c=><th key={c} style={{padding:6}}>{c}</th>)}</tr></thead><tbody>{block.props.rows.map((r,i)=><tr key={r.label} style={mark(i)}><th style={{textAlign:'left',padding:6,color:'#9daecb'}}>{r.label}</th>{r.values.map((v,i)=><td key={i} style={{padding:6,borderTop:'1px solid #ffffff20'}}>{v}</td>)}</tr>)}</tbody></table></>;
    case 'TimelineBlock': {const steps=block.props.milestones,si=steps?stepAt(steps,scene.narrationSegments?.map(s=>s.from)??[],frame):-1,current=steps&&si>=0?steps[si].event-1:-1;return <><h2 style={{fontSize:25,margin:'0 0 14px'}}>{block.props.heading}</h2><div style={{display:'grid',gap:9}}>{block.props.events.map((e,i)=><div key={i} style={{...mark(i),opacity:steps?(current<0||i>current?.4:1):progress(i,block.props.events.length),display:'grid',gridTemplateColumns:'30px 1fr',gap:8,fontSize:24,borderLeft:`2px solid ${i===current?theme.accent:theme.muted}`,padding:'8px 12px',boxShadow:i===current?`inset 3px 0 ${theme.accent}`:undefined}}><b style={{color:i===current?theme.accent:theme.muted}}>{steps?(i===current?'●':i<current?'✓':'○'):i+1}</b><div><strong>{e.label}</strong>{e.detail&&(!steps||i===current)&&<div style={{color:theme.muted,fontSize:21}}>{e.detail}</div>}</div></div>)}</div></>;}
    case 'BarChartBlock': {const max=Math.max(...block.props.bars.map(b=>b.value)); return <><h2 style={{fontSize:24,margin:'0 0 14px'}}>{block.props.heading}</h2><div style={{display:'grid',gap:10}}>{block.props.bars.map((b,i)=><div key={i} style={{...mark(i),opacity:block.props.motion?.mode==='sequence'?progress(i,block.props.bars.length):1,fontSize:22}}><div style={{display:'flex',justifyContent:'space-between'}}><span>{b.label}</span><b>{block.props.countUp?Number((b.value*progress(i,block.props.bars.length)).toFixed(2)):b.value}{block.props.unit ? ` ${block.props.unit}` : ''}</b></div><div style={{height:20,background:'#ffffff18',borderRadius:7,marginTop:4}}><div style={{width:`${b.value/max*100*(block.props.motion?.mode==='grow'?progress(i,block.props.bars.length):1)}%`,height:'100%',background:'#9eafff',borderRadius:7}}/></div></div>)}</div></>}
    case 'TreeBlock': {const depth = (index: number): number => {const parent = block.props.nodes[index].parent; return parent === 0 ? 0 : 1 + depth(parent - 1);}; return <><h2 style={{fontSize:25,margin:'0 0 12px'}}>{block.props.heading}</h2>{block.props.nodes.map((n,i)=><div key={i} style={{...mark(i),opacity:progress(i,block.props.nodes.length),padding:'5px 8px',fontSize:24,marginLeft:depth(i) * 22,borderLeft:n.parent ? '2px solid #7585aa' : undefined,color:'#dce4f8'}}>{n.parent ? '↳ ' : '◆ '}{n.label}</div>)}</>;}
    case 'IconBlock': {const Icon = iconMap[block.props.name]; return <div style={{display:'flex',alignItems:'center',gap:12,fontSize:29,color:iconColor[block.props.tone]}}><Icon size={40}/>{block.props.label}</div>;}
  }
}
type CanvasScene = Extract<TimedScene, {template: 'CanvasSlide'}>;
export function CanvasContent({scene}: {scene: CanvasScene}) {
  const theme=useContext(ThemeContext);
  const portrait=useVideoConfig().height>useVideoConfig().width;
  const frame = useCurrentFrame(), leaves = canvasLeaves(scene.props.blocks), active = activeTarget(scene, frame, leaves.length);
  const cue=cueAt(scene.props.cues,scene.narrationSegments?.map(s=>s.from)??[],frame);
  const blockState=(id:string)=>cue?.blocks.find(b=>b.id===id);
  const shown=(block:CanvasBlock):boolean=>block.type==='GroupBlock'?block.blocks.some(shown):(blockState(block.id)?.visible!==false&&(!cue?.focus||cue.focus===block.id));
  const kind=cue?.layout??scene.props.layout;
  const placements=cue?.placements??scene.props.placements??[];
  const indexes = new Map(leaves.map((block, index) => [block.id, index]));
  const layout = (blocks: CanvasBlock[], kind: CanvasScene['props']['layout']): React.ReactNode => <div style={kind==='free'?{position:'relative',height:'100%'}:{display: 'grid', gridTemplateColumns: kind === 'stacked' || blocks.filter(shown).length === 1 ? 'minmax(0,1fr)' : kind === 'split-2-1' ? 'minmax(0,2fr) minmax(0,1fr)' : 'repeat(2,minmax(0,1fr))', gridAutoRows: 'minmax(0,1fr)', gap: 20, height: '100%', minHeight: 0, minWidth: 0}}>{blocks.filter(shown).map(block => {
    if (block.type === 'GroupBlock') return <div key={block.id} style={{minWidth: 0, minHeight: 0}}>{layout(block.blocks, block.layout)}</div>;
    const index = indexes.get(block.id)!;
    const focus = canvasFocus(scene.visual?.focus ?? 'normal', active, index, frame, visualOf(scene).animation !== 'none');
    const float = scene.visual?.parallax && visualOf(scene).animation !== 'none' ? Math.sin(frame/100+index*0.7)*3 : 0;
    const openStage=block.type==='MotionSceneBlock'&&theme.openStage;
    const state=blockState(block.id);
    const rect=kind==='free'&&!cue?.focus?placements.find(p=>p.id===block.id):undefined;
    return <Reveal key={block.id} scene={scene} delay={eventFrame(scene, index, leaves.length)} style={{minWidth: 0, minHeight: 0, height:rect?`${rect.height}%`:'100%',...(rect?{position:'absolute',left:`${rect.x}%`,top:`${rect.y}%`,width:`${rect.width}%`,zIndex:rect.layer}:{})}}><div style={{...focus,opacity:state?.emphasis==='dim'?.3:state?.emphasis==='highlight'?1:focus.opacity,boxShadow:state?.emphasis==='highlight'?'0 0 0 3px #bbd7ff':focus.boxShadow,transform:`translateY(${float}px)`,height: '100%', boxSizing: 'border-box', borderRadius: 20, border: openStage?'none':`2px solid ${active === index ? theme.accent : `${theme.muted}40`}`, background: openStage?'transparent':theme.card, padding: openStage?0:26, overflow: 'hidden', display: 'flex', flexDirection: 'column', overflowWrap: 'anywhere'}}><Content block={block} scene={scene} item={state?.item}/></div></Reveal>;
  })}</div>;
  const cinema=theme.cinema===true;
  return <>{!cinema&&<Heading>{scene.props.heading}</Heading>}<div style={{height:portrait?(cinema?1400:1120):(cinema?720:560),position:'relative'}}>{layout(cue?.focus?leaves.filter(b=>b.id===cue.focus):kind==='free'?leaves:scene.props.blocks,cue?.focus?'stacked':kind)}{kind==='free'&&!cue?.focus&&<CanvasConnectors connectors={(cue?.connectors??scene.props.connectors??[]).filter(c=>leaves.some(b=>b.id===c.from&&shown(b))&&leaves.some(b=>b.id===c.to&&shown(b)))} placements={placements} frame={frame} starts={scene.narrationSegments?.map(s=>s.from)??[]} moving={visualOf(scene).animation!=='none'}/>}</div></>;
}
