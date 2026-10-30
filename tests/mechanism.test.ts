import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scriptSchema,previewTimeline} from '../shared/schema';
import {mechanismSchema,mechanismAt} from '../shared/mechanism';
import {canvasLeaves} from '../shared/canvas';
import {validateCanvasDirection} from '../shared/director';
import {directionWarnings} from '../shared/direction-review';
import {buildMessages} from '../server/article';
import {articleRequestSchema} from '../shared/article';
import {rendererGuide} from '../shared/capabilities';
const raw=()=>JSON.parse(fs.readFileSync('input/mechanism-example.json','utf8'));
const mechanism=()=>raw().scenes[0].props.blocks[0].props;
test('同一机制Schema覆盖Rust移动、借用及订单状态，实际分句驱动',()=>{
  const script=scriptSchema.parse(raw());validateCanvasDirection(script);
  for(const scene of previewTimeline(script).scenes){
    if(scene.template!=='CanvasSlide') continue;
    const block=canvasLeaves(scene.props.blocks)[0];assert.equal(block.type,'MechanismBlock');
    if(block.type!=='MechanismBlock') continue;
    const starts=scene.narrationSegments!.map(s=>s.from), second=starts[1];
    assert.equal(mechanismAt(block.props,starts,second-1).index,0);
    assert.equal(mechanismAt(block.props,starts,second).index,1);
    assert.equal(mechanismAt(block.props,starts,second+12).progress,1);
    const measured=[0,300];assert.equal(mechanismAt(block.props,measured,299).index,0);assert.equal(mechanismAt(block.props,measured,300).index,1);
  }
});
test('拒绝重复身份、缺失状态、未知关系、自连及乱序步骤',()=>{
  const mutate=(fn:(v:any)=>void)=>{const v=mechanism();fn(v);assert.equal(mechanismSchema.safeParse(v).success,false);};
  mutate(v=>v.entities[1].id=v.entities[0].id);
  mutate(v=>v.steps[0].states.pop());
  mutate(v=>v.steps[0].states[0].entity='unknown');
  mutate(v=>v.steps[0].relations[0].to='unknown');
  mutate(v=>v.steps[0].relations[0].to='s1');
  mutate(v=>v.steps[1].sentence=1);
  mutate(v=>v.steps[0].states[0].style={color:'red'});
});
test('跨字段校验步骤句号、target及首次入场；旧稿不要求机制块',()=>{
  for(const sentence of [3,50]) {const v=raw();v.scenes[0].props.blocks[0].props.steps[1].sentence=sentence;assert.equal(scriptSchema.safeParse(v).success,false);}
  const v=raw();v.scenes[0].narration[0].target=undefined;assert.equal(scriptSchema.safeParse(v).success,false);
  const old=JSON.parse(fs.readFileSync('input/canvas-example.json','utf8'));assert.equal(scriptSchema.safeParse(old).success,true);
  assert.match(rendererGuide(),/完整状态快照/);
});

test('实际文章生成收到机制规划规则，编排提示仅建议不拒绝重复布局',()=>{
  const prompt=buildMessages(articleRequestSchema.parse({article:'技术文章资料。'.repeat(30)}))[0].content;
  assert.match(prompt,/MechanismBlock/);assert.match(prompt,/初始状态/);
  const v=raw();v.scenes=v.scenes.map((s:any)=>({...s,props:{...s.props,layout:'split-2-1'}}));
  const script=scriptSchema.parse(v);assert.ok(directionWarnings(script).some(w=>w.includes('连续使用')));
  assert.deepEqual(directionWarnings(scriptSchema.parse(raw())),[]);
});

