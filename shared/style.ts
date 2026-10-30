import {ambientSchema,effectsGuide} from './motion-effects';
import {z} from 'zod';

export const backgroundLabels = {glow: '微动光晕', grid: '科技网格', plain: '纯色背景', aurora: '弥散极光', grain: '细颗粒质感', spotlight: '斜向柔光', code: '代码暗纹'} as const;
export const animationLabels = {spring: '柔和弹簧', gentle: '轻缓位移', none: '无入场动画', pop: '弹簧缩放', flip: '透视翻转', border: '边框亮起', wipe: '遮罩展开'} as const;
export const focusLabels = {normal: '默认焦点', dim: '整块聚焦与暗化（混合画布）', pulse: '低频呼吸边框（混合画布）'} as const;
export const backgroundNames = ['glow', 'grid', 'plain', 'aurora', 'grain', 'spotlight', 'code'] as const;
export const animationNames = ['spring', 'gentle', 'none', 'pop', 'flip', 'border', 'wipe'] as const;
export const focusNames = ['normal', 'dim', 'pulse'] as const;
export const visualSchema = z.object({
  ambient: ambientSchema.optional(),
  background: z.enum(backgroundNames), animation: z.enum(animationNames), pace: z.enum(['progressive', 'all']),
  camera: z.enum(['none','push','pull']).optional(),
  parallax: z.boolean().optional(),
  focus: z.enum(focusNames).optional(),
});
import {polishGuide} from './polish';
export const styleGuide = `画面风格（每幕根据文章内容选择，保持全片一致性，不为炫技逐幕随机换风格）：
visual.background=${backgroundNames.join('|')}。glow微动光晕；grid低对比科技网格；plain纯色；aurora蓝紫弥散极光；grain确定性细颗粒（不是随机闪烁）；spotlight低强度斜向柔光；code固定装饰代码暗纹（不是文章代码、不包含资料文本，不可当作教学内容）。
visual.animation=${animationNames.join('|')}。spring柔和弹簧位移；gentle轻缓位移；none无入场/背景运动；pop从85%弹簧缩放；flip轻微透视翻转；border临时边框亮起并淡入；wipe对整个内容容器从左向右遮罩展开，不是逐字打字机。入场仅作用于实际使用Reveal的区域：全屏代码和终端窗口没有整体入场，标题及卡片/项目/画布内容块有；无任意相机路径或整幕转场。
visual.pace仍只有progressive|all，独立控制分步等待，不把布局或聚焦策略写进pace。visual.focus可选normal|dim|pulse，默认normal；dim仅CanvasSlide对非活动整块轻度暗化；pulse仅CanvasSlide当前整块低频呼吸边框，不是代码词语圈选或图节点焦点。其他模板只用normal或省略focus。none会冻结呼吸与背景，但不取消旁白驱动的入场等待、代码焦点或终端打字。
技术/代码/架构优先grid或code，gentle或pop；核心概念优先glow/aurora和gentle/flip；风险提示可用grain和border，CanvasSlide按需要选择pulse；数据密集或长文优先plain/grid和gentle，避免光效抢占阅读。不要把警告色误用为事实判定，不连续高频闪烁。信息复杂时优先清晰而不是特效数量。
${effectsGuide}
已实现受控StatBlock计数与BarChart countUp；仍未实现任意数据驱动图表变形、九宫格专项模式、任意文字圈选、按配音追踪图内连线、碎片/像素解体、自动图内分步动画。${polishGuide}\n`;

/** Frame-based focus styling, independent of wall clock and CSS animation. */
export function canvasFocus(focus: 'normal' | 'dim' | 'pulse', active: number, index: number, frame: number, moving: boolean) {
  const selected = active === index;
  const pulse = moving ? (Math.sin(frame / 30) + 1) / 2 : 0.5;
  return {
    opacity: focus === 'dim' && active >= 0 && !selected ? 0.48 : 1,
    boxShadow: focus === 'pulse' && selected ? `0 0 ${12 + pulse * 12}px rgba(166,185,255,${0.15 + pulse * 0.15})` : 'none',
  };
}
