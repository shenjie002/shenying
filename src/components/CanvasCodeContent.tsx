import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {LeafBlock} from '../../shared/canvas';
import type {TimedScene} from '../../shared/schema';
import {codeLineAt, codeWindow} from '../../shared/code-focus';
import {Highlight} from './Visuals';

type CodeProps = Extract<LeafBlock, {type: 'CodeBlock'}>['props'];
export function CanvasCodeContent({props, scene}: {props: CodeProps; scene: TimedScene}) {
  const frame = useCurrentFrame();
  return <CanvasCodeFrame props={props} scene={scene} frame={frame}/>;
}
export function CanvasCodeFrame({props, scene, frame}: {props: CodeProps; scene: TimedScene; frame: number}) {
  const line = codeLineAt(props.focus, scene.narrationSegments?.map(s => s.from) ?? [], frame);
  const lines = props.code.split('\n');
  const start = codeWindow(line, lines.length);
  return <>
    <div style={{color: '#94a8d0', fontSize: 18, marginBottom: 18}}>● ● ●　{props.language}</div>
    {props.focus ? <div style={{overflow: 'hidden', minHeight: 0}} aria-label={`代码焦点：${line ?? '无'}行`}>
      {lines.slice(start, start + 8).map((text, i) => {
        const number = start + i + 1, selected = number === line;
        return <div key={number} style={{display: 'flex', fontSize: 23, lineHeight: 1.65, background: selected ? '#b6c4ff20' : 'transparent', borderLeft: `3px solid ${selected ? '#b6c4ff' : 'transparent'}`, opacity: line && !selected ? 0.6 : 1}}>
          <span style={{width: 36, flexShrink: 0, textAlign: 'right', paddingRight: 14, color: '#94a8d0', fontSize: 18}}>{number}</span>
          <pre style={{margin: 0, whiteSpace: 'pre', minWidth: 0}}><Highlight code={text || ' '}/></pre>
        </div>;
      })}
    </div> : <pre style={{margin: 0, fontSize: 24, lineHeight: 1.55, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}><Highlight code={props.code}/></pre>}
  </>;
}
