import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {TimedScene} from '../../shared/schema';
import {activeTarget, captionAt, eventFrame, visualOf} from '../../shared/visual';
import {motionTiming} from '../../shared/capabilities';
import {Heading, Highlight, Reveal, Window} from './Visuals';

export function SceneContent({scene}: {scene: TimedScene}) {
  const frame = useCurrentFrame();
  const all = visualOf(scene).pace === 'all';
  switch (scene.template) {
    case 'TitleSlide': return <div style={{display: 'flex', alignItems: 'center', gap: 60}}><div style={{flex: 1}}><Reveal scene={scene}><div style={{fontSize: 23, color: '#a5b4fc', letterSpacing: 6}}>THE EXPLAINER / 核心概念</div><h1 style={{fontSize: 88, lineHeight: 1.22, whiteSpace: 'pre-wrap', margin: '40px 0', overflowWrap: 'anywhere'}}>{scene.props.title}</h1></Reveal><Reveal scene={scene} delay={all ? 0 : motionTiming.titleSubtitleDelay}><p style={{fontSize: 32, color: '#acb7d2', lineHeight: 1.6}}>{scene.props.subtitle}</p></Reveal></div><div style={{width: 280, height: 280, flexShrink: 0, borderRadius: 55, background: 'linear-gradient(140deg,#a9b2ff22,#5673c408)', border: '1px solid #c0c5ff30', transform: 'rotate(-12deg)', display: 'grid', placeItems: 'center', fontSize: 160, color: '#b8c4ff'}}>◈</div></div>;
    case 'BulletListSlide': {
      const active = activeTarget(scene, frame, scene.props.bullets.length);
      return <><Heading>{scene.props.heading}</Heading>{scene.props.bullets.map((bullet, i) => <Reveal scene={scene} key={i} delay={eventFrame(scene, i, scene.props.bullets.length)}><div style={{display: 'flex', gap: 28, alignItems: 'center', fontSize: scene.props.bullets.length > 4 ? 30 : 37, margin: '14px 0', padding: '20px 28px', borderRadius: 16, border: `1px solid ${all || active === i ? '#aebaff55' : '#ffffff12'}`, background: active === i ? '#a1b2ff14' : '#ffffff05'}}><span style={{color: '#acb8ff', fontFamily: 'monospace', fontSize: 29}}>0{i + 1}</span><span style={{overflowWrap: 'anywhere'}}>{bullet}</span></div></Reveal>)}</>;
    }
    case 'CodeSlide': {
      const lines = scene.props.code.split('\n');
      const active = activeTarget(scene, frame, lines.length);
      const visibleLines = motionTiming.codeVisibleLines;
      const firstLine = all ? 0 : Math.max(0, Math.min(lines.length - visibleLines, active - 4));
      return <><Heading>{scene.props.heading}</Heading><div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 30, alignItems: 'center'}}><Window label={scene.props.language || 'code'}><div style={{padding: '22px 0', fontFamily: 'monospace', fontSize: 29, lineHeight: 1.65, height: Math.min(visibleLines, lines.length) * 48 + 44, overflow: 'hidden'}}><div style={{transform: `translateY(-${firstLine * 48}px)`}}>{lines.map((line, i) => <div key={i} style={{height: 48, whiteSpace: 'pre', display: 'flex', background: !all && active === i ? '#9aafff18' : 'transparent', borderLeft: `4px solid ${!all && active === i ? '#b6c4ff' : 'transparent'}`, opacity: all || active === i ? 1 : 0.45}}><span style={{color: '#627089', width: 68, flexShrink: 0, textAlign: 'right', paddingRight: 22}}>{i + 1}</span><span><Highlight code={line}/></span></div>)}</div></div></Window><div><div style={{fontSize: 19, letterSpacing: 3, color: '#a8b6dc'}}>CODE WALKTHROUGH</div><div style={{fontSize: 76, color: '#c4cfff', margin: '18px 0'}}>L{String(Math.max(0, active) + 1).padStart(2, '0')}</div><p style={{fontSize: 27, color: '#bec9e1', lineHeight: 1.7}}>{captionAt(scene, frame) || (all ? '完整代码视图' : '跟随高亮，逐步理解代码。')}</p><div style={{fontSize: 20, color: '#7f91b2'}}>共 {lines.length} 行 · {scene.props.language}</div></div></div></>;
    }
    case 'CardSlide': return <><Heading>{scene.props.heading}</Heading><div style={{display: 'flex', gap: 32}}>{[[scene.props.leftTitle, scene.props.leftBody], [scene.props.rightTitle, scene.props.rightBody]].map(([title, body], i) => <Reveal scene={scene} key={i} delay={eventFrame(scene, i, 2)} style={{flex: 1}}><div style={{padding: 42, minHeight: 320, borderRadius: 24, background: i ? '#8caaed18' : '#ffffff08', border: '1px solid #ffffff22'}}><div style={{fontSize: 20, color: '#91a5cd'}}>{i ? 'B / ALTERNATIVE' : 'A / APPROACH'}</div><h2 style={{fontSize: 39, color: '#b6c5ff'}}>{title}</h2><p style={{fontSize: 30, lineHeight: 1.7, overflowWrap: 'anywhere'}}>{body}</p></div></Reveal>)}</div></>;
    case 'FlowSlide': {
      const count = scene.props.steps.length, active = activeTarget(scene, frame, count);
      return <><Heading>{scene.props.heading}</Heading><p style={{fontSize: 29, color: '#a7b7d5', marginBottom: 60}}>{captionAt(scene, frame) || scene.props.description}</p><div style={{display: 'flex', alignItems: 'center', gap: 16}}>{scene.props.steps.map((step, i) => <React.Fragment key={i}>{i > 0 && <div style={{fontSize: 36, color: all || frame >= eventFrame(scene, i, count) ? '#aebfff' : '#35415b'}}>→</div>}<Reveal scene={scene} delay={eventFrame(scene, i, count)} style={{flex: 1, minWidth: 0}}><div style={{padding: '36px 22px', minHeight: 230, borderRadius: 24, background: active === i ? '#8faaff22' : '#ffffff08', border: `2px solid ${active === i ? '#a5baff' : '#ffffff22'}`}}><div style={{fontFamily: 'monospace', color: '#9bb4ee', fontSize: 24, marginBottom: 26}}>STEP 0{i + 1}</div><div style={{fontSize: count > 4 ? 28 : 34, lineHeight: 1.5, overflowWrap: 'anywhere'}}>{step}</div></div></Reveal></React.Fragment>)}</div></>;
    }
    case 'TerminalSlide': {
      const count = scene.props.commands.length;
      return <><Heading>{scene.props.heading}</Heading><Window label="Terminal — local session"><div style={{padding: '28px 36px', fontFamily: 'monospace', fontSize: count > 3 ? 26 : 31, lineHeight: 1.6}}>{scene.props.commands.map((command, i) => {
        const start = eventFrame(scene, i, count), next = i + 1 < count ? eventFrame(scene, i + 1, count) : scene.durationInFrames;
        const typingFrames = Math.max(1, Math.min(motionTiming.terminalMaxTypingFrames, Math.floor((next - start) * 0.4)));
        const chars = all ? command.length : Math.min(command.length, Math.max(0, Math.floor((frame - start) / typingFrames * command.length)));
        const done = all || frame >= start + typingFrames;
        return <Reveal scene={scene} delay={start} key={i}><div style={{marginBottom: 18}}><div style={{color: '#dbe5fa', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}><span style={{color: '#89d2b0', marginRight: 18}}>❯</span>{command.slice(0, chars)}{!done && <span style={{color: '#c2cfff'}}>▌</span>}</div><div style={{color: '#8da6c5', fontSize: 24, whiteSpace: 'pre-wrap', opacity: done ? 1 : 0}}>{scene.props.outputs[i] || ' '}</div></div></Reveal>;
      })}</div></Window><p style={{fontSize: 23, color: '#8298bc', marginTop: 24}}>模拟命令演示 · 不会实际执行命令</p></>;
    }
  }
}
