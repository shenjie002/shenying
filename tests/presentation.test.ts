import {buildMessages} from '../server/article';
import {articleRequestSchema} from '../shared/article';
import {directorGuide} from '../shared/director';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scriptSchema,previewTimeline} from '../shared/schema';
import {videoSize,imageSchema} from '../shared/presentation';
import {rendererGuide} from '../shared/capabilities';
test('实际文章生成与MCP导演规则包含全部新增表达及素材边界',()=>{
 const prompt=buildMessages(articleRequestSchema.parse({article:'这是一份用于验证生成提示的文章资料。'.repeat(10)}))[0].content;
 for(const name of ['RichTextBlock','ImageBlock','CycleBlock','TransferContainerBlock','BalanceScaleBlock','StatBlock.counter','BarChartBlock.countUp','TimelineBlock.milestones'])assert.ok(prompt.includes(name),name);
 assert.match(prompt,/"format":"landscape"/);assert.match(prompt,/format="portrait"/);assert.match(prompt,/没有素材清单则不用ImageBlock/);assert.match(prompt,/不编造变化起点/);
 assert.match(directorGuide(),/禁止虚构哈希/);
});
const raw=()=>JSON.parse(fs.readFileSync('input/portrait-editorial-example.json','utf8'));
test('竖屏、主题、富文本和循环示例有效且预览保留配置',()=>{
 const s=scriptSchema.parse(raw());assert.deepEqual(videoSize(s.format),{width:1080,height:1920});assert.equal(previewTimeline(s).theme?.palette,'editorial');assert.deepEqual(videoSize(undefined),{width:1920,height:1080});
});
test('拒绝远程图片/SVG/目录穿越、越界标注与不存在富文本句号',()=>{
 for(const src of ['https://example.com/a.png','../a.png','images/test.svg'])assert.equal(imageSchema.safeParse({src}).success,false);
 const v=raw();v.scenes[0].props.blocks[0].props.segments[1].sentence=50;assert.equal(scriptSchema.safeParse(v).success,false);
 const image=raw();image.scenes[0].props.blocks[0]={id:'question_text',type:'ImageBlock',props:{src:'images/'+ 'a'.repeat(64)+'.png',highlight:{x:90,y:0,width:20,height:10}}};assert.equal(scriptSchema.safeParse(image).success,false);
});
test('实际能力契约包含竖屏/本地图片/来源和非实测边界',()=>{
 const guide=rendererGuide();assert.match(guide,/RichTextBlock/);assert.match(guide,/ImageBlock/);assert.match(guide,/1080×1920/);assert.match(guide,/不是实际程序运行/);
});
