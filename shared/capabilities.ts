import type {Scene} from './schema';

/** Renderer contract: update this alongside SceneContent/Visuals when capabilities change. */
export const motionTiming = {autoRevealRatio: 0.68, titleSubtitleDelay: 12, codeVisibleLines: 11, terminalMaxTypingFrames: 45} as const;
export const sceneCapabilities = {
  TitleSlide: {props: '{title,subtitle}', motion: '标题入场，副标题延迟12帧入场；右侧固定装饰图形。target=1仅作合法占位，不控制标题/副标题时机。', advice: '标题建议24字以内。'},
  BulletListSlide: {props: '{heading,bullets:[字符串]}', motion: '1～6项按顺序入场，当前讲解项突出背景。target对应从1开始的要点序号。', advice: '每项建议30字以内。'},
  CodeSlide: {props: '{heading,language,code}', motion: '代码从开头即显示；progressive模式逐行高亮、其他行变暗并随焦点滚动，一屏最多11行。target对应真实代码行号（空行也计数）；caption显示在解释侧栏。all模式不高亮、不滚动，仅展示顶部11行。没有代码打字、执行或自动修改能力。', advice: '只使用文章代码，建议不超过11行，长行不会自动换行，需拆短。'},
  CardSlide: {props: '{heading,leftTitle,leftBody,rightTitle,rightBody}', motion: '左右两卡依次入场；target=1左卡、2右卡，仅控制首次入场，不切换高亮，不显示caption解释区。', advice: '每卡正文建议70字以内。'},
  FlowSlide: {props: '{heading,steps:[字符串],description}', motion: '2～5个步骤横排依次入场，箭头随步骤点亮，当前步骤高亮。target对应步骤序号；caption临时替换description。不支持分支、循环或任意连线。', advice: '每步骤建议20字以内。'},
  TerminalSlide: {props: '{heading,commands:[字符串],outputs:[字符串]}', motion: '1～5条命令顺序模拟打字，打完才显示同索引output；target对应命令序号。打字使用到下一命令前间隔的40%，最长45帧。all模式直接显示完整命令与输出。不会实际执行命令，不显示caption解释区。', advice: '只有原文明确提供命令与结果才用；输出按索引对应，保持简短。'},
} satisfies Record<Scene['template'], {props: string; motion: string; advice: string}>;

export function targetCount(scene: Scene): number {
  switch (scene.template) {
    case 'TitleSlide': return 1;
    case 'BulletListSlide': return scene.props.bullets.length;
    case 'CodeSlide': return scene.props.code.split('\n').length;
    case 'CardSlide': return 2;
    case 'FlowSlide': return scene.props.steps.length;
    case 'TerminalSlide': return scene.props.commands.length;
  }
}

export function rendererGuide() {
  return `申映实际渲染能力契约（只能规划这些能力，不得虚构actions、transition、camera等字段）：
${Object.entries(sceneCapabilities).map(([name, c]) => `${name}: ${c.props}；${c.motion} ${c.advice}`).join('\n')}
公共visual必须明确写出 {background:"glow"|"grid"|"plain",animation:"spring"|"gentle"|"none",pace:"progressive"|"all"}。
背景glow为微动光晕，grid叠加网格，plain纯色；spring柔和弹簧入场，gentle轻缓位移，none取消入场位移与背景微动，但不取消progressive的延迟、代码焦点或终端打字。pace=all取消分步入场及终端打字，但列表/流程的当前项仍可随时间高亮。
分步首次入场优先使用首个匹配narration.target的句首，其次首个匹配beats.target的比例时刻，否则均匀安排在分镜前68%。活动焦点只要有句子target就按最近已开始的绑定句决定，否则按beats，再否则自动推进。重复target不会重复入场。
AI生成时优先用narration组织讲解：每句{text,target?,caption?}，text非空不超过500字，每幕1～50句；voiceover必须等于各句text用一个空格连接。target只绑定实际要讲的元素；按首次出现顺序递增安排要点/卡片/流程/命令，避免后项先出现。代码可回看已讲行。TitleSlide不要绑定target。
只用narration，不同时生成beats；不要猜测秒数或生成audioSrc、durationInFrames、totalFrames。分句TTS按实测句首触发，静音为估算，不是逐字对齐。caption是代码/流程解释文案，不是旁白字幕；真正字幕由subtitles=true开启。
不支持镜头推拉、任意对象移动、截图标注、机制图、背景音乐、转场或分镜底部进度条。不要在旁白里承诺这些画面。先选适合内容的模板，再将旁白句子与真实可显示元素对应。`;
}
