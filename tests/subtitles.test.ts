import {test} from 'node:test';
import assert from 'node:assert/strict';
import {subtitlePages,subtitleAt} from '../shared/subtitles';
import {previewTimeline,scriptSchema} from '../shared/schema';

test('短句完整显示，长句沿标点分句，不残留几个字与下一句拼接',()=>{
 assert.deepEqual(subtitlePages('模型升级，调度调整。'),['模型升级，调度调整。']);
 const text='模型升级以后调度需要重新检查原来的假设，不能把上一句话剩下几个字和下一句拼在一起。下一句完整展示。';
 assert.deepEqual(subtitlePages(text),['模型升级以后调度需要重新检查原来的假设，','不能把上一句话剩下几个字和下一句拼在一起。','下一句完整展示。']);
 assert.equal(subtitlePages(text).join(''),text);
 const unpunctuated='这是一个没有任何标点但长度超过二十八个字的完整说明我们不应该从中间硬切开';
 assert.deepEqual(subtitlePages(unpunctuated),[unpunctuated]);
 assert.deepEqual(subtitlePages('他说：“一起调整！”下一步继续。'),['他说：“一起调整！”','下一步继续。']);
 assert.deepEqual(subtitlePages('第一句\n第二句'),['第一句','第二句']);
 assert.deepEqual(subtitlePages(''),[]);
});
test('分页时间按长度分配，分句边界不串页，关闭字幕与尾帧为空',()=>{
 const scene=previewTimeline(scriptSchema.parse({title:'测试',scenes:[{id:'s',template:'TitleSlide',props:{title:'测试'},voiceover:'甲甲，乙乙乙乙乙乙。 丙丙。',narration:[{text:'甲甲，乙乙乙乙乙乙。'},{text:'丙丙。'}]}]})).scenes[0];
 // Use a low preferred limit only for page splitting tests; actual long clauses trigger production paging.
 const long='甲'.repeat(10)+'，'+'乙'.repeat(30)+'。';
 const timed={...scene,narrationSegments:[{text:long,from:0,durationInFrames:100},{text:'结束。',from:103,durationInFrames:30}],durationInFrames:140};
 assert.equal(subtitleAt(timed,20),'甲'.repeat(10)+'，');
 assert.equal(subtitleAt(timed,30),'乙'.repeat(30)+'。');
 assert.equal(subtitleAt(timed,100),'');assert.equal(subtitleAt(timed,103),'结束。');
 assert.equal(subtitleAt(timed,133),'');assert.equal(subtitleAt({...timed,subtitles:false},10),'');
 const legacy={...timed,narrationSegments:undefined,voiceover:'第一句。第二句。'};
 assert.equal(subtitleAt(legacy,0),'第一句。');assert.equal(subtitleAt(legacy,100),'第二句。');assert.equal(subtitleAt(legacy,140),'');
});
