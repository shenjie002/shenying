import {masterSchema, masterFrames} from './master';
import {themeSchema} from './presentation';
import {canvasLeaves} from './canvas';
import {visualSchema} from './style';
import {canvasPropsSchema} from './canvas';
import {z} from 'zod';
import {narrationVoiceSchema, keywordSchema} from './polish';
import {targetCount} from './capabilities';

const text = z.string().trim().min(1).max(500);
export const beatSchema = z.object({
  at: z.number().min(0).max(0.95),
  target: z.number().int().min(1).max(100),
  caption: z.string().max(160).optional(),
});
export const narrationSchema = z.object({
  text: z.string().trim().min(1).max(500),
  target: z.number().int().min(1).max(100).optional(),
  caption: z.string().max(160).optional(),
});
const base = {
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(80),
  chapter:z.string().max(40).optional(),
  source:z.string().max(160).optional(),
  voiceover: z.string().trim().min(1).max(5000),
  narration: z.array(narrationSchema).min(1).max(50).optional(),
  voice: narrationVoiceSchema.optional(),
  keywords: keywordSchema.optional(),
  subtitles: z.boolean().optional(),
  visual: visualSchema.optional(),
  beats: z.array(beatSchema).max(30).optional(),
};
export const sceneSchema = z.discriminatedUnion('template', [
  z.object({...base, template: z.literal('CanvasSlide'), props: canvasPropsSchema}),
  z.object({...base, template: z.literal('TitleSlide'), props: z.object({title: text, subtitle: z.string().max(500).default('')})}),
  z.object({...base, template: z.literal('BulletListSlide'), props: z.object({heading: text, bullets: z.array(text).min(1).max(6)})}),
  z.object({...base, template: z.literal('CodeSlide'), props: z.object({heading: text, language: z.string().max(30), code: z.string().min(1).max(5000)})}),
  z.object({...base, template: z.literal('FlowSlide'), props: z.object({heading: text, steps: z.array(z.string().trim().min(1).max(80)).min(2).max(5), description: z.string().max(300).default('')})}),
  z.object({...base, template: z.literal('TerminalSlide'), props: z.object({heading: text, commands: z.array(z.string().trim().min(1).max(240)).min(1).max(5), outputs: z.array(z.string().max(600)).max(5).default([])})}),
  z.object({...base, template: z.literal('CardSlide'), props: z.object({heading: text, leftTitle: text, leftBody: text, rightTitle: text, rightBody: text})}),
]);
export const scriptSchema = z.object({
  format:z.enum(['landscape','portrait']).optional(),theme:themeSchema.optional(),
  title: text, fps: z.literal(30).default(30), tailPaddingFrames: z.number().int().min(0).max(90).default(12),
  scenes: z.array(sceneSchema).max(30),
  master: masterSchema.optional(),
}).superRefine((data, ctx) => {
  if (!data.master && data.scenes.length === 0) ctx.addIssue({code: 'custom', path: ['scenes'], message: '至少需要一幕，或提供 master 全局画布'});
  if (data.master && data.scenes.length > 0) ctx.addIssue({code: 'custom', path: ['master'], message: 'master 与 scenes 不能同时使用'});
  data.scenes.forEach((scene, index) => {
    if(scene.template==='CanvasSlide') {
      const connectors=[...(scene.props.connectors??[]),...(scene.props.cues??[]).flatMap(c=>c.connectors??[])];
      connectors.forEach(c=>{if(c.sentence&&!scene.narration?.[c.sentence-1])ctx.addIssue({code:'custom',path:['scenes',index,'props','connectors'],message:'连线起始句必须存在'});});
      canvasLeaves(scene.props.blocks).forEach(block=>{if((block.type==='BarChartBlock'||block.type==='TimelineBlock'||block.type==='TreeBlock')&&block.props.motion&&!scene.narration?.[block.props.motion.sentence-1])ctx.addIssue({code:'custom',path:['scenes',index,'props'],message:'图表动画起始句必须存在'});});
    }
    if(scene.template==='CanvasSlide') scene.props.cues?.forEach((cue,i)=>{if(!scene.narration?.[cue.sentence-1])ctx.addIssue({code:'custom',path:['scenes',index,'props','cues',i],message:'画布步骤必须引用有效旁白句'});});
    if (scene.template === 'CanvasSlide') canvasLeaves(scene.props.blocks).forEach((block,blockIndex)=>{
      if (block.type === 'CodeBlock' && block.props.focus) {
        const first = scene.narration?.findIndex(s => s.target === blockIndex + 1) ?? -1;
        const lineCount = block.props.code.split('\n').length;
        block.props.focus.forEach((step, i) => {
          const target = scene.narration?.[step.sentence - 1]?.target;
          if (step.line > lineCount || (i > 0 && step.sentence <= block.props.focus![i - 1].sentence) || first < 0 || step.sentence < first + 1 || !target || target > canvasLeaves(scene.props.blocks).length) {
            ctx.addIssue({code: 'custom', path: ['scenes', index, 'props'], message: `${block.id}代码聚焦必须绑定已入场后的有效旁白target、递增句号及真实代码行`});
          }
        });
      }
      if(block.type!=='MechanismBlock') return;
      const first = scene.narration?.findIndex(s=>s.target===blockIndex+1) ?? -1;
      if(first+1!==block.props.steps[0].sentence) ctx.addIssue({code:'custom',path:['scenes',index,'props'],message:`${block.id}第一步必须绑定首次讲解该块的句子`});
      block.props.steps.forEach(step=>{if(scene.narration?.[step.sentence-1]?.target!==blockIndex+1) ctx.addIssue({code:'custom',path:['scenes',index,'props'],message:`${block.id}步骤必须绑定有效旁白句及该块target`});});
    });
    if(scene.template==='CanvasSlide')canvasLeaves(scene.props.blocks).forEach(b=>{if(b.type==='RichTextBlock')b.props.segments.forEach(seg=>{if(seg.sentence&&!scene.narration?.[seg.sentence-1])ctx.addIssue({code:'custom',path:['scenes',index,'props'],message:'富文本出现句号必须存在'});});});
    if(scene.template==='CanvasSlide')canvasLeaves(scene.props.blocks).forEach((b,bi)=>{
      if(b.type==='MotionSceneBlock'){
        b.props.focus?.forEach((k,i)=>{const prev=b.props.focus![i-1];if(!scene.narration?.[k.sentence-1]||prev&&(k.sentence<prev.sentence||k.sentence===prev.sentence&&k.at<=prev.at))ctx.addIssue({code:'custom',path:['scenes',index,'props'],message:'聚焦快照必须引用有效句号且严格递增'});});
        b.props.camera?.forEach((k,i)=>{const prev=b.props.camera![i-1];if(!scene.narration?.[k.sentence-1]||prev&&(k.sentence<prev.sentence||k.sentence===prev.sentence&&k.at<=prev.at))ctx.addIssue({code:'custom',path:['scenes',index,'props'],message:'镜头关键帧必须引用有效句号且严格递增'});});
        const first=scene.narration?.findIndex(s=>s.target===bi+1)??-1;
        for(const o of b.props.objects)o.keys.forEach((k,i)=>{const prev=o.keys[i-1];if(!scene.narration?.[k.sentence-1]||first<0||k.sentence<first+1||prev&&(k.sentence<prev.sentence||k.sentence===prev.sentence&&k.at<=prev.at))ctx.addIssue({code:'custom',path:['scenes',index,'props'],message:'连续动作关键帧须绑定入场后有效旁白句且时刻严格递增'});});
        for(const l of b.props.links)if(!scene.narration?.[l.sentence-1]||l.untilSentence&&!scene.narration?.[l.untilSentence-1])ctx.addIssue({code:'custom',path:['scenes',index,'props'],message:'连续连线句号必须存在'});
      }
      const steps=b.type==='TransferContainerBlock'||b.type==='BalanceScaleBlock'?b.props.steps:b.type==='TimelineBlock'?b.props.milestones:b.type==='StatBlock'&&b.props.counter?[b.props.counter]:undefined;
      if(!steps)return;
      steps.forEach((s,i)=>{if(!scene.narration?.[s.sentence-1]||(i>0&&s.sentence<=steps[i-1].sentence))ctx.addIssue({code:'custom',path:['scenes',index,'props'],message:'高级动作句号必须存在且严格递增'});});
      if(b.type==='TransferContainerBlock'||b.type==='BalanceScaleBlock'){
        const first=scene.narration?.findIndex(s=>s.target===bi+1)??-1;
        if(first+1!==steps[0].sentence||steps.some(s=>scene.narration?.[s.sentence-1]?.target!==bi+1))ctx.addIssue({code:'custom',path:['scenes',index,'props'],message:'容器/天平步骤必须绑定该块target，首步为首次入场句'});
      }
    });
    const limit = targetCount(scene);
    scene.keywords?.forEach((keyword,i)=>{if(!scene.narration?.[keyword.sentence-1]?.text.includes(keyword.text)) ctx.addIssue({code:'custom',path:['scenes',index,'keywords',i],message:'关键词必须出现在所绑定的分句中'});});
    if (scene.template !== 'CanvasSlide' && scene.visual?.parallax) ctx.addIssue({code:'custom',path:['scenes',index,'visual','parallax'],message:'parallax仅适用于CanvasSlide'});
    if (scene.template !== 'CanvasSlide' && scene.visual?.focus && scene.visual.focus !== 'normal') ctx.addIssue({code: 'custom', path: ['scenes', index, 'visual', 'focus'], message: 'dim/pulse仅适用于CanvasSlide整块聚焦'});
    scene.narration?.forEach((segment, segmentIndex) => {
      if (segment.target && segment.target > limit) ctx.addIssue({code: 'custom', path: ['scenes', index, 'narration', segmentIndex, 'target'], message: `目标超出范围，最多 ${limit} 项`});
    });
    scene.beats?.forEach((beat, beatIndex) => {
      if (beat.target > limit) ctx.addIssue({code: 'custom', path: ['scenes', index, 'beats', beatIndex, 'target'], message: `目标超出范围，当前场景最多 ${limit} 项`});
      if (beatIndex > 0 && beat.at <= scene.beats![beatIndex - 1].at) ctx.addIssue({code: 'custom', path: ['scenes', index, 'beats', beatIndex, 'at'], message: '节拍时间必须严格递增'});
    });
  });
  if (new Set(data.scenes.map(s => s.id)).size !== data.scenes.length) ctx.addIssue({code: 'custom', message: '分镜 ID 不能重复'});
});
export type Script = z.infer<typeof scriptSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type TimedNarration = z.infer<typeof narrationSchema> & {from: number; durationInFrames: number; audioSrc?: string};
export type TimedScene = Scene & {durationInFrames: number; audioSrc?: string; audioDurationSeconds?: number; narrationSegments?: TimedNarration[]};
/** master 每段一句实测配音：from为该段起始绝对帧，动作帧不随配音改变。 */
export type MasterNarration = {beat: number; from: number; durationInFrames: number; audioSrc: string};
export type Timeline = Omit<Script,'scenes'> & {scenes: TimedScene[]; totalFrames: number; sourceHash?: string; mode: 'tts' | 'silent'; masterNarration?: MasterNarration[]};
export function previewTimeline(script: Script): Timeline {
  if (script.master) return {...script, scenes: [], totalFrames: masterFrames(script.master) + script.tailPaddingFrames, mode: 'silent'};
  const scenes = script.scenes.map(scene => {
    if (!scene.narration?.length) return {...scene, durationInFrames: Math.max(90, Math.ceil(scene.voiceover.length / 4 * script.fps) + script.tailPaddingFrames)};
    let from = 0;
    const narrationSegments = scene.narration.map(segment => {
      const durationInFrames = Math.max(15, Math.ceil(segment.text.length / 4 * script.fps));
      const timed = {...segment, from, durationInFrames}; from += durationInFrames + 3; return timed;
    });
    return {...scene, narrationSegments, durationInFrames: from - 3 + script.tailPaddingFrames};
  });
  return {...script, scenes, totalFrames: scenes.reduce((n, s) => n + s.durationInFrames, 0), mode: 'silent'};
}
