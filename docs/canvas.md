# 混合画布 CanvasSlide

在同一幕组合代码、要点、提示、数据、节点图，以及拓扑、矩阵、时间轴、柱图、树、语义图标，保留原有六种全屏模板。示例见 [input/canvas-example.json](../input/canvas-example.json)：左侧代码 + 右侧嵌套的图解与警告卡。

## 本地模型专项测试

将 [Rust 测试任务与文章](../input/rust-canvas-test.md) 交给能读取项目规则的本地模型，先确认未占用的新JSON路径，再生成并执行 `npm run validate:storyboard -- <已确认的新稿路径> 5`（替换占位符）。校验不会覆盖当前项目；通过后经用户确认从网页JSON页导入预览，不覆盖已有稿件。

另支持拓扑、对比矩阵、时间轴、柱状图、层级树和白名单语义图标，见[图表与图标指南](./visualizations.md)。AI依据文章证据选择，数据不可编造；target仅控制整块，块内受控动画使用各块声明的独立字段。

## AI 根据文章自主组合

文章生成实际请求会加载 shared/director.ts 的导演规则：先识别核心结论、代码、因果、对比、风险和已有数据，再决定单模板或同幕多块组合。代码与风险适合代码块+提示，结论与原文数值适合要点+数据，线性原理与实现可用图+代码。AI 根据主次选择分栏/网格/嵌套堆叠，直接输出完整布局和分句target，不要求用户手选组件；材料不支持的组合不得硬凑。每个生成画布内容块必须绑定至少一句旁白，否则生成校验拒绝应用。此规则同时通过MCP的shenying://renderer提供给外部Agent。提示与结构校验不能保证语义正确，仍须人工审稿。

## 结构

CanvasSlide 仍有普通分镜的 id、voiceover、visual、narration、subtitles；布局全部放在 props 内：

```json
{
  "heading": "代码与提示同屏",
  "layout": "split-2-1",
  "blocks": [
    {"id":"code","type":"CodeBlock","props":{"language":"rust","code":"let s = String::from(\"hello\");"}},
    {"id":"tip","type":"CalloutBlock","props":{"variant":"info","text":"String 拥有堆上的字符串数据。"}}
  ]
}
```

- layout: split-2-1（两列2:1）、grid（等宽两列）、stacked（纵向）、free（根布局百分比矩形，须完整placements）。非free布局只有一块时占满容器。
- 内容块包括CodeBlock、BulletBlock、CalloutBlock、StatBlock、DiagramBlock及下文图表、机制、连续过程、富文本和本地图片等；完整白名单以shared/canvas.ts为准。
- 容器：`{id,type:"GroupBlock",layout,blocks}`，没有props。可嵌套两层，各层1～4块，全幕不超过8个内容块；块ID全幕唯一。
- DiagramBlock 是横向静态线性节点图，可设置静态activeNode；不是自由连线架构图。StatBlock 数值必须来自已核实材料，不能为展示效果编造百分比。
- 内容块完整参数及能力由 shared/canvas.ts 定义，自动进入 AI 提示与 MCP shenying://renderer。未知类型、任意CSS/HTML/URL字段不受支持。

## 动画与旁白

narration.target 按深度优先遍历**内容块**从1编号，GroupBlock 不占编号。示例中代码=1、图=2、提示=3。target 控制整块首次入场及边框聚焦；不控制块内部的代码行、节点或项目。caption 没有显示区域；旁白字幕仍使用 subtitles=true。

每块使用全幕 visual 的入场模式；新增背景、缩放/翻转/遮罩及可选dim/pulse整块聚焦见[视觉风格](./visual-style.md)。未绑定时沿用分步自动时序；all 让全部块开头显示，焦点边框仍跟随讲解。改变结构或顺序后必须重新核对target。

## 代码与机制联动

CodeBlock新增可选`props.focus:[{sentence,line}]`，按本幕旁白句首聚焦真实代码行（含空行），并展示焦点附近最多8行。sentence严格递增，line可回看；句子须有有效画布target，且不得早于代码块首次target句。旧CodeBlock无focus时仍静态。target不变，仍控制整块；机制steps.sentence可与代码focus使用同一句号，完成左代码右关系的联动。每块须至少有一句target。pace=all不关闭内部联动。示例`input/code-mechanism-example.json`；精确约束见shared/schema.ts与shared/code-focus.ts。

