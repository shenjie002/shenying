import assert from 'node:assert/strict';
import test from 'node:test';
import {actorPose, beatAt, cameraPoseAt, masterFrames, masterSchema, type Master} from '../shared/master';
import {previewTimeline, scriptSchema} from '../shared/schema';

const base = {
  beats: [{text: '第一段', frames: 90}, {text: '第二段', frames: 90}],
  actors: [
    {id: 'title', label: '标题', keys: [
      {frame: 0, x: 50, y: 50},
      {frame: 60, x: 12, y: 10, scale: 0.4, easing: 'settle' as const},
      {frame: 180, x: 12, y: 10, scale: 0.4, easing: 'settle' as const},
    ]},
  ],
};
const parse = (patch: Record<string, unknown> = {}) => masterSchema.parse({...base, ...patch});

test('全局画布：演员关键帧按绝对帧插值，可跨段延续同一对象', () => {
  const master = parse() as Master;
  assert.equal(masterFrames(master), 180);
  assert.deepEqual([actorPose(master.actors[0], 0).x, actorPose(master.actors[0], 0).y], [50, 50]);
  const mid = actorPose(master.actors[0], 60);
  assert.equal(mid.x, 12);
  assert.equal(mid.scale, 0.4);
  // 跨过 beat 边界后仍是同一个演员的同一个终态，不需要重新入场
  assert.deepEqual(actorPose(master.actors[0], 150), actorPose(master.actors[0], 180));
});

test('全局画布：关键帧必须严格递增，且不得超出总时长', () => {
  assert.throws(() => masterSchema.parse({...base, actors: [{id: 'a', label: 'A', keys: [
    {frame: 30, x: 50, y: 50}, {frame: 30, x: 60, y: 60},
  ]}]}));
  assert.throws(() => masterSchema.parse({...base, actors: [{id: 'a', label: 'A', keys: [
    {frame: 0, x: 50, y: 50}, {frame: 400, x: 60, y: 60},
  ]}]}));
});

test('全局画布：镜头与段落定位受边界约束', () => {
  const master = parse({camera: [
    {frame: 0, x: 50, y: 50, zoom: 1},
    {frame: 180, x: 30, y: 70, zoom: 2.2, easing: 'settle' as const},
  ]}) as Master;
  assert.equal(cameraPoseAt(master, 0).zoom, 1);
  assert.equal(cameraPoseAt(master, 180).zoom, 2.2);
  assert.ok(cameraPoseAt(master, 90).zoom > 1 && cameraPoseAt(master, 90).zoom < 2.2);
  assert.equal(beatAt(master, 0).index, 0);
  assert.equal(beatAt(master, 120).index, 1);
  assert.equal(beatAt(master, 999).index, 1);
  assert.throws(() => masterSchema.parse({...base, camera: [
    {frame: 0, x: 50, y: 50, zoom: 3},
    {frame: 100, x: 50, y: 50, zoom: 1},
  ]}));
  assert.throws(() => masterSchema.parse({...base, camera: [
    {frame: 0, x: 50, y: 50, zoom: 1}, {frame: 0, x: 50, y: 50, zoom: 1},
  ]}));
});

test('全局画布：与分幕互斥，且允许 scenes 为空', () => {
  const ok = scriptSchema.parse({title: 'T', scenes: [], master: base});
  const timeline = previewTimeline(ok);
  assert.equal(timeline.totalFrames, 180 + 12);
  assert.equal(timeline.scenes.length, 0);
  assert.throws(() => scriptSchema.parse({title: 'T', scenes: []}));
  assert.throws(() => scriptSchema.parse({title: 'T', master: base, scenes: [{
    id: 's', template: 'TitleSlide', voiceover: 'x', props: {title: 'A', subtitle: 'B'},
  }]}));
});

test('3D轨道：z/rotate/depth 插值与字段边界（不代替浏览器透视验收）', () => {
  const master = masterSchema.parse({...base, actors: [{id: 'card', label: '卡片', kind: 'card', depth: 1.4, keys: [
    {frame: 0, x: 50, y: 50, z: -320, rotateX: 14, rotateY: -8},
    {frame: 30, x: 50, y: 50, z: 40, rotateX: 0, rotateY: 0, easing: 'spring-jelly' as const},
  ]}]}) as Master;
  const far = actorPose(master.actors[0], 0), near = actorPose(master.actors[0], 30);
  assert.equal(far.z, -320);
  assert.equal(far.rotateX, 14);
  assert.equal(near.z, 40);
  assert.ok(near.z > far.z);
  assert.equal(master.actors[0].depth, 1.4);
  assert.throws(() => masterSchema.parse({...base, actors: [{id: 'a', label: 'A', depth: 3, keys: [
    {frame: 0, x: 50, y: 50}, {frame: 10, x: 50, y: 50},
  ]}]}));
  assert.throws(() => masterSchema.parse({...base, actors: [{id: 'a', label: 'A', keys: [
    {frame: 0, x: 50, y: 50, z: -900}, {frame: 10, x: 50, y: 50},
  ]}]}));
  assert.throws(() => masterSchema.parse({...base, actors: [{id: 'a', label: 'A', keys: [
    {frame: 0, x: 50, y: 50, rotateY: 40}, {frame: 10, x: 50, y: 50},
  ]}]}));
});
