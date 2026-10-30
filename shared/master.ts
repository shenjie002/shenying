import {z} from 'zod';
import {spring} from 'remotion';
import {springConfigs, springNames} from './motion-effects';
import {sfxSchema} from './sfx';

export const masterIconNames = ['Brain','Workflow','Terminal','FileText','Cpu','Database','Server','Globe','Layers','Box','Sparkles','Zap','Activity','Gauge','TrendingUp','ShieldCheck','Network','GitBranch','Settings','Code2','Check','ArrowRight','AudioLines','Lightbulb'] as const;
export const springConfigSchema = z.object({damping:z.number().min(5).max(40), stiffness:z.number().min(40).max(400), mass:z.number().min(0.3).max(2)}).strict();

/**
 * 单根全局画布（MasterComposition）。
 *
 * 与既有分幕结构的关键差别：没有 scene 边界，所有元素是带全局生命周期的“演员”，
 * 关键帧绑定绝对帧数，因此“标题缩小飞到角落变成标签”这类跨段连续运镜天然成立。
 * 明确限制：帧数是写死的（不走 TTS 估时），不做逐词音频对齐，也不是任意 CSS/JS。
 */
export const masterToneSchema = z.enum(['normal','muted','highlight','accent','teal','rose','warning']);
export const masterEasingSchema = z.enum(['linear','smooth','settle',...springNames]);

export const masterActorKeySchema = z.object({
  frame: z.number().int().min(0).max(20000),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  scale: z.number().min(0.15).max(3).default(1),
  opacity: z.number().min(0).max(1).default(1),
  rotate: z.number().min(-25).max(25).default(0),
  /** 屏幕法线方向位移（px，按 960 高缩放）：负值在远处，正值扑向观众。 */
  z: z.number().min(-400).max(600).default(0),
  rotateX: z.number().min(-22).max(22).default(0),
  rotateY: z.number().min(-22).max(22).default(0),
  progress: z.number().min(0).max(1).default(1),
  spring: springConfigSchema.optional(),
  easing: masterEasingSchema.default('smooth'),
});

export const masterActorSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(40),
  label: z.string().trim().min(1).max(60),
  detail: z.string().trim().max(80).optional(),
  badge: z.string().trim().max(10).optional(),
  kind: z.enum(['text','card','chip','line','icon','ring','doodle']).default('text'),
  icon: z.enum(masterIconNames).optional(),
  iconMotion: z.enum(['none','draw','pulse','spin']).default('none'),
  decoration: z.enum(['underline','circle','arrow','spark']).default('underline'),
  tone: masterToneSchema.default('normal'),
  fontSize: z.number().min(12).max(120).default(44),
  fontWeight: z.number().int().min(300).max(900).default(700),
  width: z.number().min(6).max(96).default(40),
  glow: z.boolean().default(false),
  float: z.number().min(0).max(3).default(0),
  /** 视差系数：0=几乎钉在远景、1=跟随镜头、1.6=比镜头更近。 */
  depth: z.number().min(0).max(2).default(1),
  keys: z.array(masterActorKeySchema).min(2).max(16),
}).superRefine((actor, ctx) => {
  actor.keys.forEach((k, i) => {
    if (i > 0 && k.frame <= actor.keys[i - 1].frame) {
      ctx.addIssue({code: 'custom', path: ['keys'], message: `${actor.id}关键帧必须按绝对帧严格递增`});
    }
  });
});

export const masterBeatSchema = z.object({
  text: z.string().trim().min(1).max(160),
  frames: z.number().int().min(20).max(900),
});

export const masterCameraKeySchema = z.object({
  frame: z.number().int().min(0).max(20000),
  x: z.number().min(10).max(90),
  y: z.number().min(10).max(90),
  zoom: z.number().min(1).max(2.4),
  easing: masterEasingSchema.default('smooth'),
});

export const masterSchema = z.object({
  backdrop: z.enum(['aurora','grid','none']).default('aurora'),
  beats: z.array(masterBeatSchema).min(1).max(20),
  actors: z.array(masterActorSchema).min(1).max(16),
  sfx: z.array(sfxSchema).max(60).default([]),
  /** 默认静音：保留触发点与画面节奏，但不发声；显式false才混入成片和预览。 */
  sfxMuted: z.boolean().default(true),
  camera: z.array(masterCameraKeySchema).min(2).max(12).optional(),
}).superRefine((master, ctx) => {
  const total = master.beats.reduce((n, b) => n + b.frames, 0);
  const ids = new Set<string>();
  master.actors.forEach((actor) => {
    if (ids.has(actor.id)) ctx.addIssue({code:'custom',path:['actors'],message:'演员ID不得重复'});
    ids.add(actor.id);
    if (actor.kind === 'icon' && !actor.icon) ctx.addIssue({code:'custom',path:['actors'],message:'icon演员必须指定白名单icon'});
    if (actor.keys[actor.keys.length - 1].frame > total) {
      ctx.addIssue({code: 'custom', path: ['actors'], message: `${actor.id}关键帧超出总时长`});
    }
  });
  master.sfx.forEach((event, i) => {
    if (event.frame >= total) ctx.addIssue({code:'custom',path:['sfx',i,'frame'],message:'音效必须在画布结束前触发'});
  });
  master.camera?.forEach((k, i) => {
    if (k.frame > total) ctx.addIssue({code: 'custom', path: ['camera'], message: '镜头关键帧超出总时长'});
    if (i > 0 && k.frame <= master.camera![i - 1].frame) {
      ctx.addIssue({code: 'custom', path: ['camera'], message: '镜头关键帧必须严格递增'});
    }
  });
});

