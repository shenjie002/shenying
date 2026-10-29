import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scriptSchema,previewTimeline} from '../shared/schema';
import {keywordAt,cameraScale,renderProfile,polishGuide} from '../shared/polish';
import {buildMessages} from '../server/article';
import {articleRequestSchema} from '../shared/article';
const source={title:'Rust',scenes:[{id:'a',template:'TitleSlide',voiceover:'Rust 入门。',voice:'zh-CN-YunxiNeural',narration:[{text:'Rust 入门。'}],keywords:[{text:'Rust',sentence:1}],props:{title:'Rust'}}]};
test('音色与关键词句子来源校验，提示使用句首而非词级假对齐',()=>{
  const script=scriptSchema.parse(source), scene=previewTimeline(script).scenes[0];
  assert.equal(keywordAt(scene,0),'Rust');assert.equal(keywordAt(scene,60),undefined);
  assert.equal(scriptSchema.safeParse({...source,scenes:[{...source.scenes[0],keywords:[{text:'Go',sentence:1}]}]}).success,false);
  assert.equal(scriptSchema.safeParse({...source,scenes:[{...source.scenes[0],voice:'unknown'}]}).success,false);
});
test('轻缓镜头边界与草稿规格有界，静止模式禁用运动',()=>{
  assert.equal(cameraScale('push',0,100),1);assert.equal(cameraScale('push',99,100),1.025);
  assert.equal(cameraScale('pull',99,100),1);assert.equal(cameraScale('push',50,100,false),1);
  assert.equal(renderProfile(true).scale,.5);assert.equal(renderProfile(false).scale,1);
});
test('音画能力与不支持功能直接进入实际AI生成提示',()=>{
  const prompt=buildMessages(articleRequestSchema.parse({article:'文章资料。'.repeat(30)}))[0].content;
  assert.ok(prompt.includes(polishGuide));assert.match(prompt,/尚未实现BGM/);assert.match(prompt,/render_draft/);
});
