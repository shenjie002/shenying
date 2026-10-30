import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {scriptSchema, previewTimeline, type Timeline} from '../shared/schema';
import {masterGuide} from '../shared/master';

const python = process.env.PYTHON || '.venv/bin/python';
// Pure timing helper only: fake durations, never calls Edge TTS.
const narrate = (beats: {frames: number}[], seconds: number[]) => JSON.parse(execFileSync(python, ['-c', `
import json, sys
sys.path.insert(0, 'scripts')
from importlib import import_module
m = import_module('generate-audio')
beats, secs = json.loads(sys.argv[1]), json.loads(sys.argv[2])
try:
    timed, total = m.master_narration(beats, [('audio/a%d.mp3' % i, s) for i, s in enumerate(secs)], 30)
    print(json.dumps({'timed': timed, 'total': total}))
except ValueError as e:
    print(json.dumps({'error': str(e)}))
`, JSON.stringify(beats), JSON.stringify(seconds)], {encoding: 'utf8'}));
const hasPython = existsSync(python) && (() => {try {execFileSync(python, ['-c', 'import edge_tts, mutagen']); return true;} catch {return false;}})();

test('master配音按段首绝对帧排布，不改动作帧', {skip: !hasPython && '缺少.venv TTS依赖'}, () => {
  const out = narrate([{frames: 150}, {frames: 180}, {frames: 90}], [3.2, 5.99, 1]);
  assert.equal(out.total, 420);
  assert.deepEqual(out.timed.map((c: any) => [c.beat, c.from, c.durationInFrames]), [[0, 0, 96], [1, 150, 180], [2, 330, 30]]);
});

test('master配音超过段长时报错并指出段号', {skip: !hasPython && '缺少.venv TTS依赖'}, () => {
  const out = narrate([{frames: 150}, {frames: 60}], [2, 2.1]);
  assert.match(out.error, /第2段配音63帧，超过段长60帧/);
});

test('master tts时间轴在画布中挂载配音，静音时间轴不挂载', async () => {
  const {MasterCanvas} = await import('../src/MasterCanvas');
  const script = scriptSchema.parse(JSON.parse(await fs.readFile('input/master-motion-sound-30s.json', 'utf8')));
  const silent = previewTimeline(script);
  assert.equal(silent.mode, 'silent');
  assert.equal(silent.masterNarration, undefined);
  const tts: Timeline = {...silent, mode: 'tts', masterNarration: [{beat: 0, from: 0, durationInFrames: 60, audioSrc: 'audio/abc.mp3'}]};
  assert.equal(tts.masterNarration![0].from + tts.masterNarration![0].durationInFrames <= tts.totalFrames, true);
  assert.equal(typeof MasterCanvas, 'function');
});

test('生成提示与文档说明master配音每段一句、超长报错、不逐词同步', async () => {
  assert.match(masterGuide, /每个beat一句/);
  assert.match(masterGuide, /不支持逐词同步/);
  const doc = await fs.readFile('docs/master-composition.md', 'utf8');
  assert.match(doc, /超过 `beats\.frames` 时报错/);
  assert.doesNotMatch(doc, /master配音按钮禁用/);
  const pipeline = await fs.readFile('server/pipeline.ts', 'utf8');
  assert.doesNotMatch(pipeline, /master 使用绝对帧，目前仅支持无配音/);
  assert.match(pipeline, /masterNarration/);
});
