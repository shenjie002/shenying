import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scriptSchema, previewTimeline} from '../shared/schema';
import {activeTarget, eventFrame} from '../shared/visual';
import {subtitleAt} from '../shared/subtitles';

const source = {title: '分句演示', scenes: [{id: 'sentence', template: 'BulletListSlide', voiceover: '先看规则。再看结果。', props: {heading: '规则', bullets: ['规则', '结果']}, narration: [{text: '先看规则。', target: 1}, {text: '再看结果。', target: 2}]}]};
test('分句静音时间轴有连续可定位区间', () => {
  const scene = previewTimeline(scriptSchema.parse(source)).scenes[0];
  const segments = scene.narrationSegments!;
  assert.equal(segments[0].from, 0);
  assert.equal(segments[1].from, segments[0].durationInFrames + 3);
  assert.equal(eventFrame(scene, 1, 2), segments[1].from);
  assert.equal(activeTarget(scene, segments[1].from, 2), 1);
  assert.equal(subtitleAt(scene, 0), '先看规则。');
  assert.equal(subtitleAt(scene, segments[1].from), '再看结果。');
  assert.equal(subtitleAt({...scene, subtitles: false}, 0), '');
  assert.equal(subtitleAt(scene, segments[0].durationInFrames), '');
});
test('分句目标不能超出场景范围', () => {
  const bad = structuredClone(source); bad.scenes[0].narration[0].target = 3;
  assert.equal(scriptSchema.safeParse(bad).success, false);
});
