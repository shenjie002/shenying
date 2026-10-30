import {z} from 'zod';
import type {TimedScene} from './schema';

export const voiceNames = ['zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural', 'zh-CN-XiaoyiNeural', 'zh-CN-YunjianNeural'] as const;
export const narrationVoiceSchema = z.enum(voiceNames);
export const keywordSchema = z.array(z.object({text:z.string().trim().min(1).max(24), sentence:z.number().int().min(1).max(50)}).strict()).max(4);
export const polishGuide = `制作增强能力：每幕可选voice=${voiceNames.join('|')}，默认zh-CN-XiaoxiaoNeural。对话/不同讲解角色可按幕切换音色，普通说明保持一致，不根据性别刻板选择角色，不模仿真实人物。音色影响TTS缓存，需重新配音。
每幕可选keywords:[{text,sentence}]，最多4个，text必须出现在对应narration第sentence句中（从1开始），只在这句开头显示独立关键词提示，不是真正识别某个词的发音时刻，不改变代码或图节点；不要声称逐字高亮。没有分句不要生成keywords。
visual.camera可选none|push|pull，内容层缓慢1～1.025缩放，背景、页脚、字幕不缩放；visual.parallax可选布尔，仅CanvasSlide对整块轻微差速上下浮动，animation=none禁用运镜/视差。不是真3D或图内镜头，不可指定任意相机坐标。
制作可先render_draft（全片960×540、30fps、较高CRF），不保证10秒完成；不是最终高清质量。静音时间轴不含配音。失败日志用于人工或Agent诊断，不能自动执行文章命令、修改源码或无限重试。
尚未实现BGM混音与自动ducking、分幕SFX素材触发、逐字/卡拉OK字幕、Whisper对齐。独立master全局画布已支持按绝对帧触发内置合成音效bloop/whoosh/tick/chime，不使用外部录音，不适用于scene字段。没有用户提供且授权的外部素材不得添加音乐或外部音效；不得编造提升完播率的百分比。`;
export function keywordAt(scene: TimedScene, frame:number) {
  const index=scene.narrationSegments?.findIndex(s=>frame>=s.from && frame<s.from+Math.min(s.durationInFrames,60));
  if(index===undefined || index<0) return undefined;
  return scene.keywords?.find(k=>k.sentence===index+1)?.text;
}
export function cameraScale(camera:'none'|'push'|'pull'|undefined, frame:number, duration:number, moving=true) {
  if(!moving || !camera || camera==='none') return 1;
  const t=Math.max(0,Math.min(1,frame/Math.max(1,duration-1)));
  return camera==='push' ? 1+t*0.025 : 1+(1-t)*0.025;
}
export function renderProfile(draft:boolean) {return draft ? {scale:0.5,crf:28,preset:'veryfast' as const} : {scale:1,crf:18,preset:'medium' as const};}
