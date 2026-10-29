import {canvasLeaves} from './canvas';
import type {Script} from './schema';

/** Shared by article generation and MCP: content-led decisions, not a template quota. */
export function directorGuide() {
  return `内容驱动的导演编排规则（生成时执行，不要输出分析过程）：
视觉选型矩阵：文章有明确可比数值时可用BarChartBlock或StatBlock，并用TrendingUp/Gauge作语义锚点；无数据禁止造数。技术选型的多个维度用CompareBlock，不预设左对右错；阶段/版本演进用TimelineBlock；线性过程用DiagramBlock/FlowSlide；有明确节点和关系用TopologyBlock；层级结构用TreeBlock；风险用CalloutBlock自动警告图标。技术主题可用Code2/Cpu/Database，网络用Server/Network/Globe，安全用ShieldCheck，模块用Layers/Box，流程用Workflow。IconBlock不是必选，不代替解释，不把所有图表硬塞进每篇文章；图内静态，不承诺动态柱条或节点聚焦。
1. 先理解文章事实、核心问题、因果/流程、对比、代码、风险和已有数据，按讲解目的划分分镜；不是把每段原文机械映射成一页要点。
2. 为每幕判断需要单一视角还是多个互补视角：单一引入用TitleSlide；逐行精讲代码用CodeSlide；独立流程用FlowSlide；两方案对比用CardSlide；原文命令及结果用TerminalSlide。只有要点就用BulletListSlide。选择依据是文章的内容关系，不是模板轮换。
3. 同一知识点存在需要同时对照的互补信息时，主动使用CanvasSlide组合，不要等用户指定块：代码+限制/陷阱=>CodeBlock+CalloutBlock；结论要点+原文明确数值=>BulletBlock+StatBlock；线性原理+代码=>DiagramBlock+CodeBlock；代码+关系图+风险=>CodeBlock与GroupBlock（内含DiagramBlock和CalloutBlock）。这些只是匹配条件，文章没有相应材料时禁止硬凑、编造代码/数据或图中因果关系。
4. 根据主次及阅读空间选布局：主内容+辅助解释用split-2-1；两个同权重内容用grid；同一栏上下补充用stacked嵌套GroupBlock。一般每幕2～4个内容块；非必要不嵌套，不以8块上限为目标。过长代码/文字应拆幕，而非塞进小卡片。原文没有代码/数据时也可组合BulletBlock+CalloutBlock，只要确有结论与限定条件。
5. 先确定完整blocks树，再按深度优先内容块编号写narration：讲主内容时target=对应块；讲辅助图/风险时绑定它们。GroupBlock不占编号。Canvas target只能控制整个块，不能承诺块内逐行高亮；需要逐行讲解时改用CodeSlide或拆幕。每个内容块必须至少被一句旁白target引用，避免只是装饰拼贴；不编造与文章无关的旁白填充块。
6. 按每幕语义选择visual，不是单一固定皮肤：技术/架构优先grid或code，核心概念用glow/aurora，数据密集优先plain，风险可用grain和border；CanvasSlide需要引导多块阅读时可选focus=dim或pulse。保持全片风格一致，宁可简洁也不要频繁翻转和扫光。不支持的计数器和连线追踪不得写入剧本。\n7. 最后自检：事实能回到文章；每幕结构有讲解目的；visual/props/blocks/narration/subtitles完整且受支持；voiceover与分句一致；先后顺序能驱动真实入场；不混用beats。直接输出完整可渲染的script JSON，禁止只返回布局建议、占位文字、待补充内容或自创字段。不强制使用CanvasSlide，不为组合而组合。
结构示例仅说明格式，不是当前文章事实，严禁照搬内容：
{"id":"example_canvas","template":"CanvasSlide","voiceover":"先看资料中的核心结论。 再看这一结论的适用条件。","visual":{"background":"glow","animation":"gentle","pace":"progressive"},"subtitles":true,"narration":[{"text":"先看资料中的核心结论。","target":1},{"text":"再看这一结论的适用条件。","target":2}],"props":{"heading":"结论与条件","layout":"split-2-1","blocks":[{"id":"key","type":"BulletBlock","props":{"heading":"核心结论","bullets":["从当前文章提炼真实结论"]}},{"id":"limit","type":"CalloutBlock","props":{"variant":"warning","text":"从当前文章提炼真实限定条件"}}]}}`;
}

/** Canvas-specific generation contract; legacy manual scripts remain compatible. */
export function validateCanvasDirection(script: Script) {
  script.scenes.forEach((scene, index) => {
    if (scene.template !== 'CanvasSlide') return;
    const fail = (message: string): never => {throw new Error(`分镜 ${index + 1}：${message}`);};
    if (!scene.visual || scene.subtitles === undefined || !scene.narration?.length) fail('AI画布必须包含visual、subtitles和narration');
    if (scene.beats?.length) fail('AI画布不能混用beats');
    canvasLeaves(scene.props.blocks).forEach((block, blockIndex) => {
      if (!scene.narration!.some(segment => segment.target === blockIndex + 1)) fail(`内容块 ${block.id} 未绑定讲解target=${blockIndex + 1}`);
    });
  });
}
