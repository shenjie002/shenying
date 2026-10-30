import {extensionGuide} from './extensions';
import {canvasLeaves} from './canvas';
import type {Script} from './schema';

/** Shared by article generation and MCP: content-led decisions, not a template quota. */
export function directorGuide() {
  return `内容驱动的导演编排规则（生成时执行，不要输出分析过程）：
动态讲解的创作标准：不要把“安全、清晰”误解为小字、等大卡片、所有内容始终留在原地。默认先设计视觉主角与注意力交接，再选块；用户要求动态短视频时，优先用少量大字、明确字重/颜色层级和阶段构图，不以组件覆盖或特效数量为目标。每个讲解段内部规划：当前谁最大最突出、下一信息从哪里进入、旧信息如何缩成锚点或退出、结论如何接管画面。只将能执行的动作转换为JSON，禁止输出额外计划字段。
充分使用已有MotionSceneBlock能力：短标题与关键词可用fontSize接近受控上限，给足width/height并人工检查；不把所有文字都设成相同字号/字重。按sentence+at安排分层显露、局部放大、旧重点缩小退让、新重点接力；需要对照才保留两组，结束后清场给结论。关键帧之间加入必要的相同姿态以留阅读停顿，不让所有对象持续漂移。强调文字优先独立text对象，避免把完整旁白塞进panel；单个全宽舞台已足够时不机械拆成2～4个内容块。短说明留稳定，主题与对象tone保持语义一致；不虚构自定义字体、渐变材质、文字遮罩或跨幕形变等未实现字段。
布局与动作共同服务理解：对象关键动作可用spring-soft/spring-bouncy/spring-snappy，成组首次建立可用显式stagger错开3～5帧，背景可选低强度visual.ambient；不默认全员回弹或粒子常开，长正文保持稳定。准确参数与静止策略以rendererGuide为准。
布局与动作共同服务理解：在受控轨道内主动尝试“主角建立→缩为锚点→新信息接管→结论收束”，不是固定五段模板，不强求每幕都改构图。camera仅辅助聚焦，不能代替内容自身的层级与动作；不能把全员晃动、统一横移、句首高亮、背景微动或入场后等旁白当作连续讲解。已有能力不足时宁可简化并明确边界，不通过编造数据、坐标越界或改React源码伪装效果。
视觉选型矩阵：先依据用户偏好和讲解气质从当前主题目录选择全片palette（blue/editorial/light/vivid/ocean/sunrise/botanical/candy/neon/blueprint）；不能将示例blue当作必选，不逐幕随机换皮。当资料确有连续过程且用户要求动态演示时优先考虑MotionSceneBlock：把一句内部拆成错峰的建立、动作、接收/结果轨道，必要时重叠，并留阅读停顿；不要只做句首高亮、所有元素统一平移或靠背景晃动凑动态。运动设计优先主次对比、留白和动作接力；MotionSceneBlock可用camera缓慢聚焦、fontSize/fontWeight/emphasis渐变强调、短时jitter微抖及easing停稳，完整字段以契约为准。不能把每个元素一直抖动视为高级感，字幕和阅读正文保持稳定，放大后检查遮挡裁切。objects关键帧与links必须使用当前Schema，不伪造真实执行/内存通信。用户要求竖屏时输出format=portrait并减少多列；短问题和结论用RichTextBlock，循环概念可用CycleBlock。明确卡片归属变化用TransferContainerBlock，定性负担权衡且有资料依据才用BalanceScaleBlock，不把普通比较强行变成天平。数值显露用StatBlock.counter/BarChartBlock.countUp，实际起终点变化必须都有来源；阶段讲解可用TimelineBlock.milestones。图片仅用用户明确提供且已导入的有效本地素材路径；没有素材清单就不用ImageBlock，禁止虚构哈希或联网找图。每幕chapter/source只写资料有依据的内容。文章有明确可比数值时可用BarChartBlock或StatBlock，并用TrendingUp/Gauge作语义锚点；无数据禁止造数。技术选型的多个维度用CompareBlock，不预设左对右错；阶段/版本演进用TimelineBlock；线性过程用DiagramBlock/FlowSlide；有明确节点和关系用TopologyBlock；层级结构用TreeBlock；风险用CalloutBlock自动警告图标。技术主题可用Code2/Cpu/Database，网络用Server/Network/Globe，安全用ShieldCheck，模块用Layers/Box，流程用Workflow。IconBlock不是必选，不代替解释，不把所有图表硬塞进每篇文章；图表仅按各块声明的motion/milestones/counter执行受控动画，不承诺任意数据变形。
1. 先理解文章事实、核心问题、因果/流程、对比、代码、风险和已有数据，按讲解目的划分分镜；不是把每段原文机械映射成一页要点。内部先做讲解计划：观众要回答的问题、视觉主体、初始状态、关键变化、结束结论，再转换成已有组件JSON；不要输出未定义的plan字段。有明确状态/关系变化优先考虑MechanismBlock保持实体身份，通过完整快照展示变化；无过程的观点不要硬造状态动画。
避免连续多幕机械使用split-2-1代码+提示，特别是右侧卡片仅复述旁白时。代码与状态需要建立对应时，可使用grid左CodeBlock右MechanismBlock：CodeBlock.props.focus=[{sentence,line}]与机制steps.sentence使用同一句号联动，target仍选本句主要讲解块，每块至少被target一次。初学者先看具体语句，再看变化，最后回到代码验证；复杂图改全宽相邻分镜，不承诺无缝变形。不要用dim把联动代码暗化到难读，短代码固定画面，长行拆幕。状态变化可用单个全宽MechanismBlock，逐行分析用CodeSlide，比较用CompareBlock；布局变化服从理解目标，不为了多样性随机换模板。
2. 为每幕判断需要单一视角还是多个互补视角：单一引入用TitleSlide；逐行精讲代码用CodeSlide；独立流程用FlowSlide；两方案对比用CardSlide；原文命令及结果用TerminalSlide。只有要点就用BulletListSlide。选择依据是文章的内容关系，不是模板轮换。
3. 同一知识点存在需要同时对照的互补信息时，主动使用CanvasSlide组合，不要等用户指定块：代码+限制/陷阱=>CodeBlock+CalloutBlock；结论要点+原文明确数值=>BulletBlock+StatBlock；线性原理+代码=>DiagramBlock+CodeBlock；代码+关系图+风险=>CodeBlock与GroupBlock（内含DiagramBlock和CalloutBlock）。这些只是匹配条件，文章没有相应材料时禁止硬凑、编造代码/数据或图中因果关系。
4. 根据主次及阅读空间选布局：主内容+辅助解释用split-2-1；两个同权重内容用grid；同一栏上下补充用stacked嵌套GroupBlock。一般每幕2～4个内容块；连续过程或动态文字可由单个全宽MotionSceneBlock承载，不为凑块数拆散构图；非必要不嵌套，不以8块上限为目标。过长代码/文字应拆幕，而非塞进小卡片。原文没有代码/数据时也可组合BulletBlock+CalloutBlock，只要确有结论与限定条件。
5. 先确定完整blocks树，再按深度优先内容块编号写narration：讲主内容时target=对应块；讲辅助图/风险时绑定它们。GroupBlock不占编号。Canvas target控制整个块首次入场，内部代码行用CodeBlock.focus，状态/转移/节点用各块步骤契约；不支持的行内效果仍需拆幕。每个内容块必须至少被一句旁白target引用，避免只是装饰拼贴；不编造与文章无关的旁白填充块。
6. 按每幕语义选择visual，不是单一固定皮肤：技术/架构优先grid或code，核心概念用glow/aurora，数据密集优先plain，风险可用grain和border；CanvasSlide需要引导多块阅读时可选focus=dim或pulse。保持全片风格一致，宁可简洁也不要频繁翻转和扫光。仅使用受控计数和连线动作，不得编造词级连线追踪。\n7. 最后自检：事实能回到文章；每幕结构有讲解目的；visual/props/blocks/narration/subtitles完整且受支持；voiceover与分句一致；先后顺序能驱动真实入场；不混用beats。直接输出完整可渲染的script JSON，禁止只返回布局建议、占位文字、待补充内容或自创字段。不强制使用CanvasSlide，不为组合而组合。
${extensionGuide()}
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