## 编辑与限制

网页选择“混合画布”后，默认显示组合摘要（例如“代码＋节点图＋警告卡”）、嵌套布局结构示意及逐句旁白目标列表；结构图不是最终成片截图。未绑定内容块或失效目标会有提示。AI待审稿也显示相同说明，无需阅读JSON即可核对组合。高级布局JSON编辑默认折叠，修改后点击“校验并应用画布布局”再保存剧本。该版本不是拖拽编辑器，不支持任意像素坐标、浏览器截图或远程素材；受控百分比free布局与本地ImageBlock见下文。可从完整JSON页导入示例，但请先备份已有稿件。

内容区固定高度，超出内容会被裁切，不会自动分页或缩字。推荐每幕2～4块；代码建议6行以内、卡片短文、图节点短标签。最多8块只是结构上限，不代表8块长文都可读。嵌套过多会压缩空间，必须实际预览验收。

## 状态与关系演示（首版）

MechanismBlock按旁白分句切换固定实体的完整状态与关系快照，不再只做卡片先后入场。先规划理解目标、主体、初始状态、变化与结论；资料无变化时不强制动画。Schema/运行时共享shared/mechanism.ts，跨字段校验句号与target；MCP schema/renderer资源自动包含新契约，未增加权限或外部请求。编辑入口为画布JSON，组合说明展示步骤，网页提供非阻断编排提示。示例input/mechanism-example.json覆盖Rust Move/Borrow与教学订单；并非保证任意话题自动好看。详见[状态演示说明](./mechanisms.md)。

## JSON创作与增量渲染

新增CanvasSlide.props.cues支持按句显隐、局部item强调、根布局切换、focus临时全宽与恢复；MechanismBlock支持visible、预设slot移动、container归属标签及关系emphasis。全部为完整快照与受约束参数，不是自由CSS或任意动画。Agent只改JSON，现有API/MCP权限、确认与任务锁不变；没有新增内置聊天界面。正式/草稿渲染按分镜复用视觉缓存，变化幕重绘，连续音轨及完整容器重新合成；不是任意帧或区域级重渲染。保存变更后仍需重新准备时间轴。示例input/creative-example.json；准确字段和不支持项见[JSON创作说明](./json-creation.md)，不得承诺任意创作。

## 自由布局、线条与图表动画更新

现支持layout=free与百分比placements自由错落位置/尺寸/层级；connectors提供实/虚/点线、无/单/双箭头、直线/折线/曲线及draw/flow/pulse。BarChart支持grow/sequence，Timeline与Tree支持sequence，均以有效旁白句首与帧进度驱动。其他图表默认静态，不支持所有动态图表或真实流式数据。shared/extensions.ts为内置分类能力目录，不是运行时动态插件加载器，不允许JSON执行代码。旧文“全部静态/不支持自由布局”以本节及准确Schema为准。示例input/free-canvas-example.json；详见[自由布局与连线说明](./free-layout-connections.md)。


## 竖屏与高级讲解表达

参阅 [short-video-presentation.md](short-video-presentation.md)：真正横竖屏、主题/章节/来源、RichTextBlock、受控本地ImageBlock、CycleBlock、TransferContainerBlock、BalanceScaleBlock，以及StatBlock.counter、BarChartBlock.countUp和TimelineBlock.milestones。旧版“仅固定数字、无图片/容器转移”等限制由本节限定能力替代；不支持任意CSS/JS、远程素材或自动数据真实性验证。生成与MCP使用同一Schema/能力契约，无新增素材写入MCP权限。草稿横屏960×540、竖屏540×960；每次实际使用需确认素材授权和人工检查裁切。


## 连续过程动画能力
生成和渲染现已支持受约束的 MotionSceneBlock 连续关键帧。详见 [continuous-motion.md](continuous-motion.md) 及 `input/continuous-motion-example.json`。该能力使用句内比例关键帧、确定性平滑插值和移动连线，不是任意代码执行或实时仿真；正文生成规则也已更新。
