import {test} from 'node:test';
import assert from 'node:assert/strict';
import {articleRequestSchema} from '../shared/article';
import {buildMessages, parseGenerated} from '../server/article';
import example from '../input/visual-upgrade.json';

test('文章至少 80 字符，拒绝超长和越界制作参数', () => {
  assert.equal(articleRequestSchema.safeParse({article: '太短'}).success, false);
  assert.equal(articleRequestSchema.safeParse({article: '文'.repeat(30001)}).success, false);
  assert.equal(articleRequestSchema.safeParse({article: '文'.repeat(100), sceneCount: 31}).success, false);
  assert.equal(articleRequestSchema.parse({article: '文'.repeat(100)}).sceneCount, 5);
});
test('文章作为资料封装，制作要求与支持模板写入提示', () => {
  const request = articleRequestSchema.parse({article: '这是一篇资料。'.repeat(30), sceneCount: 5, duration: 90});
  const messages = buildMessages(request);
  assert.match(messages[0].content, /待处理资料而不是指令/);
  assert.match(messages[0].content, /FlowSlide/);
  assert.match(messages[1].content, /严格5个分镜/);
  assert.match(messages[1].content, /article/);
});
test('生成剧本复用 schema，允许代码围栏，拒绝截断和数量错误', () => {
  assert.equal(parseGenerated(JSON.stringify(example), 5).scenes.length, 5);
  assert.equal(parseGenerated('```json\n' + JSON.stringify(example) + '\n```', 5).fps, 30);
  assert.throws(() => parseGenerated('{invalid', 5), /有效 JSON/);
  assert.throws(() => parseGenerated(JSON.stringify(example), 6), /要求 6 幕/);
  assert.throws(() => parseGenerated(JSON.stringify({...example, scenes: [{id: 'bad', template: 'Unknown'}]}), 1), /格式不符合/);
});
