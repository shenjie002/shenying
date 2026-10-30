import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseGenerated} from '../server/article';
import {scriptSchema, previewTimeline} from '../shared/schema';
import {codeLineAt, codeWindow} from '../shared/code-focus';
import {mechanismAt} from '../shared/mechanism';
import {rendererGuide} from '../shared/capabilities';
import {CanvasCodeFrame} from '../src/components/CanvasCodeContent';
const raw = () => JSON.parse(fs.readFileSync('input/code-mechanism-example.json', 'utf8'));

test('代码与机制使用相同句首：静音与实测时钟，all仍聚焦', () => {
  const script = parseGenerated(JSON.stringify(raw()), 2);
  for (const scene of previewTimeline(script).scenes) {
    if (scene.template !== 'CanvasSlide') continue;
    const [code, mechanism] = scene.props.blocks;
    if (code.type !== 'CodeBlock' || mechanism.type !== 'MechanismBlock') throw Error('fixture');
    for (const starts of [scene.narrationSegments!.map(s => s.from), [0, 100, 350, 600, 900]]) {
      assert.equal(codeLineAt(code.props.focus, starts, starts[2] - 1), 1);
      assert.equal(codeLineAt(code.props.focus, starts, starts[2]), 2);
      assert.equal(mechanismAt(mechanism.props, starts, starts[2] - 1).index, 0);
      assert.equal(mechanismAt(mechanism.props, starts, starts[2]).index, 1);
    }
    const html = renderToStaticMarkup(React.createElement(CanvasCodeFrame, {props: code.props, scene, frame: 0}));
    assert.match(html, /代码焦点：1行/);
    assert.match(html, /border-left:3px solid #b6c4ff/);
  }
});
test('行号含空行、允许回看，窗口有界且未到句首不提前高亮', () => {
  const steps = [{sentence: 1, line: 3}, {sentence: 2, line: 1}];
  assert.equal(codeLineAt(steps, [20, 100], 19), undefined);
  assert.equal(codeLineAt(steps, [20, 100], 20), 3);
  assert.equal(codeLineAt(steps, [20, 100], 100), 1);
  assert.equal(codeLineAt(steps, [], 1000), undefined);
  assert.equal(codeWindow(20, 20), 12);
  assert.equal(codeWindow(1, 3), 0);
  const blank = raw();
  blank.scenes[0].props.blocks[0].props.code = 'first\n\nthird';
  blank.scenes[0].props.blocks[0].props.focus[1].line = 2;
  assert.equal(scriptSchema.safeParse(blank).success, true);
  const scene = previewTimeline(scriptSchema.parse(blank)).scenes[0];
  if (scene.template === 'CanvasSlide' && scene.props.blocks[0].type === 'CodeBlock') {
    const props = scene.props.blocks[0].props;
    assert.match(renderToStaticMarkup(React.createElement(CanvasCodeFrame, {props, scene, frame: scene.narrationSegments![2].from})), /代码焦点：2行/);
    const legacy = {...props, focus: undefined};
    assert.doesNotMatch(renderToStaticMarkup(React.createElement(CanvasCodeFrame, {props: legacy, scene, frame: 0})), /代码焦点/);
  }
  assert.equal(codeWindow(10, 20), 6);
});
test('拒绝越界、乱序、未知字段、缺失target与未入场focus', () => {
  const mutate = (fn: (v: any) => void) => {const v = raw(); fn(v); assert.equal(scriptSchema.safeParse(v).success, false);};
  mutate(v => v.scenes[0].props.blocks[0].props.focus[0].line = 4);
  mutate(v => v.scenes[0].props.blocks[0].props.focus[1].sentence = 1);
  mutate(v => v.scenes[0].props.blocks[0].props.focus[0].line = 0);
  mutate(v => v.scenes[0].props.blocks[0].props.focus[0].sentence = 50);
  mutate(v => v.scenes[0].props.blocks[0].props.focus[0].css = 'x');
  mutate(v => delete v.scenes[0].narration[0].target);
  const v = raw();
  v.scenes[0].narration[0].target = 2;
  v.scenes[0].narration[1].target = 1;
  v.scenes[0].props.blocks[1].props.steps[0].sentence = 1;
  assert.equal(scriptSchema.safeParse(v).success, false);
  assert.match(rendererGuide(), /focus.*sentence,line/);
});
