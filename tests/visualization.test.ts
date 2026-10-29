import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canvasPropsSchema, iconNames} from '../shared/canvas';
import {buildMessages} from '../server/article';
import {articleRequestSchema} from '../shared/article';
const props = (type: string, value: unknown) => ({heading: 'test', layout: 'grid', blocks: [{id: 'viz', type, props: value}]});
test('图表结构、节点引用、树循环和图标白名单受校验', () => {
  assert.ok(canvasPropsSchema.safeParse(props('BarChartBlock', {heading:'QPS',unit:'req/s',bars:[{label:'A',value:100},{label:'B',value:200}]})).success);
  assert.equal(canvasPropsSchema.safeParse(props('BarChartBlock', {heading:'x',bars:[{label:'x',value:-1}]})).success,false);
  assert.equal(canvasPropsSchema.safeParse(props('BarChartBlock', {heading:'x',bars:[{label:'x',value:0}]})).success,false);
  assert.ok(canvasPropsSchema.safeParse(props('TopologyBlock',{heading:'架构',nodes:['Client','API'],edges:[{from:1,to:2}]})).success);
  assert.equal(canvasPropsSchema.safeParse(props('TopologyBlock',{heading:'x',nodes:['A','B'],edges:[{from:1,to:3}]})).success,false);
  assert.equal(canvasPropsSchema.safeParse(props('TreeBlock',{heading:'x',nodes:[{label:'a',parent:2},{label:'b',parent:1}]})).success,false);
  assert.ok(canvasPropsSchema.safeParse(props('CompareBlock',{heading:'对比',columns:['A','B'],rows:[{label:'特性',values:['不同','中立']}]})).success);
  assert.ok(canvasPropsSchema.safeParse(props('TimelineBlock',{heading:'版本',events:[{label:'v1'},{label:'v2'}]})).success);
  for(const name of iconNames) assert.ok(canvasPropsSchema.safeParse(props('IconBlock',{name,label:'语义',tone:'accent'})).success);
  assert.equal(canvasPropsSchema.safeParse(props('IconBlock',{name:'Imaginary',label:'x',tone:'accent'})).success,false);
});
test('实际文章生成提示包含所有图表、图标与内容决策规则',()=>{
  const prompt=buildMessages(articleRequestSchema.parse({article:'文章内容。'.repeat(30)}))[0].content;
  for(const name of ['BarChartBlock','TopologyBlock','CompareBlock','TimelineBlock','TreeBlock','IconBlock','TriangleAlert','ShieldCheck']) assert.ok(prompt.includes(name),name);
  assert.match(prompt,/无数据禁止造数/);
  assert.match(prompt,/不预设左对右错/);
  assert.match(prompt,/不支持环形图/);
});
