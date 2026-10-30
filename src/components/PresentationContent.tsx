import React,{createContext,useContext} from 'react';
import {Img,staticFile,useCurrentFrame} from 'remotion';
import type {LeafBlock} from '../../shared/canvas';
import type {TimedScene} from '../../shared/schema';
import {themes} from '../../shared/themes';
export {themes} from '../../shared/themes';
export const ThemeContext=createContext(themes.blue);
export function PresentationContent({block,scene}:{block:Extract<LeafBlock,{type:'RichTextBlock'|'ImageBlock'|'CycleBlock'}>;scene:TimedScene}) {
 const frame=useCurrentFrame(),theme=useContext(ThemeContext);
 if(block.type==='RichTextBlock')return <div style={{margin:'auto 0',textAlign:block.props.align,fontSize:{body:28,title:46,hero:76}[block.props.size],fontWeight:700,lineHeight:1.3,overflowWrap:'anywhere'}}>{block.props.segments.map((s,i)=><React.Fragment key={i}>{s.breakBefore&&<br/>}<span style={{color:s.tone==='normal'?theme.text:theme[s.tone],visibility:s.sentence&&frame<(scene.narrationSegments?.[s.sentence-1]?.from??Infinity)?'hidden':'visible'}}>{s.text}</span></React.Fragment>)}</div>;
 if(block.type==='ImageBlock')return <><div style={{position:'relative',flex:1,minHeight:0}}><Img src={staticFile(block.props.src)} style={{width:'100%',height:'100%',objectFit:block.props.fit}}/>{block.props.highlight&&<div style={{position:'absolute',left:`${block.props.highlight.x}%`,top:`${block.props.highlight.y}%`,width:`${block.props.highlight.width}%`,height:`${block.props.highlight.height}%`,border:`3px solid ${theme.accent}`,boxSizing:'border-box'}}/>}</div>{block.props.caption&&<div style={{fontSize:22,marginTop:8}}>{block.props.caption}</div>}{block.props.source&&<div style={{fontSize:16,color:theme.muted,marginTop:6}}>来源：{block.props.source}</div>}</>;
 const moving=scene.visual?.animation!=='none',phase=moving?frame/block.props.periodFrames:0;
 return <div style={{margin:'auto',textAlign:'center',color:theme.accent}}><div style={{fontSize:90,lineHeight:1.2,transform:block.props.motion==='rotate'?`rotate(${phase*360}deg)`:undefined,opacity:block.props.motion==='pulse'?.6+.4*(Math.sin(phase*Math.PI*2)+1)/2:1}}>{block.props.symbol==='cycle'?'⟳':block.props.symbol==='gear'?'⚙':'↔'}</div><div style={{fontSize:28,marginTop:18}}>{block.props.label}</div><small style={{fontSize:16,color:theme.muted}}>概念示意</small></div>;
}
