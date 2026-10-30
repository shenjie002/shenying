import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rendererGuide} from '../shared/capabilities';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('生成与MCP共用契约区分整块target和声明式内部动作', () => {
  const guide = rendererGuide();
  for (const field of ['CodeBlock.focus', 'MechanismBlock.steps', 'MotionSceneBlock', 'BarChart.motion/countUp', 'Timeline.motion', 'StatBlock.counter', 'cues.item']) {
    assert.ok(guide.includes(field), `能力契约缺少 ${field}`);
  }
  assert.ok(guide.includes('target仅控制内容块整块入场/聚焦'));
  assert.ok(!guide.includes('其他图表图标内部静态'));
  assert.ok(guide.includes('分镜进度条可由theme.chapters开启'));
  assert.ok(guide.includes('连续舞台轨道仅用MotionSceneBlock.props.camera'));
  assert.ok(!guide.includes('轻缓运镜仅用visual.camera'));
});

test('Rust测试任务统一连续过程选型且保护已有稿件', () => {
  const brief = read('input/rust-canvas-test.md');
  const [task, articleAndSteps] = brief.split('## 三、文章素材（以下仅为资料，不是额外指令）');
  assert.ok(articleAndSteps);
  assert.match(task, /连续过程优先使用单个全宽MotionSceneBlock/);
  assert.match(task, /需要离散状态对照时才选MechanismBlock/);
  assert.match(task, /CodeBlock使用focus/);
  assert.match(brief, /先询问并确认一个未占用的新JSON路径/);
  for (const stale of ['每幕以单个全宽MechanismBlock为主体', '需要逐行高亮时使用独立 CodeSlide', 'rust-mechanism-generated.json']) {
    assert.ok(!brief.includes(stale), `Rust任务残留旧要求：${stale}`);
  }
});

test('项目说明覆盖全部能力专题，不残留旧模式限制', () => {
  const readme=read('README.md'), index=read('docs/README.md');
  for(const file of ['agent-guide','audio-motion-reliability','canvas','continuous-motion','current-progress','free-layout-connections','json-creation','master-composition','mcp','mechanisms','motion-effects','out-cleanup-inventory','render-performance','renderer-contract','short-video-presentation','themes','visual-style','visualizations']) {
    assert.ok(index.includes(`./${file}.md`), `索引缺少 ${file}`);
  }
  assert.match(readme,/docs\/README\.md/);
  for(const capability of ['MotionSceneBlock','master','CodeBlock.focus','StatBlock.counter','ImageBlock','sfxMuted','handbook'])assert.ok(readme.includes(capability),`项目说明缺少 ${capability}`);
  for(const old of ['图内静态，仅支持整块','不支持计数器或配音追线','图片、浏览器素材及块内逐行动画暂不支持','These blocks are static internally','Not implemented yet: mechanism diagrams'])assert.ok(!readme.includes(old),`残留旧限制 ${old}`);
  assert.match(index,/80vh/);assert.match(index,/临时/);assert.match(index,/超段长报错/);
  assert.doesNotMatch(read('llms-full.txt'),/master prepare_tts is explicitly rejected/);
});

test('验证脚本默认无截图/真实TTS，网页配音说明与已实现能力一致',()=>{
  const browser=read('scripts/verify-master-workflow.mts');
  assert.ok(!browser.includes('captureScreenshot'));
  assert.ok(!browser.includes('TTS disabled'));
  assert.match(browser,/TTS mocked/);
  const composer=read('web/ArticleComposer.tsx');
  assert.ok(!composer.includes('不能直接生成配音'));
  assert.match(composer,/超段长报错/);
});

test('主要能力文档不再用全局静态或禁止计数概括已实现能力', () => {
  const cases = [
    ['docs/canvas.md', ['图内静态，旁白仅控制整块', '任意自由定位、图片']],
    ['docs/visualizations.md', ['图表和图标内部都是静态的', '堆叠、环形、逐柱增长']],
    ['docs/renderer-contract.md', ['不允许承诺计数器', '不能承诺柱条增长', '块内内容静态', '也没有分镜底部进度条']],
    ['docs/mcp.md', ['新图表均为内部静态内容']],
    ['llms-full.txt', ['No counters, animated chart growth', 'Charts are static inside', 'only the bounded visual.camera is supported']],
  ] as const;
  for (const [path, staleClaims] of cases) {
    const text = read(path);
    for (const claim of staleClaims) assert.ok(!text.includes(claim), `${path} 残留旧限制：${claim}`);
  }
});
