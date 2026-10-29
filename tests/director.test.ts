import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildMessages, parseGenerated} from '../server/article';
import {articleRequestSchema} from '../shared/article';
import {directorGuide} from '../shared/director';
import example from '../input/canvas-example.json';

test('实际生成请求包含内容驱动的选型、组合布局、旁白绑定及完整输出规则', () => {
  const messages = buildMessages(articleRequestSchema.parse({article: '本文说明字符串所有权的移动，并展示代码及移动后不可继续使用原变量的限制。'.repeat(3)}));
  assert.ok(messages[0].content.includes(directorGuide()));
  for (const text of ['CodeBlock+CalloutBlock', 'BulletBlock+StatBlock', 'DiagramBlock+CodeBlock', 'split-2-1', '完整blocks树', '每个内容块必须至少', '不强制使用CanvasSlide']) assert.ok(messages[0].content.includes(text), text);
  assert.match(messages[1].content, /自主选择单模板或CanvasSlide混合组合/);
  assert.match(messages[1].content, /完整可渲染剧本/);
});

test('AI画布必须交付完整动作编排并覆盖每个内容块，不能只给静态拼贴', () => {
  assert.doesNotThrow(() => parseGenerated(JSON.stringify(example), 1));
  const incomplete = structuredClone(example);
  incomplete.scenes[0].narration = incomplete.scenes[0].narration.slice(0, 2);
  incomplete.scenes[0].voiceover = incomplete.scenes[0].narration.map(s => s.text).join(' ');
  assert.throws(() => parseGenerated(JSON.stringify(incomplete), 1), /warning 未绑定讲解target=3/);
  const missing = structuredClone(example) as Record<string, any>;
  delete missing.scenes[0].narration;
  assert.throws(() => parseGenerated(JSON.stringify(missing), 1), /必须包含visual、subtitles和narration/);
});
