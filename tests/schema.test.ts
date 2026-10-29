import {test} from 'node:test';
import assert from 'node:assert/strict';
import example from '../script.json';
import {scriptSchema, previewTimeline} from '../shared/schema';
import {hashScript} from '../server/pipeline';

test('示例剧本有效，静音帧数为正整数且总和一致', () => {
  const script = scriptSchema.parse(example), timeline = previewTimeline(script);
  assert.equal(timeline.mode, 'silent');
  assert.equal(timeline.totalFrames, timeline.scenes.reduce((n, s) => n + s.durationInFrames, 0));
  assert.ok(timeline.scenes.every(s => Number.isInteger(s.durationInFrames) && s.durationInFrames > 0));
  assert.ok(timeline.scenes.every(s => !s.audioSrc));
});
test('重复 ID、未知模板、空旁白和超量要点被拒绝', () => {
  const script = scriptSchema.parse(example);
  assert.equal(scriptSchema.safeParse({...script, scenes: [script.scenes[0], script.scenes[0]]}).success, false);
  for (const patch of [{template: 'unknown'}, {voiceover: ''}, {id: '../bad'}]) {
    assert.equal(scriptSchema.safeParse({...script, scenes: [{...script.scenes[0], ...patch}]}).success, false);
  }
});
test('旁白或视觉修改会使时间轴指纹失效', () => {
  const script = scriptSchema.parse(example), next = structuredClone(script);
  next.scenes[0].voiceover += '修改';
  assert.notEqual(hashScript(script), hashScript(next));
  assert.equal(hashScript(script), hashScript(scriptSchema.parse(script)));
});
