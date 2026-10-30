# 图表与语义图标

这些能力已接入实际文章生成请求：shared/canvas.ts 定义字段与约束，shared/capabilities.ts 的 rendererGuide 自动包含它们，shared/director.ts 提供按内容选图的规则；MCP shenying://renderer 同时暴露这些规则。不是只在AGENTS.md中声明。

## 内容选择

| 内容证据 | 推荐表达 |
| --- | --- |
| 明确顺序、生命周期 | DiagramBlock / FlowSlide |
| 系统节点及关系 | TopologyBlock |
| 两方案多个维度 | CompareBlock |
| 日期、版本、阶段演进 | TimelineBlock |
| 原文明确给出的可比数值 | BarChartBlock / StatBlock |
| 目录、模块上下级 | TreeBlock |
| 警告、提醒、正确结论 | CalloutBlock 自动状态图标 |
| 代码、网络、安全等主题锚点 | IconBlock 白名单图标 |

这不是强制配额。没有数值就不画数据图，不能编造性能、时间、关系。技术方案对比不默认左对右错，不能随意添加红叉或绿色对勾。图标只辅助语义，不代替解释；安全图标不代表软件通过了安全认证。

## 字段

所有内容块使用 `{id,type,props}`，放入 CanvasSlide 的 props.blocks，可与现有代码/要点/提示混排。精确限制以 shared/canvas.ts 为准。

- TopologyBlock: heading、nodes（2～6字符串）、edges（1～8项，每项from/to为从1开始节点编号，可选label）。固定双列节点布局并画箭头，标签较长可能截断，不是自动避让的专业图布局。
- CompareBlock: heading、columns（恰好两个标题）、rows（1～4项，每项label和两个values）。
- TimelineBlock: heading、events（2～5项，每项label及可选detail）。顺序以原文为准，不自动按日期排序。
- BarChartBlock: heading、可选unit、bars（1～5项，每项label及value）。value非负有限且至少一个正值。横向条形共享零基线，最大值占满轨道，其余按比例，精确值与单位同时显示。不支持负值、双轴、堆叠或环形图；可通过motion.grow/sequence显露柱形，并以countUp配合grow显示计数。
- TreeBlock: heading、nodes（2～6项，每项label及parent）。parent=0为根，否则引用之前节点的从1开始编号，禁止循环。缩进反映层级。
- IconBlock: name、label、tone（neutral/success/warning/danger/accent），使用本地lucide-react SVG，无远程请求。name白名单为 Code2、Terminal、Cpu、Database、GitBranch、Server、Globe、Layers、Network、ShieldCheck、Zap、Activity、Gauge、TrendingUp、CheckCircle2、TriangleAlert、Info、CircleX、Box、FileText、Settings、Workflow。

CalloutBlock 的warning/info/success分别自动使用TriangleAlert/Info/CheckCircle2。原有剧本无需修改即可得到状态图标。

## 真实控制范围

narration.target控制整个块的入场与边框焦点，不直接指向某根柱子、某个节点或矩阵行。BarChart的motion与countUp、Timeline的motion或milestones、Tree的motion以及StatBlock.counter提供声明式内部动作；cues.item可在支持的块中强调局部项，不能将item写成target。其余图表/图标无这些字段时保持静态。所有画布规则（最大8块、受限嵌套、不允许任意CSS/HTML/URL）继续生效。结构校验不能证明数值来源和内容真实性，必须人工审稿。

## 测试

`input/visualization-example.json` 提供三幕示例：指标+图标、拓扑+层级树、矩阵+时间轴。**其中指标是明确标注的虚构测试数据，不是任何产品的性能证据，不能混入正式文章。** 可用 `npm run validate:storyboard -- input/visualization-example.json 3` 校验，再通过网页JSON页导入预览。先备份当前项目，勿同时用CLI和网页写同一剧本。

## 自由布局、线条与图表动画更新

现支持layout=free与百分比placements自由错落位置/尺寸/层级；connectors提供实/虚/点线、无/单/双箭头、直线/折线/曲线及draw/flow/pulse。BarChart支持grow/sequence，Timeline与Tree支持sequence，均以有效旁白句首与帧进度驱动。其他图表默认静态，不支持所有动态图表或真实流式数据。shared/extensions.ts为内置分类能力目录，不是运行时动态插件加载器，不允许JSON执行代码。旧文“全部静态/不支持自由布局”以本节及准确Schema为准。示例input/free-canvas-example.json；详见[自由布局与连线说明](./free-layout-connections.md)。


## 竖屏与高级讲解表达

参阅 [short-video-presentation.md](short-video-presentation.md)：真正横竖屏、主题/章节/来源、RichTextBlock、受控本地ImageBlock、CycleBlock、TransferContainerBlock、BalanceScaleBlock，以及StatBlock.counter、BarChartBlock.countUp和TimelineBlock.milestones。旧版“仅固定数字、无图片/容器转移”等限制由本节限定能力替代；不支持任意CSS/JS、远程素材或自动数据真实性验证。生成与MCP使用同一Schema/能力契约，无新增素材写入MCP权限。草稿横屏960×540、竖屏540×960；每次实际使用需确认素材授权和人工检查裁切。


## 连续过程动画能力
生成和渲染现已支持受约束的 MotionSceneBlock 连续关键帧。详见 [continuous-motion.md](continuous-motion.md) 及 `input/continuous-motion-example.json`。该能力使用句内比例关键帧、确定性平滑插值和移动连线，不是任意代码执行或实时仿真；正文生成规则也已更新。
