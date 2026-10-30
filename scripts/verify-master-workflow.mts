// Browser smoke check using installed Remotion Chromium. All /api calls are mocked;
// never contacts a model/TTS, saves script.json or renders a production video.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createServer} from 'vite';
import {openBrowser} from '@remotion/renderer';
import {scriptSchema,previewTimeline} from '../shared/schema';
const film=scriptSchema.parse(JSON.parse(await fs.readFile('input/master-motion-sound-30s.json','utf8')));
const initial=scriptSchema.parse({title:'Browser test project',scenes:[{id:'test',template:'TitleSlide',voiceover:'仅供浏览器检查。',props:{title:'本地测试'}}]});
const vite=await createServer({server:{host:'127.0.0.1',port:5187,strictPort:true}});
let browser:Awaited<ReturnType<typeof openBrowser>>|undefined;
try {
 await vite.listen();
 browser=await openBrowser('chrome');
 const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
 const errors:string[]=[];
 page.on('error',e=>errors.push(String(e)));
 await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
 await page.evaluateOnNewDocument((start:unknown,draft:unknown,timeline:unknown)=>{
  let saved=start, prepared=false, job:unknown=null;
  (window as any).__requests=[];
  window.confirm=()=>true;
  const real=window.fetch.bind(window);
  window.fetch=async(input,init)=>{
   const url=String(input);
   if(!url.startsWith('/api/'))return real(input,init);
   (window as any).__requests.push({url,body:init?.body?JSON.parse(String(init.body)):null});
   let result:unknown={};
   if(url==='/api/project')result={script:saved,timeline:prepared?timeline:null,job};
   if(url==='/api/model')result={configured:true,model:'mock-no-network',host:'local-test'};
   if(url==='/api/article/generate')result={script:draft};
   if(url==='/api/script')saved=JSON.parse(String(init?.body));
   if(url==='/api/jobs'){prepared=true;job={status:'running',progress:0,logs:['Mock only']};result={job};}
   if(url==='/api/job'){job={status:'done',progress:1,logs:['Mock only'],output:null};result={job};}
   return new Response(JSON.stringify(result),{headers:{'Content-Type':'application/json'}});
  };
 },initial,film,previewTimeline(film));
 await page.goto({url:'http://127.0.0.1:5187',timeout:30000});
 const wait=async(fn:string)=>{for(let i=0;i<100;i++){if(await page.evaluate(fn))return;await new Promise(r=>setTimeout(r,100));}throw Error(`Timed out: ${fn}`);};
 const click=async(text:string)=>{await page.evaluate((t:string)=>{const b=Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes(t));if(!b||b.disabled)throw Error('Missing/enabled button: '+t);b.click();},text);};
 await wait("document.body.innerText.includes('Browser test project')");
 await click('开始创作');
 await page.evaluate(()=>{
  const sound=document.querySelector('.article-body input[type=checkbox]') as HTMLInputElement;
  sound.click();
  const textarea=document.querySelector('textarea[aria-label="原始文章"]') as HTMLTextAreaElement;
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(textarea,'这是一篇供工作流测试的资料，不包含真实用户文本。'.repeat(10));
  textarea.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await wait("[...document.querySelectorAll('button')].some(b=>b.textContent.includes('生成连续短片')&&!b.disabled)");
 await click('生成连续短片');
 await wait("document.body.innerText.includes('应用到编辑器')");
 await click('应用到编辑器');
 await wait("document.querySelector('.master-editor')!==null");
 // Long forms scroll inside the editor without moving the adjacent preview or its header.
 for(const width of [1440,600]) {
  await page.setViewport({width,height:1000,deviceScaleFactor:1});
  const layout=await page.evaluate(()=>{
   const editor=document.querySelector('.panel.editor') as HTMLElement;
   const heading=editor.querySelector('.panel-heading') as HTMLElement;
   const preview=document.querySelector('.preview-panel') as HTMLElement;
   editor.scrollTop=0;
   const headerBefore=heading.getBoundingClientRect().top,previewBefore=preview.getBoundingClientRect().top;
   editor.scrollTop=500;
   return {height:editor.getBoundingClientRect().height,overflow:editor.scrollHeight>editor.clientHeight,scroll:editor.scrollTop,headerDelta:heading.getBoundingClientRect().top-headerBefore,previewDelta:preview.getBoundingClientRect().top-previewBefore};
  });
  assert.ok(layout.height<=801);assert.ok(layout.overflow);assert.ok(layout.scroll>0);
  assert.ok(Math.abs(layout.headerDelta)<2);assert.equal(layout.previewDelta,0);
 }
 await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
 await page.evaluate(()=>{(document.querySelector('.panel.editor') as HTMLElement).scrollTop=0;});
 assert.ok(await page.evaluate("document.body.innerText.includes('讲解与节奏')"));
 // TTS is available for master; only send a mocked task request, never real speech text.
 assert.equal(await page.evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.includes('生成配音')).disabled"),false);
 const requests=await page.evaluate('window.__requests') as {url:string;body:any}[];
 assert.equal(requests.find(r=>r.url==='/api/article/generate')!.body.mode,'master');
 assert.equal(requests.find(r=>r.url==='/api/article/generate')!.body.soundEffects,true);
 await page.evaluate(()=>{
  const textarea=document.querySelector('.master-beat textarea') as HTMLTextAreaElement;
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(textarea,'浏览器内修改的字幕。');
  textarea.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await wait("document.querySelector('.master-beat textarea').value==='浏览器内修改的字幕。'");
 await page.evaluate(()=>{
  const input=document.querySelector('.master-beat input[type=number]') as HTMLInputElement;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'5');
  input.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await wait("document.querySelector('.master-editor').innerText.includes('31.00')");
 await page.evaluate(()=>{
  const input=document.querySelector('.master-beat input[type=number]') as HTMLInputElement;
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'4');
  input.dispatchEvent(new Event('input',{bubbles:true}));
 });
 await wait("document.querySelector('.master-editor').innerText.includes('30.00')");
 await click('添加对象');
 await wait("document.querySelector('.master-editor').innerText.includes('15/16')");
 await click('删除当前对象');
 await wait("document.querySelector('.master-editor').innerText.includes('14/16')");
 await click('保存剧本');
 await wait("window.__requests.some(r=>r.url==='/api/script')");
 const saved=await page.evaluate("window.__requests.find(r=>r.url==='/api/script').body") as any;
 assert.equal(saved.master.beats[0].text,'浏览器内修改的字幕。');
 assert.equal(saved.master.sfx.length,15);
 await click('无配音试跑');
 await wait("window.__requests.some(r=>r.url==='/api/jobs'&&r.body.kind==='silent')");
 await wait("[...document.querySelectorAll('button')].some(b=>b.textContent.includes('生成配音')&&!b.disabled)");
 await click('生成配音');
 await wait("window.__requests.some(r=>r.url==='/api/jobs'&&r.body.kind==='tts')");
 await wait("[...document.querySelectorAll('button')].some(b=>b.textContent.includes('先渲染全片')&&!b.disabled)");
 await click('先渲染全片');
 await wait("window.__requests.some(r=>r.url==='/api/jobs'&&r.body.kind==='draft')");
 await wait("[...document.querySelectorAll('button')].some(b=>b.textContent.includes('开始渲染视频')&&!b.disabled)");
 await click('开始渲染视频');
 await wait("window.__requests.some(r=>r.url==='/api/jobs'&&r.body.kind==='render')");
 await page.evaluate(()=>document.querySelector('.master-editor')?.scrollIntoView());
 assert.deepEqual(errors,[]);
 console.log('PASS: article form → mocked AI draft → apply → actor/beat editor → edit caption → save → prepare/tts/draft/render through normal task buttons; TTS mocked; no real writes/network.');
} finally {try {await browser?.close({silent:true});} finally {await vite.close();}}
