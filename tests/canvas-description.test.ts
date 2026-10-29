import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {scriptSchema} from '../shared/schema';
import {canvasBindings, canvasSummary} from '../shared/canvas-description';
import {CanvasOverview} from '../web/CanvasOverview';
import example from '../input/canvas-example.json';

test('画布组合说明可解释嵌套布局和逐句绑定，不需要阅读JSON', () => {
  const scene = scriptSchema.parse(example).scenes[0];
  assert.equal(scene.template, 'CanvasSlide');
  if (scene.template !== 'CanvasSlide') return;
  assert.equal(canvasSummary(scene.props.blocks), '代码 ＋ 节点图 ＋ 警告卡');
  assert.deepEqual(canvasBindings(scene).map(b => [b.target, b.label]), [[1, '代码'], [2, '节点图'], [3, '警告卡']]);
  const html = renderToStaticMarkup(React.createElement(CanvasOverview, {scene}));
  for (const text of ['代码 ＋ 节点图 ＋ 警告卡', '主辅分栏 · 2:1', '嵌套容器', '纵向堆叠', '#1', '#2', '#3', '不是最终画面截图', '不会高亮块内']) assert.ok(html.includes(text), text);
});

test('说明识别过渡句、越界目标及未绑定块', () => {
  const scene = scriptSchema.parse(example).scenes[0];
  if (scene.template !== 'CanvasSlide') throw new Error('missing canvas');
  const edited = {...scene, narration: [{text: '过渡句'}, {text: '失效绑定', target: 99}]};
  const bindings = canvasBindings(edited);
  assert.equal(bindings[0].label, '无绑定 · 过渡讲解');
  assert.equal(bindings[1].invalid, true);
  const html = renderToStaticMarkup(React.createElement(CanvasOverview, {scene: edited}));
  assert.match(html, /目标不存在/);
  assert.match(html, /未绑定旁白/);
});
