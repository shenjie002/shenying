import React from 'react';
import {Brain, Workflow, Terminal, FileText, Cpu, Database, Server, Globe, Layers, Box, Sparkles, Zap, Activity, Gauge, TrendingUp, ShieldCheck, Network, GitBranch, Settings, Code2, Check, ArrowRight, AudioLines, Lightbulb} from 'lucide-react';
import type {MasterActor} from '../../shared/master';

const icons = {Brain,Workflow,Terminal,FileText,Cpu,Database,Server,Globe,Layers,Box,Sparkles,Zap,Activity,Gauge,TrendingUp,ShieldCheck,Network,GitBranch,Settings,Code2,Check,ArrowRight,AudioLines,Lightbulb};
const doodles = {
  underline:'M8 66 Q45 54 84 64 T174 60 M20 76 Q100 65 183 72',
  circle:'M100 12 C18 5 3 40 17 64 C36 94 160 98 183 60 C201 25 146 8 88 15',
  arrow:'M12 70 Q95 80 168 25 M142 24 L174 20 L163 47',
  spark:'M100 8 L96 34 M132 20 L117 39 M150 48 L125 50 M70 20 L82 38 M49 48 L74 50 M100 70 L100 88',
};

/** All reveals use the keyframed progress value, not CSS animations or wall-clock timers. */
export function ActorGraphic({actor,progress,frame,color,k}:{actor:MasterActor;progress:number;frame:number;color:string;k:number}) {
  const Icon = actor.icon ? icons[actor.icon] : undefined;
  const p=Math.max(0,Math.min(1,progress));
  const local=Math.max(0,frame-actor.keys[0].frame);
  const size=(actor.kind==='icon'?100:38)*k;
  if(actor.kind==='ring')return <svg viewBox="0 0 160 160" style={{width:150*k,height:150*k,display:'block',margin:'0 auto 12px',overflow:'visible'}}>
    <circle cx="80" cy="80" r="66" fill="none" stroke={color} strokeOpacity={0.16} strokeWidth="7"/>
    <circle cx="80" cy="80" r="66" fill="none" stroke={color} strokeWidth="7" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p} strokeLinecap="round" transform="rotate(-90 80 80)"/>
    {Icon&&<Icon x="54" y="54" width="52" height="52" color={color} strokeWidth={1.4}/>}
  </svg>;
  if(actor.kind==='doodle')return <svg viewBox="0 0 200 100" style={{width:'100%',display:'block',overflow:'visible'}} aria-label={actor.label}>
    <path d={doodles[actor.decoration]} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p}/>
  </svg>;
  if(!Icon)return null;
  const transform=actor.iconMotion==='spin'?`rotate(${local*2}deg)`:actor.iconMotion==='pulse'?`scale(${1+Math.sin(local/12)*0.06})`:undefined;
  return <div style={{color,marginBottom:10*k,transform,transformOrigin:actor.kind==='card'?'20px center':'center'}}>
    <Icon size={size} strokeWidth={1.5} style={{display:'block',margin:actor.kind==='card'?0:'auto'}}
      ref={svg=>{if(actor.iconMotion==='draw'&&svg)svg.querySelectorAll('path,circle,rect,line,polyline,polygon,ellipse').forEach(shape=>{shape.setAttribute('pathLength','1');shape.setAttribute('stroke-dasharray','1');shape.setAttribute('stroke-dashoffset',String(1-p));});}}/>
  </div>;
}
