import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scriptSchema, previewTimeline} from '../shared/schema';
import {canvasLeaves, canvasPropsSchema} from '../shared/canvas';
import {sceneCapabilities, targetCount} from '../shared/capabilities';
import {eventFrame} from '../shared/visual';
import {parseGenerated} from '../server/article';
import example from '../input/canvas-example.json';

test('混合画布示例可生成、校验与准备时间轴，target按深度优先内容块编号', () => {
  const script = parseGenerated(JSON.stringify(example), 1);
  const scene = script.scenes[0];
  assert.equal(scene.template, 'CanvasSlide');
  if (scene.template !== 'CanvasSlide') return;
  assert.deepEqual(canvasLeaves(scene.props.blocks).map(b => b.id), ['code', 'diagram', 'warning']);
  assert.equal(targetCount(scene), 3);
  const timeline = previewTimeline(script);
  const timed = timeline.scenes[0];
  assert.equal(eventFrame(timed, 1, 3), timed.narrationSegments![1].from);
  assert.equal(eventFrame(timed, 2, 3), timed.narrationSegments![2].from);
  assert.ok(timeline.totalFrames > 0);
  assert.match(sceneCapabilities.CanvasSlide.motion, /不控制块内代码行/);
});

test('画布拒绝未知块、重复ID、越界target与节点、任意样式字段', () => {
  const props = example.scenes[0].props;
  assert.equal(canvasPropsSchema.safeParse({...props, blocks: [{id: 'x', type: 'BrowserBlock', props: {url: 'https://example.com'}}]}).success, false);
  assert.equal(canvasPropsSchema.safeParse({...props, blocks: [props.blocks[0], props.blocks[0]]}).success, false);
  assert.equal(canvasPropsSchema.safeParse({...props, blocks: [{id: 'x', type: 'DiagramBlock', props: {heading: 'x', nodes: ['a', 'b'], activeNode: 3}}]}).success, false);
  assert.equal(canvasPropsSchema.safeParse({...props, style: {position: 'absolute'}}).success, false);
  assert.equal(scriptSchema.safeParse({...example, scenes: [{...example.scenes[0], narration: [{text: '越界', target: 4}]}]}).success, false);
});

test('画布嵌套和总块数有限制，旧模板不受影响', () => {
  const leaf = {id: 'tip', type: 'CalloutBlock', props: {variant: 'info', text: '提示'}};
  const group = (id: string, blocks: unknown[]) => ({id, type: 'GroupBlock', layout: 'stacked', blocks});
  const props = {heading: 'x', layout: 'grid', blocks: [group('a', [group('b', [leaf])])]};
  assert.ok(canvasPropsSchema.safeParse(props).success);
  assert.equal(canvasPropsSchema.safeParse({...props, blocks: [group('a', [group('b', [group('c', [leaf])])])]}).success, false);
  assert.equal(canvasPropsSchema.safeParse({...props, blocks: Array.from({length: 3}, (_, i) => group(`g${i}`, Array.from({length: 3}, (_, j) => ({...leaf, id: `l${i}_${j}`}))))}).success, false);
  assert.ok(scriptSchema.safeParse({title: '旧稿', scenes: [{id: 'old', template: 'TitleSlide', voiceover: '旁白', props: {title: '标题'}}]}).success);
});
