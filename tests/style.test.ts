import {test} from 'node:test';
import assert from 'node:assert/strict';
import {visualSchema, backgroundNames, animationNames, canvasFocus, styleGuide} from '../shared/style';
import {scriptSchema} from '../shared/schema';
import {buildMessages} from '../server/article';
import {articleRequestSchema} from '../shared/article';
import canvas from '../input/canvas-example.json';

test('背景和入场枚举均可验证，旧配置兼容且拒绝未实现特效', () => {
  for (const background of backgroundNames) for (const animation of animationNames) assert.ok(visualSchema.safeParse({background,animation,pace:'progressive'}).success);
  assert.equal(visualSchema.safeParse({background:'glow',animation:'counter',pace:'progressive'}).success,false);
  const scene={id:'title',template:'TitleSlide',voiceover:'旁白',props:{title:'标题'},visual:{background:'grain',animation:'border',pace:'progressive',focus:'pulse'}};
  assert.equal(scriptSchema.safeParse({title:'x',scenes:[scene]}).success,false);
  assert.ok(scriptSchema.safeParse({...canvas,scenes:[{...canvas.scenes[0],visual:{background:'grain',animation:'border',pace:'progressive',focus:'pulse'}}]}).success);
});
test('画布暗化和呼吸为确定性帧驱动，不改变目标编号或时序',()=>{
  assert.equal(canvasFocus('dim',1,0,30,true).opacity,0.48);
  assert.equal(canvasFocus('dim',-1,0,30,true).opacity,1);
  assert.equal(canvasFocus('dim',1,1,30,true).opacity,1);
  assert.deepEqual(canvasFocus('pulse',0,0,60,true),canvasFocus('pulse',0,0,60,true));
  assert.equal(canvasFocus('pulse',0,0,0,false).boxShadow,canvasFocus('pulse',0,0,100,false).boxShadow);
});
test('文章实际请求包含风格规则与未实现能力边界',()=>{
  const prompt=buildMessages(articleRequestSchema.parse({article:'文章素材。'.repeat(30)}))[0].content;
  assert.ok(prompt.includes(styleGuide));
  assert.match(prompt,/每幕根据文章内容选择/);
  assert.match(prompt,/未实现：数字滚动计数/);
});