export const masterGuide = `独立全局画布master（不是scene字段）：用于用户连续动效短片创作的固定时长模式，scenes:[]与master互斥，根tailPaddingFrames:0可实现精确时长。master={backdrop:aurora|grid|none,beats:[{text,frames}],actors:[...],camera?,sfx?}；总帧为beats.frames之和，fps30。文章生成由请求mode选择：scenes遵守分镜数，master按目标时长生成完整连续编排。无配音模式保留内置音效；可选配音为每个beat一句、从段首播放，配音不得超过该段frames（超长报错），不走TTS自动对时、不支持逐词同步，beat.text宜按约每秒4字留足余量。
actors 1～16，id唯一、label必填≤60，kind=text|card|chip|line|icon|ring|doodle，width6～96%、fontSize12～120、fontWeight300～900、tone=normal|muted|highlight|accent|teal|rose|warning，depth0～2、float0～3、glow布尔、detail≤80、badge≤10。icon必须从${masterIconNames.join('|')}选择，iconMotion=none|draw|pulse|spin，draw按progress逐笔显露；ring按progress绘制进度环（不是认证/数据验证）；doodle的decoration=underline|circle|arrow|spark为固定手绘路径，不支持外部SVG或任意插画。
每演员keys2～16项：{frame,x,y,scale?,opacity?,rotate?,z?,rotateX?,rotateY?,progress?,easing?,spring?}。绝对frame0～20000严格递增且≤总帧，首帧前不可见，最后姿态持续；x/y0～100、scale0.15～3、opacity/progress0～1、rotate±25、z -400～600、rotateX/Y±22。easing在区间起点控制到下一帧，可用linear|smooth|settle|spring-soft|spring-bouncy|spring-snappy|spring-jelly；弹簧由Remotion spring()执行，可选spring:{damping:5～40,stiffness:40～400,mass:0.3～2}覆盖物理参数（仅master）。运动可超调、透明度和绘制进度有界，终点精确停靠；回弹段推荐15～30帧，不是碰撞/实时物理。相机camera2～12项{frame,x:10～90,y:10～90,zoom:1～2.4,easing?}，CSS透视/分层视差，不是真实光照。
master.sfx最多60项{frame,sound:bloop|whoosh|tick|chime,gain:0～0.6默认0.3}，master.sfxMuted默认true（音效静音，只保留触发点；配音不受影响），显式false才发声；帧必须<总帧；本地确定性合成提示音/扫风声，按全局帧混合，重叠输出硬限幅0.95，可能失真故稀疏安排。没有第三方录音、任意音频路径、BGM或ducking；不下载外部素材。详情docs/master-composition.md。`;

export type Master = z.infer<typeof masterSchema>;
export type MasterActor = z.infer<typeof masterActorSchema>;
export type MasterActorKey = z.infer<typeof masterActorKeySchema>;
export type MasterCameraKey = z.infer<typeof masterCameraKeySchema>;

export function masterFrames(master: Master): number {
  return master.beats.reduce((n, b) => n + b.frames, 0);
}

function ease(p: number, easing: MasterActorKey['easing']): number {
  const t = Math.min(1, Math.max(0, p));
  if (easing === 'linear') return t;
  if (easing === 'settle') return 1 - Math.pow(1 - t, 3);
  return t * t * (3 - 2 * t);
}

function track<K extends {frame: number; easing: MasterActorKey['easing']; spring?: z.infer<typeof springConfigSchema>}>(keys: K[], frame: number) {
  if (frame <= keys[0].frame) return {a: keys[0], b: keys[0], p: 0};
  const last = keys[keys.length - 1];
  if (frame >= last.frame) return {a: last, b: last, p: 0};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const raw = (frame - a.frame) / (b.frame - a.frame);
      const p = a.easing.startsWith('spring-') && raw < 1
        ? spring({frame:frame-a.frame,fps:30,durationInFrames:b.frame-a.frame,config:a.spring ?? springConfigs[a.easing as keyof typeof springConfigs]})
        : ease(raw, a.easing);
      return {a, b, p, bounded:ease(raw,a.easing.startsWith('spring-')?'smooth':a.easing)};
    }
  }
  return {a: last, b: last, p: 0};
}

export function actorPose(actor: MasterActor, frame: number) {
  if (frame < actor.keys[0].frame) return {...actor.keys[0], opacity:0};
  const {a, b, p, bounded} = track(actor.keys, frame);
  const mix = (key: 'x' | 'y' | 'scale' | 'opacity' | 'rotate' | 'z' | 'rotateX' | 'rotateY' | 'progress') => a[key] + (b[key] - a[key]) * (key==='opacity'||key==='progress' ? bounded ?? p : p);
  return {x: mix('x'), y: mix('y'), scale: Math.max(0.05,mix('scale')), opacity: mix('opacity'), rotate: mix('rotate'), z: Math.min(700,mix('z')), rotateX: mix('rotateX'), rotateY: mix('rotateY'), progress:mix('progress')};
}

export function cameraPoseAt(master: Master, frame: number) {
  if (!master.camera?.length) return {x: 50, y: 50, zoom: 1};
  const {a, b, p} = track(master.camera, frame);
  return {x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, zoom: a.zoom + (b.zoom - a.zoom) * p};
}

export function beatAt(master: Master, frame: number) {
  let from = 0;
  for (let i = 0; i < master.beats.length; i++) {
    const beat = master.beats[i];
    if (frame < from + beat.frames || i === master.beats.length - 1) {
      return {index: i, beat, from, local: frame - from};
    }
    from += beat.frames;
  }
  return {index: 0, beat: master.beats[0], from: 0, local: frame};
}
