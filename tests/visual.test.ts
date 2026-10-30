import {test} from 'node:test';
import assert from 'node:assert/strict';
import original from '../script.json';
import example from '../input/visual-upgrade.json';
import {previewTimeline, scriptSchema} from '../shared/schema';
import {activeTarget, captionAt, eventFrame, visualOf} from '../shared/visual';

test('旧剧本仍兼容，升级示例支持流程和终端', () => {
  assert.ok(scriptSchema.safeParse(original).success);
  const script = scriptSchema.parse(example);
  assert.ok(script.scenes.some(s => s.template === 'FlowSlide'));
  assert.ok(script.scenes.some(s => s.template === 'TerminalSlide'));
});
test('节拍按帧定位代码行和解释，无需浏览器或网络', () => {
  const scene = previewTimeline(scriptSchema.parse(example)).scenes[2];
  assert.equal(activeTarget(scene, 0, 5), 1);
  assert.equal(activeTarget(scene, Math.floor(scene.durationInFrames * 0.33), 5), 2);
  assert.match(captionAt(scene, scene.durationInFrames - 1) ?? '', /输出/);
  assert.equal(eventFrame(scene, 2, 5), Math.floor(scene.durationInFrames * 0.33));
});
test('完整展示取消逐项延迟；旧剧本自动启用温和弹簧', () => {
  const scene = {...previewTimeline(scriptSchema.parse(example)).scenes[0],visual:undefined};
  assert.equal(visualOf(scene).animation, 'spring');
  assert.equal(eventFrame({...scene, visual: {background: 'plain', animation: 'none', pace: 'all'}}, 4, 5), 0);
});
test('拒绝倒序节拍和超出目标范围的节拍', () => {
  const script = scriptSchema.parse(example);
  const withBeats = (beats: unknown) => ({...script, scenes: [{...script.scenes[2], beats}]});
  assert.equal(scriptSchema.safeParse(withBeats([{at: 0.6, target: 1}, {at: 0.2, target: 2}])).success, false);
  assert.equal(scriptSchema.safeParse(withBeats([{at: 0, target: 99}])).success, false);
});
