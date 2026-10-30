import React,{useContext,useId} from 'react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
import {motionPose,cameraPose,focusPose,keyFrame,toneMix,type MotionScene} from '../../shared/motion-scene';
import {staggerReveal,springProgress} from '../../shared/motion-effects';
import type {TimedScene} from '../../shared/schema';
import {ThemeContext} from './PresentationContent';
import {Brain,Workflow,Terminal,FileText,Cpu,Database,Server,Globe,Layers,Box,Sparkles,Zap,Activity,Gauge,TrendingUp,ShieldCheck,Network,GitBranch,Settings,Code2} from 'lucide-react';

const icons={Brain,Workflow,Terminal,FileText,Cpu,Database,Server,Globe,Layers,Box,Sparkles,Zap,Activity,Gauge,TrendingUp,ShieldCheck,Network,GitBranch,Settings,Code2};

export function MotionSceneContent({props:p,scene}:{props:MotionScene;scene:TimedScene}){
 const stageHeight=useVideoConfig().height>useVideoConfig().width?900:320,sy=stageHeight/100;
 const frame=useCurrentFrame(),theme=useContext(ThemeContext),segments=scene.narrationSegments??[],moving=scene.visual?.animation!=='none';
 const uid=useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const fillId=`ms-fill-${uid}`,shadowId=`ms-shadow-${uid}`;
 const camera=p.camera?cameraPose(p.camera,segments,frame,moving):undefined;
 const cameraTransform=camera?`translate(500 ${stageHeight/2}) scale(${camera.scale}) translate(${-camera.x*10} ${-camera.y*sy})`:undefined;
 const objects=p.objects.map((o,oi)=>{
  const pose=motionPose(o.keys,segments,frame,moving),group=p.stagger?.find(g=>g.objects.includes(o.id));
  const focus=focusPose(p.focus??[],segments,frame,o.id,moving);
  const first=keyFrame(o.keys[0],segments),span=Math.max(1,o.revealFrames);
  const raw=Math.min(1,Math.max(0,(frame-first)/span));
  const rp=moving?(o.reveal==='pop'?Math.min(1.2,springProgress('spring-jelly',frame-first,span)):raw*raw*(3-2*raw)):1;
  
  const entry=o.reveal==='fade'?{opacity:rp,dy:0,scale:1}
    :o.reveal==='rise'?{opacity:Math.min(1,rp*1.6),dy:(1-rp)*-26,scale:1}
    :o.reveal==='pop'?{opacity:Math.min(1,rp*1.4),dy:(1-rp)*-10,scale:0.9+0.1*rp}
    :{opacity:Math.min(1,rp*2),dy:0,scale:1};
  let visible=Math.min(1,rp);
  if(group&&moving){const start=segments[group.sentence-1]?.from??Infinity,reveal=staggerReveal(group,o.id,frame,start,moving);visible*=reveal.opacity;}
  const base={...o,pose:{...pose,opacity:pose.opacity*entry.opacity*visible,scale:pose.scale*entry.scale,y:pose.y+entry.dy/sy,revealP:Math.min(1,rp),floatPhase:oi},focus};
  if(group&&moving){const start=segments[group.sentence-1]?.from??Infinity,reveal=staggerReveal(group,o.id,frame,start,moving);
   base.pose.y+=reveal.offsetY/sy;
  }
  const drift=moving&&o.float>0?Math.sin(frame/44+oi*1.7)*o.float:0;
  base.pose.y+=drift/sy;
  return base;
 });
 const vivid=theme.openStage;
 const color=(tone:string)=>tone==='teal'?theme.teal:tone==='rose'?theme.rose:tone==='normal'?theme.text:tone==='accent'?theme.accent:tone==='warning'?theme.warning:tone==='highlight'?theme.highlight:theme.muted;
 return <div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column'}}><svg viewBox={`0 0 1000 ${stageHeight}`} style={{width:'100%',flex:1,minHeight:0}} aria-label={p.description}>
 <defs>
  <linearGradient id={fillId} x1="0" y1="0" x2="0.8" y2="1"><stop offset="0%" stopColor={theme.card} stopOpacity={0.94}/><stop offset="55%" stopColor={theme.card} stopOpacity={0.82}/><stop offset="100%" stopColor={theme.card} stopOpacity={0.64}/></linearGradient>
  {objects.filter(o=>o.reveal==='wipe').map((o,wi)=>{const w=o.width*10,left=500-w/2;return <clipPath key={wi} id={`wipe-${uid}-${p.objects.findIndex(x=>x.id===o.id)}`}><rect x={left} y={0} width={w*Math.min(1,Math.max(0,(o.pose as any).revealP))} height={stageHeight}/></clipPath>;})}
  <filter id={shadowId} x="-35%" y="-35%" width="170%" height="170%"><feDropShadow dx="0" dy="7" stdDeviation="11" floodColor="#000" floodOpacity="0.34"/></filter>
 </defs>
 <g transform={cameraTransform}>
 {p.links.map(l=>{
  const a=objects.find(o=>o.id===l.from)!,b=objects.find(o=>o.id===l.to)!,start=segments[l.sentence-1]?.from??Infinity,end=l.untilSentence?(segments[l.untilSentence-1]?.from??Infinity):Infinity;
  if(frame<start||frame>=end||a.pose.opacity<=0||b.pose.opacity<=0)return null;
  const ac={x:a.pose.x*10,y:a.pose.y*sy},bc={x:b.pose.x*10,y:b.pose.y*sy},dx=bc.x-ac.x,dy=bc.y-ac.y;
  const edge=(o:typeof a)=>Math.min(Math.abs(dx)<.001?Infinity:o.width*5*o.pose.scale/Math.abs(dx),Math.abs(dy)<.001?Infinity:o.height*sy/2*o.pose.scale/Math.abs(dy));
  const ta=Math.min(.45,edge(a)),tb=Math.min(.45,edge(b)),x1=ac.x+dx*ta,y1=ac.y+dy*ta,x2=bc.x-dx*tb,y2=bc.y-dy*tb,angle=Math.atan2(y2-y1,x2-x1);
  const phase=moving?((frame-start)%l.periodFrames)/l.periodFrames:0;
  const dim=Math.min(a.focus.dim,b.focus.dim);
  return <g key={l.id} opacity={Math.min(a.pose.opacity,b.pose.opacity)*dim} style={Math.max(a.focus.blur,b.focus.blur)>.05?{filter:`blur(${Math.max(a.focus.blur,b.focus.blur)}px)`}:undefined}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.accent} strokeWidth={2} strokeDasharray={l.dashed?'7 6':undefined}/><path d={`M${x2-12*Math.cos(angle)+6*Math.sin(angle)} ${y2-12*Math.sin(angle)-6*Math.cos(angle)} L${x2} ${y2} L${x2-12*Math.cos(angle)-6*Math.sin(angle)} ${y2-12*Math.sin(angle)+6*Math.cos(angle)}`} fill="none" stroke={theme.accent} strokeWidth={2}/>{l.flow!=='none'&&Array.from({length:3},(_,i)=>{const q=(phase+i/3)%1,t=l.flow==='reverse'?1-q:q;return <circle key={i} cx={x1+(x2-x1)*t} cy={y1+(y2-y1)*t} r={4} fill={theme.warning} opacity={.85}/>;})}{l.label&&<text x={(x1+x2)/2} y={(y1+y2)/2-12} textAnchor="middle" fontSize={18} fill={theme.muted} stroke={theme.card} strokeWidth={4} paintOrder="stroke">{l.label}</text>}</g>;
 })}
 {objects.map((o,oi)=>{const k=o.pose,w=o.width*10,h=o.height*sy,c=toneMix(theme.text,color(o.tone),k.emphasis),jitter=moving?k.jitter:0;
  const boxed=o.shape!=='text',Icon=o.icon?icons[o.icon]:undefined,withIcon=Boolean(Icon)&&boxed&&h>=60;
  const badgeW=o.badge?Math.min(Math.max(38,Array.from(o.badge).length*14+20),Math.max(46,w-28)):0;
  return <g key={o.id} opacity={k.opacity*o.focus.dim} style={o.focus.blur>.05?{filter:`blur(${o.focus.blur}px)`}:undefined} transform={`translate(${k.x*10+Math.sin(frame*.47)*jitter} ${k.y*sy+Math.sin(frame*.61+1)*jitter*.6}) rotate(${k.rotation}) scale(${k.scale})`}>
  {o.shape==='ring'?<><circle r={Math.min(w,h)/2-5} fill="none" stroke={theme.muted} strokeWidth={3}/><circle r={Math.min(w,h)/2-5} fill="none" stroke={c} strokeWidth={7} pathLength={100} strokeDasharray={`${k.progress*100} 100`} transform="rotate(-90)"/></>
   :o.shape==='panel'||o.shape==='resource'?<g><rect x={-w/2} y={-h/2} width={w} height={h} rx={Math.min(theme.radius,h/2)} fill={`url(#${fillId})`} stroke={c} strokeOpacity={0.36} strokeWidth={1.5} filter={`url(#${shadowId})`}/><line x1={-w/2+16} y1={-h/2+1.2} x2={w/2-16} y2={-h/2+1.2} stroke={c} strokeOpacity={0.35} strokeWidth={1.2}/></g>
   :o.shape==='token'?<rect x={-w/2} y={-h/2} width={w} height={h} rx={h/2} fill={o.tone==='normal'||o.tone==='muted'?theme.card:`${c}${vivid?'2a':'1c'}`} stroke={c} strokeOpacity={0.5} strokeWidth={2}/>:null}
  {o.shape==='resource'&&Array.from({length:5},(_,i)=><rect key={i} x={-w/2+16+i*(w-32)/5} y={h/2-20} width={(w-42)/5} height={5} rx={2} fill={c} opacity={Math.max(0,Math.min(1,k.progress*5-i))}/>)}
  {o.capsule&&boxed===false&&(()=>{const cw=Math.min(w,Math.max(60,Array.from(o.label).length*k.fontSize*.62+56)),ch=k.fontSize*1.9;return <g><rect x={-cw/2} y={-ch/2} width={cw} height={ch} rx={ch/2} fill={`${c}1f`} stroke={`${c}66`} strokeWidth={1.5}/>{o.glow&&<line x1={-cw/2+18} y1={ch/2-6} x2={cw/2-18} y2={ch/2-6} stroke={c} strokeOpacity={0.55} strokeWidth={2}/>}</g>;})()}
  {o.glow&&boxed&&<rect x={-w/2+6} y={h/2-8} width={w-12} height={3} rx={2} fill={c} opacity={0.5}/>}
  {withIcon&&Icon&&<g transform={`translate(${-12} ${-h/2+30})`}><Icon width={24} height={24} color={c} strokeWidth={1.8}/></g>}
  {o.badge&&boxed&&<g transform={`translate(${w/2-badgeW/2-10} ${-h/2+16})`}><rect x={-badgeW/2} y={-11} width={badgeW} height={22} rx={11} fill={c} fillOpacity={0.16} stroke={c} strokeOpacity={0.5} strokeWidth={1}/><text textAnchor="middle" y={4.5} fontSize={13} letterSpacing={1} fill={c}>{o.badge}</text></g>}
  <text textAnchor="middle" clipPath={o.reveal==='wipe'?`url(#wipe-${uid}-${oi})`:undefined} y={o.detail?(withIcon?22:-5):(withIcon?20:7)} fill={c} fontSize={k.fontSize} fontWeight={k.fontWeight}>{o.reveal==='typewriter'?Array.from(o.label).slice(0,Math.ceil(Array.from(o.label).length*(o.pose as any).revealP)).join(''):o.label}</text>
  {o.detail&&<text textAnchor="middle" y={withIcon?50:23} fill={theme.muted} fontSize={16}>{o.detail}</text>}
  </g>;})}</g></svg>{theme.cinema!==true&&<div style={{fontSize:17,lineHeight:1.4,color:theme.muted,paddingTop:8}}>{p.description}</div>}</div>;
}
