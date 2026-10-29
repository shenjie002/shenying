import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TimedScene} from '../../shared/schema';
import {visualOf} from '../../shared/visual';

export function Reveal({scene, delay = 0, children, style}: {scene: TimedScene; delay?: number; children: React.ReactNode; style?: React.CSSProperties}) {
  const frame = useCurrentFrame(), {fps} = useVideoConfig();
  const mode = visualOf(scene).animation;
  const local = frame - delay;
  const progress = mode === 'none' ? 1 : mode === 'spring'
    ? spring({frame: Math.max(0, local), fps, config: {damping: 22, stiffness: 110, mass: 0.8}})
    : interpolate(local, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = local < 0 ? 0 : mode === 'none' ? 1 : interpolate(local, [0, 10], [delay === 0 ? 0.65 : 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{...style, opacity, transform: `translateY(${(1 - progress) * 24}px) scale(${0.985 + progress * 0.015})`}}>{children}</div>;
}
export function Background({scene}: {scene: TimedScene}) {
  const frame = useCurrentFrame();
  const kind = visualOf(scene).background;
  const moving = visualOf(scene).animation !== 'none';
  const phase = moving ? frame / 100 : 0;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0c1427', pointerEvents: 'none'}}>
    {kind !== 'plain' && <><div style={{position: 'absolute', inset: '-15%', background: 'radial-gradient(ellipse at 78% 25%, #7560d83d, transparent 48%), radial-gradient(ellipse at 18% 80%, #208b9d24, transparent 43%)', transform: `translate(${Math.sin(phase) * 25}px, ${Math.cos(phase) * 16}px)`}}/>
      <div style={{position: 'absolute', width: 700, height: 700, right: -180, top: -240, borderRadius: '50%', border: '1px solid #b7baff18', transform: `scale(${1 + Math.sin(phase) * 0.03})`}}/>
    </>}
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
