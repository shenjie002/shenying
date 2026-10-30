import {entityMotion} from '../../shared/entity-motion';
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {mechanismAt, type Mechanism} from '../../shared/mechanism';
import type {TimedScene} from '../../shared/schema';

const colors={neutral:'#b9c5da',active:'#a9d7ff',muted:'#75839c',warning:'#ffcf8e'};
export function MechanismContent({props,scene}:{props:Mechanism;scene:TimedScene}) {
  const frame=useCurrentFrame();
  const starts=scene.narrationSegments?.map(s=>s.from) ?? [];
  const {step,previous,index,progress}=mechanismAt(props,starts,frame);
  const t=scene.visual?.animation==='none'?1:progress;
  const y=(snapshot:typeof step,id:string)=>54+((snapshot.states.find(s=>s.entity===id)?.slot??props.entities.findIndex(e=>e.id===id)+1)-1)*83;
  const relations=(snapshot:typeof step,opacity:number)=><g opacity={opacity}>{snapshot.relations.map((r,i)=>{
    const a=y(snapshot,r.from),b=y(snapshot,r.to), x=680+i*48;
    return <g key={`${r.from}-${r.to}`} opacity={r.emphasis==='dim'?.3:1}><path d={`M 580 ${a} H ${x} V ${b} H 580`} fill="none" stroke="#a9bbdf" strokeWidth={r.emphasis==='highlight'?4:2} strokeDasharray={r.kind==='dashed'?'7 5':undefined}/><path d={`M 590 ${b-5} L 580 ${b} L 590 ${b+5}`} fill="none" stroke="#a9bbdf" strokeWidth={2}/><rect x={x+4} y={a+(b>a?12:-32)} width={Math.max(45,r.label.length*18+10)} height={24} rx={4} fill="#101e35"/><text x={x+8} y={a+(b>a?30:-14)} fill="#d0dcf2" fontSize={18}>{r.label}</text></g>;
  })}</g>;
  return <><div style={{display:'flex',justifyContent:'space-between',gap:10}}><h2 style={{fontSize:28,margin:'0 0 10px'}}>{props.heading}</h2><span style={{fontSize:18,color:'#98aaca'}}>概念示意 · {index+1}/{props.steps.length}</span></div>
    <svg viewBox={`0 0 1000 ${props.entities.length*83+20}`} style={{width:'100%',flex:1,minHeight:0}} aria-label={step.caption}>
      {relations(previous,1-t)}{relations(step,t)}
      {props.entities.map(e=>{const current=step.states.find(s=>s.entity===e.id)!;const old=previous.states.find(s=>s.entity===e.id)!;const motion=entityMotion(previous,step,e.id,props.entities.map(e=>e.id),t);const cy=54+(motion.slot-1)*83;const opacity=motion.opacity;const container=props.containers?.find(c=>c.id===current.container);return <g key={e.id} opacity={opacity} transform={`translate(0,${cy})`}>
        <rect x={12} y={-30} width={568} height={60} rx={10} fill="#162a47" stroke={colors[current.tone]} strokeWidth={2}/>
        <text x={30} y={7} fill="#eef4ff" fontSize={Math.min(24,185/e.label.length)}>{e.label}</text>
        <text x={245} y={7} fill={colors[old.tone]} fontSize={Math.min(22,315/old.text.length)} opacity={1-t}>{old.text}</text>
        <text x={245} y={7} fill={colors[current.tone]} fontSize={Math.min(22,315/current.text.length)} opacity={t}>{current.text}</text>
        {container&&<text x={30} y={25} fill="#a8b7d2" fontSize={12}>归属：{container.label}</text>}
      </g>;})}
    </svg><div style={{fontSize:24,lineHeight:1.5,color:'#cbd8ef',borderTop:'1px solid #ffffff22',paddingTop:12}}>{step.caption}</div>
  </>;
}
