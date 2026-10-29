import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TimedScene} from '../../shared/schema';
import {visualOf} from '../../shared/visual';

export function Reveal({scene, delay = 0, children, style}: {scene: TimedScene; delay?: number; children: React.ReactNode; style?: React.CSSProperties}) {
  const frame = useCurrentFrame(), {fps} = useVideoConfig();
  const mode = visualOf(scene).animation;
  const local = frame - delay;
  const progress = mode === 'none' ? 1 : ['spring', 'pop', 'flip', 'border', 'wipe'].includes(mode)
    ? spring({frame: Math.max(0, local), fps, config: {damping: 22, stiffness: 110, mass: 0.8}})
    : interpolate(local, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = local < 0 ? 0 : mode === 'none' ? 1 : interpolate(local, [0, 10], [delay === 0 ? 0.65 : 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const transform = mode === 'none' ? undefined : mode === 'pop' ? `scale(${0.85 + progress * 0.15})`
    : mode === 'flip' ? `perspective(1200px) rotateY(${(1 - progress) * -15}deg)`
    : mode === 'wipe' || mode === 'border' ? undefined : `translateY(${(1 - progress) * 24}px) scale(${0.985 + progress * 0.015})`;
  return <div style={{...style, opacity, transform, transformOrigin: 'center',
    ...(mode === 'wipe' ? {clipPath: `inset(0 ${Math.max(0, 1 - progress) * 100}% 0 0)`} : {}),
    ...(mode === 'border' ? {borderRadius: 18, boxShadow: local >= 0 && local < 30 ? `0 0 0 2px rgba(174,190,255,${Math.max(0, 1-local/30)}), 0 0 20px #9eafff24` : 'none'} : {}),
  }}>{children}</div>;
}
export function Background({scene}: {scene: TimedScene}) {
  const frame = useCurrentFrame();
  const kind = visualOf(scene).background;
  const moving = visualOf(scene).animation !== 'none';
  const phase = moving ? frame / 100 : 0;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0c1427', pointerEvents: 'none'}}>
    {(kind === 'glow' || kind === 'grid') && <><div style={{position: 'absolute', inset: '-15%', background: 'radial-gradient(ellipse at 78% 25%, #7560d83d, transparent 48%), radial-gradient(ellipse at 18% 80%, #208b9d24, transparent 43%)', transform: `translate(${Math.sin(phase) * 25}px, ${Math.cos(phase) * 16}px)`}}/>
      <div style={{position: 'absolute', width: 700, height: 700, right: -180, top: -240, borderRadius: '50%', border: '1px solid #b7baff18', transform: `scale(${1 + Math.sin(phase) * 0.03})`}}/>
    </>}
    {kind === 'aurora' && <div style={{position:'absolute',inset:'-20%',background:'radial-gradient(ellipse at 25% 35%,#537bee35,transparent 55%),radial-gradient(ellipse at 80% 65%,#a759ce30,transparent 55%)',filter:'blur(50px)',transform:`translate(${Math.sin(phase)*35}px,${Math.cos(phase)*22}px) rotate(${Math.sin(phase)*5}deg)`}}/>}
    {kind === 'grain' && <><div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at top right,#80445216,transparent 70%)'}}/>{Array.from({length:180},(_,i)=><div key={i} style={{position:'absolute',left:`${(i*73.37)%100}%`,top:`${(i*47.13)%100}%`,width:2,height:2,background:'#c1cadb',opacity:0.025+(moving ? (Math.sin(phase+i)*0.5+0.5)*0.025 : 0.015)}}/>)}</>}
    {kind === 'spotlight' && <div style={{position:'absolute',inset:'-40%',background:'linear-gradient(125deg,transparent 35%,#a6c5ed18 43%,#b5a6ed0a 49%,transparent 56%)',transform:`translateX(${Math.sin(phase)*30}px)`,opacity:0.75+Math.sin(phase)*0.1}}/>}
    {kind === 'code' && <div style={{position:'absolute',inset:'10% -5%',transform:`rotate(-8deg) translateY(${Math.sin(phase)*12}px)`,color:'#94afd5',opacity:0.045,fontFamily:'monospace',fontSize:28,lineHeight:2.2,whiteSpace:'pre',filter:'blur(1px)'}}>{Array.from({length:12},(_,i)=>`// VISUAL TEXTURE ${i+1}    fn example() { let value = 1; }    <module />`).join('\n')}</div>}
    {kind === 'grid' && <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#9faeff0a 1px, transparent 1px), linear-gradient(90deg, #9faeff0a 1px, transparent 1px)', backgroundSize: '60px 60px'}}/>}
  </div>;
}
export function Window({label, children}: {label: string; children: React.ReactNode}) {
  return <div style={{background: '#080f20', border: '1px solid #ffffff24', borderRadius: 22, overflow: 'hidden', boxShadow: '0 25px 70px #0004'}}><div style={{display: 'flex', gap: 10, alignItems: 'center', padding: '22px 28px', background: '#ffffff04', borderBottom: '1px solid #ffffff12'}}>{['#fa7972', '#efc66e', '#80cba0'].map(color => <div key={color} style={{width: 13, height: 13, borderRadius: '50%', background: color}}/>)}<span style={{fontFamily: 'monospace', fontSize: 21, marginLeft: 18, color: '#93a1c1'}}>{label}</span></div>{children}</div>;
}
export function Heading({children}: {children: React.ReactNode}) {return <h1 style={{fontSize: 58, margin: '0 0 36px', lineHeight: 1.3, overflowWrap: 'anywhere'}}>{children}</h1>;}

// Lightweight lexical highlighting, not a parser. All text stays React-escaped.
export function Highlight({code}: {code: string}) {
  const tokens = code.split(/(\/\/.*$|#[^\n]*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:fn|let|const|var|function|return|if|else|for|while|import|from|class|pub|mut|use|def|print|async|await|new|true|false|null|None)\b|\b\d+(?:\.\d+)?\b)/g);
  return <>{tokens.map((token, i) => <span key={i} style={{color: /^(\/\/|#)/.test(token) ? '#6f849c' : /^["']/.test(token) ? '#a8dbc0' : /^\d/.test(token) ? '#efc27c' : /^(fn|let|const|var|function|return|if|else|for|while|import|from|class|pub|mut|use|def|print|async|await|new|true|false|null|None)$/.test(token) ? '#b8a3ff' : '#d7e0f4'}}>{token}</span>)}</>;
}
