import React,{useContext} from 'react';
import {spring,useCurrentFrame,useVideoConfig} from 'remotion';
import type {LeafBlock} from '../../shared/canvas';
import type {TimedScene} from '../../shared/schema';
import {easeProgress,stepAt} from '../../shared/advanced';
import {ThemeContext} from './PresentationContent';
export function TransferContent({block,scene}:{block:Extract<LeafBlock,{type:'TransferContainerBlock'}>;scene:TimedScene}){
 const frame=useCurrentFrame(),theme=useContext(ThemeContext),p=block.props,starts=scene.narrationSegments?.map(s=>s.from)??[],index=stepAt(p.steps,starts,frame),current=p.steps[Math.max(0,index)],previous=p.steps[Math.max(0,index-1)];
 const progress=index<=0?1:easeProgress(frame,starts[current.sentence-1],p.durationFrames,scene.visual?.animation!=='none');
 const position=(card:string,step:typeof current)=>{const container=step.assignments.find(a=>a.card===card)!.container,group=p.containers.findIndex(c=>c.id===container);return {x:group*100/p.containers.length+2,y:60+p.cards.findIndex(c=>c.id===card)*62};};
 return <div style={{height:470,position:'relative',margin:'auto 0'}}>{p.containers.map((c,i)=><div key={c.id} style={{position:'absolute',left:`${i*100/p.containers.length}%`,width:`${100/p.containers.length-1}%`,height:450,border:`1px solid ${theme.muted}`,borderRadius:12,boxSizing:'border-box',padding:12,fontSize:24}}>{c.label}</div>)}{p.cards.map(c=>{const a=position(c.id,previous),b=position(c.id,current);return <div key={c.id} style={{position:'absolute',left:`${a.x+(b.x-a.x)*progress}%`,top:a.y+(b.y-a.y)*progress,width:`${100/p.containers.length-5}%`,height:50,display:'flex',alignItems:'center',justifyContent:'center',background:theme.accent,color:theme.background,borderRadius:8,fontSize:22,overflow:'hidden'}}>{c.label}</div>;})}<small style={{position:'absolute',bottom:0,fontSize:16,color:theme.muted}}>归属变化示意 · 非真实执行</small></div>;
}
export function BalanceContent({block,scene}:{block:Extract<LeafBlock,{type:'BalanceScaleBlock'}>;scene:TimedScene}){
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),theme=useContext(ThemeContext),p=block.props,starts=scene.narrationSegments?.map(s=>s.from)??[],i=stepAt(p.steps,starts,frame),current=p.steps[Math.max(0,i)],previous=p.steps[Math.max(0,i-1)],angle=(tilt:string)=>tilt==='left'?-12:tilt==='right'?12:0;
 const progress=i<=0?1:scene.visual?.animation==='none'?1:spring({frame:frame-starts[current.sentence-1],fps,durationInFrames:p.durationFrames,config:{damping:16,stiffness:100,mass:1}}),rotation=angle(previous.tilt)+(angle(current.tilt)-angle(previous.tilt))*progress;
 return <div style={{margin:'auto 0',textAlign:'center'}}><svg viewBox="0 0 700 370" style={{width:'100%',maxHeight:390}}><path d="M350 130 L300 330 L400 330 Z" fill={theme.muted}/><g transform={`rotate(${rotation} 350 130)`}><path d="M90 130 H610" stroke={theme.accent} strokeWidth="12" strokeLinecap="round"/>{[130,570].map((x,j)=><g key={x} transform={`translate(${x} 130) rotate(${-rotation})`}><path d="M0 0 L-65 100 H65 Z" fill="none" stroke={theme.accent} strokeWidth="3"/><path d="M-65 100 Q0 170 65 100" fill={theme.accent}/><text y="-30" textAnchor="middle" fill={theme.text} fontSize="26">{j===0?p.leftLabel:p.rightLabel}</text></g>)}</g><circle cx="350" cy="130" r="14" fill={theme.warning}/></svg><div style={{fontSize:18,color:theme.muted}}>定性权衡示意 · 非重量或性能测量</div></div>;
}
