import React from 'react';
import type {z} from 'zod';
import {anchor,connectorPath,motionProgress, type Placement,connectorSchema} from '../../shared/spatial';
type Connector=z.infer<typeof connectorSchema>;
export function CanvasConnectors({connectors,placements,frame,starts,moving}:{connectors:Connector[];placements:Placement[];frame:number;starts:number[];moving:boolean}) {
 return <svg viewBox="0 0 1000 560" preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:20,overflow:'visible'}}>
 {connectors.map(c=>{
 const source=placements.find(p=>p.id===c.from),target=placements.find(p=>p.id===c.to);if(!source||!target)return null;
 const start=c.sentence?starts[c.sentence-1]:0;if(start===undefined||frame<start)return null;
 const ap=anchor(source,c.fromAnchor),bp=anchor(target,c.toAnchor),a={x:ap.x*10,y:ap.y*5.6},b={x:bp.x*10,y:bp.y*5.6};
 const d=connectorPath(a,b,c.style.route),color={neutral:'#9aaecb',accent:'#b0cdff',warning:'#f1c477'}[c.style.tone];
 const flow=c.style.motion==='flow'&&moving,pulse=c.style.motion==='pulse'&&moving,draw=c.style.motion==='draw'&&moving;
 const p=motionProgress(frame,start,24,moving),end=Math.atan2(b.y-a.y,b.x-a.x),begin=end+Math.PI;
 const arrow=(point:typeof a,angle:number)=><path d={`M ${point.x-10*Math.cos(angle)+5*Math.sin(angle)} ${point.y-10*Math.sin(angle)-5*Math.cos(angle)} L ${point.x} ${point.y} L ${point.x-10*Math.cos(angle)-5*Math.sin(angle)} ${point.y-10*Math.sin(angle)+5*Math.cos(angle)}`} stroke={color} strokeWidth={2} fill="none"/>;
 // Endpoint tangents for elbow/curve match their horizontal entry/exit direction.
 const entry=c.style.route==='straight'?end:(b.x>=a.x?0:Math.PI),exit=c.style.route==='straight'?begin:entry+Math.PI;
 return <g key={c.id} opacity={pulse?.6+.4*(Math.sin((frame-start)/15)+1)/2:1}>
 <path d={d} pathLength={100} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray={draw?'100':flow?'6 5':c.style.stroke==='dashed'?'8 5':c.style.stroke==='dotted'?'1 5':undefined} strokeDashoffset={draw?100*(1-p):flow?-(frame-start)%22:0} strokeLinecap="round"/>
 {(!draw||p===1)&&c.style.arrow!=='none'&&arrow(b,entry)}{(!draw||p===1)&&c.style.arrow==='both'&&arrow(a,exit)}
 {c.label&&<g transform={`translate(${(a.x+b.x)/2},${(a.y+b.y)/2-10})`}><rect x={-c.label.length*5-6} y={-15} width={c.label.length*10+12} height={23} rx={4} fill="#0c172b"/><text textAnchor="middle" fill={color} fontSize={16}>{c.label}</text></g>}
 </g>;
 })}</svg>;
}
