import {test} from 'node:test';
import assert from 'node:assert/strict';
import {articleRequestSchema} from '../shared/article';
import {rendererGuide, sceneCapabilities, targetCount} from '../shared/capabilities';
import {buildMessages, parseGenerated} from '../server/article';
import type {ArticleRequest} from '../shared/article';
import {scriptSchema} from '../shared/schema';
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
  for (const [template, capability] of Object.entries(sceneCapabilities)) {
    assert.match(messages[0].content, new RegExp(template));
    assert.ok(messages[0].content.includes(capability.motion));
  }
  assert.match(messages[0].content, /真实行号/);
  assert.match(messages[0].content, /不会实际执行命令/);
  assert.match(messages[0].content, /不支持任意相机路径/);
  assert.match(messages[1].content, /严格5个分镜/);
  assert.match(messages[1].content, /article/);
  assert.match(messages[1].content, /目标时长只是估算/);
});
test('动态能力映射与schema target校验共享同一个模板清单', () => {
  const scenes = scriptSchema.parse(example).scenes;
  for (const scene of scenes) assert.ok(targetCount(scene) > 0);
  const code = scenes.find(s => s.template === 'CodeSlide')!;
  if (code.template !== 'CodeSlide') throw new Error('example code scene missing');
  assert.equal(targetCount({...code, props: {...code.props, code: 'line 1\n\nline 3'}}), 3);
  assert.match(rendererGuide(), /字幕由subtitles=true开启/);
  assert.match(rendererGuide(), /按实测句首触发/);
});
test('模型分句旁白target绑定、voiceover一致和caption区域受运行时校验', () => {
  const base = example.scenes[0];
  const draft = {...example, scenes: [{...base, voiceover: '测试内容。', narration: [{text: '测试内容。'}], visual: {background: 'glow', animation: 'spring', pace: 'progressive'}, subtitles: true}]};
  assert.doesNotThrow(() => parseGenerated(JSON.stringify(draft), 1));
  const mismatched = {...draft, scenes: [{...draft.scenes[0], voiceover: '不匹配'}]};
  assert.throws(() => parseGenerated(JSON.stringify(mismatched), 1), /voiceover/);
  const titleTarget = {...draft, scenes: [{...draft.scenes[0], narration: [{text: '测试内容。', target: 1}]}]};
  assert.throws(() => parseGenerated(JSON.stringify(titleTarget), 1), /标题场景/);
  const captions = {...example, scenes: [{...base, voiceover: '测试内容。', narration: [{text: '测试内容。', caption: '说明'}]}]};
  assert.throws(() => parseGenerated(JSON.stringify(captions), 1), /无caption解释区域/);
  const bullet = example.scenes.find(s => s.template === 'BulletListSlide')!;
  const reverse = {...example, scenes: [{...bullet, voiceover: '第一句。 第二句。', narration: [{text: '第一句。', target: 2}, {text: '第二句。', target: 1}]}]};
  assert.throws(() => parseGenerated(JSON.stringify(reverse), 1), /target 按首次讲解次序递增/);
});
test('generate_storyboard input is parsed as actual article request fields', () => {
  const input: ArticleRequest = articleRequestSchema.parse({article: '这是一篇资料。'.repeat(30)});
  assert.equal(input.sceneCount, 5);
});
test('生成剧本复用 schema，允许代码围栏，拒绝截断和数量错误', () => {
  assert.equal(parseGenerated(JSON.stringify(example), 5).scenes.length, 5);
  assert.equal(parseGenerated('```json\n' + JSON.stringify(example) + '\n```', 5).fps, 30);
  assert.throws(() => parseGenerated('{invalid', 5), /有效 JSON/);
  assert.throws(() => parseGenerated(JSON.stringify(example), 6), /要求 6 幕/);
  assert.throws(() => parseGenerated(JSON.stringify({...example, scenes: [{id: 'bad', template: 'Unknown'}]}), 1), /格式不符合/);
});
