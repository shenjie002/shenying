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
- BarChartBlock: heading、可选unit、bars（1～5项，每项label及value）。value非负有限且至少一个正值。横向条形共享零基线，最大值占满轨道，其余按比例，精确值与单位同时显示。不支持负值、双轴、堆叠、环形、逐柱增长。
- TreeBlock: heading、nodes（2～6项，每项label及parent）。parent=0为根，否则引用之前节点的从1开始编号，禁止循环。缩进反映层级。
- IconBlock: name、label、tone（neutral/success/warning/danger/accent），使用本地lucide-react SVG，无远程请求。name白名单为 Code2、Terminal、Cpu、Database、GitBranch、Server、Globe、Layers、Network、ShieldCheck、Zap、Activity、Gauge、TrendingUp、CheckCircle2、TriangleAlert、Info、CircleX、Box、FileText、Settings、Workflow。

CalloutBlock 的warning/info/success分别自动使用TriangleAlert/Info/CheckCircle2。原有剧本无需修改即可得到状态图标。

## 真实控制范围

图表和图标内部都是静态的；narration.target 控制整个块的入场与边框焦点，不是某根柱子、某个节点或矩阵行。所有画布规则（最大8块、受限嵌套、不允许任意CSS/HTML/URL）继续生效。结构校验不能证明数值来源和内容真实性，必须人工审稿。

## 测试

`input/visualization-example.json` 提供三幕示例：指标+图标、拓扑+层级树、矩阵+时间轴。**其中指标是明确标注的虚构测试数据，不是任何产品的性能证据，不能混入正式文章。** 可用 `npm run validate:storyboard -- input/visualization-example.json 3` 校验，再通过网页JSON页导入预览。先备份当前项目，勿同时用CLI和网页写同一剧本。
