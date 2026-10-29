import {z} from 'zod';

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
  voiceover: z.string().trim().min(1).max(5000),
  narration: z.array(narrationSchema).min(1).max(50).optional(),
  subtitles: z.boolean().optional(),
  visual: z.object({
    background: z.enum(['glow', 'grid', 'plain']),
    animation: z.enum(['spring', 'gentle', 'none']),
    pace: z.enum(['progressive', 'all']),
  }).optional(),
  beats: z.array(beatSchema).max(30).optional(),
};
export const sceneSchema = z.discriminatedUnion('template', [
  z.object({...base, template: z.literal('TitleSlide'), props: z.object({title: text, subtitle: z.string().max(500).default('')})}),
  z.object({...base, template: z.literal('BulletListSlide'), props: z.object({heading: text, bullets: z.array(text).min(1).max(6)})}),
  z.object({...base, template: z.literal('CodeSlide'), props: z.object({heading: text, language: z.string().max(30), code: z.string().min(1).max(5000)})}),
  z.object({...base, template: z.literal('FlowSlide'), props: z.object({heading: text, steps: z.array(z.string().trim().min(1).max(80)).min(2).max(5), description: z.string().max(300).default('')})}),
  z.object({...base, template: z.literal('TerminalSlide'), props: z.object({heading: text, commands: z.array(z.string().trim().min(1).max(240)).min(1).max(5), outputs: z.array(z.string().max(600)).max(5).default([])})}),
  z.object({...base, template: z.literal('CardSlide'), props: z.object({heading: text, leftTitle: text, leftBody: text, rightTitle: text, rightBody: text})}),
]);
export const scriptSchema = z.object({
  title: text, fps: z.literal(30).default(30), tailPaddingFrames: z.number().int().min(0).max(90).default(12),
  scenes: z.array(sceneSchema).min(1).max(30),
}).superRefine((data, ctx) => {
  data.scenes.forEach((scene, index) => {
    const limit = scene.template === 'CodeSlide' ? scene.props.code.split('\n').length
      : scene.template === 'BulletListSlide' ? scene.props.bullets.length
      : scene.template === 'FlowSlide' ? scene.props.steps.length
      : scene.template === 'TerminalSlide' ? scene.props.commands.length
      : scene.template === 'CardSlide' ? 2 : 1;
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
export type Timeline = Omit<Script, 'scenes'> & {scenes: TimedScene[]; totalFrames: number; sourceHash?: string; mode: 'tts' | 'silent'};
export function previewTimeline(script: Script): Timeline {
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
