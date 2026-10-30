import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {articleRequestSchema} from '../shared/article';
import {buildMessages,parseGenerated,generateArticle} from '../server/article';
import {masterSchema,masterFrames} from '../shared/master';
import {resizeMasterBeat} from '../shared/master-edit';
import {scriptSchema} from '../shared/schema';

const source=JSON.parse(await fs.readFile('input/master-motion-sound-30s.json','utf8'));
const request=(patch={})=>articleRequestSchema.parse({article:'一篇仅供测试的文章资料。'.repeat(20),mode:'master',format:'portrait',duration:30,soundEffects:true,...patch});

test('用户连续短片请求与提示不再强制分镜，文案/画幅/音效选择进入实际提示',()=>{
 assert.equal(articleRequestSchema.safeParse({...request(),duration:180}).success,false);
 assert.equal(articleRequestSchema.safeParse({...request(),mode:'scenes'}).success,false);
 const messages=buildMessages(request({instructions:'先提问再呈现关系'}));
 assert.match(messages[0].content,/稳定ID/);assert.match(messages[0].content,/spring/);
 assert.doesNotMatch(messages[0].content,/每幕必须有/);
 assert.match(messages[1].content,/900帧/);assert.match(messages[1].content,/不受分镜数约束/);
 assert.match(messages[1].content,/先提问再呈现关系/);
 assert.match(buildMessages(request({soundEffects:false}))[1].content,/sfx必须为空数组/);
});

test('连续短片模型输出必须匹配模式、固定时长、画幅与音效授权',()=>{
 assert.equal(parseGenerated(JSON.stringify(source),request()).master!.sfxMuted,false); // 用户开启音效则发声
 assert.equal(parseGenerated(JSON.stringify({...source,master:{...source.master,sfx:[]}}),request({soundEffects:false})).master!.sfxMuted,true);
 for(const [value,req,pattern] of [
  [{...source,tailPaddingFrames:12},request(),/精确/],
  [source,request({duration:60}),/精确/],
  [source,request({format:'landscape'}),/画幅/],
  [source,request({soundEffects:false}),/未开启音效/],
  [source,articleRequestSchema.parse({article:'文章。'.repeat(30)}),/要求分幕/],
 ] as const)assert.throws(()=>parseGenerated(JSON.stringify(value),req),pattern);
 const noSound={...source,master:{...source.master,sfx:[]}};
 assert.ok(parseGenerated(JSON.stringify(noSound),request({soundEffects:false})).master);
});

test('正常generateArticle适配器走master解析，不外发真实文章/模型，不保存项目',async()=>{
 const saved={fetch:globalThis.fetch,key:process.env.LLM_API_KEY,model:process.env.LLM_MODEL,base:process.env.LLM_BASE_URL};
 try {
  process.env.LLM_API_KEY='test-only';process.env.LLM_MODEL='mock';process.env.LLM_BASE_URL='https://invalid.example';
  let calls=0;
  globalThis.fetch=(async(_url,init)=>{calls++;const body=JSON.parse(String(init?.body));assert.match(body.messages[1].content,/900帧/);return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify(source)}}]}));}) as typeof fetch;
  const result=await generateArticle(request());assert.ok(result.master);assert.equal(calls,1);
 } finally {
  globalThis.fetch=saved.fetch;
  for(const [key,value] of [['LLM_API_KEY',saved.key],['LLM_MODEL',saved.model],['LLM_BASE_URL',saved.base]]){if(value===undefined)delete process.env[key!];else process.env[key!]=value;}
 }
});

test('段长编辑按内容段缩放/后移所有轨道，碰撞拒绝而非丢帧',()=>{
 const m=scriptSchema.parse(source).master!;
 const next=resizeMasterBeat(m,1,240);
 assert.equal(masterFrames(next),960);
 assert.equal(next.actors.find(a=>a.id==='spring')!.keys[0].frame,362);
 assert.equal(next.sfx.find(s=>s.frame===136)?.sound,'bloop'); // 132 -> 120+(12*240/180)
 assert.equal(next.camera!.at(-1)!.frame,960);
 assert.equal(m.beats[1].frames,180);
 const compact=masterSchema.parse({beats:[{text:'A',frames:100}],actors:[{id:'a',label:'A',keys:[{frame:1,x:50,y:50},{frame:2,x:50,y:50}]}]});
 assert.throws(()=>resizeMasterBeat(compact,0,20));
});
