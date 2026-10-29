# 混合画布 CanvasSlide

在同一幕组合代码、要点、提示、数据、节点图，以及拓扑、矩阵、时间轴、柱图、树、语义图标，保留原有六种全屏模板。示例见 [input/canvas-example.json](../input/canvas-example.json)：左侧代码 + 右侧嵌套的图解与警告卡。

## 本地模型专项测试

将 [Rust 测试任务与文章](../input/rust-canvas-test.md) 交给能读取项目规则的本地模型，生成 input/rust-canvas-generated.json，再执行 `npm run validate:storyboard -- input/rust-canvas-generated.json 5`。校验不会覆盖当前项目；通过后从网页JSON页导入预览。

另支持拓扑、对比矩阵、时间轴、柱状图、层级树和白名单语义图标，见[图表与图标指南](./visualizations.md)。AI依据文章证据选择，数据不可编造；图内静态，旁白仅控制整块。

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

- layout: split-2-1（两列2:1）、grid（等宽两列）、stacked（纵向）。只有一块时占满容器。
- 内容块：CodeBlock、BulletBlock、CalloutBlock、StatBlock、DiagramBlock。
- 容器：`{id,type:"GroupBlock",layout,blocks}`，没有props。可嵌套两层，各层1～4块，全幕不超过8个内容块；块ID全幕唯一。
- DiagramBlock 是横向静态线性节点图，可设置静态activeNode；不是自由连线架构图。StatBlock 数值必须来自已核实材料，不能为展示效果编造百分比。
- 内容块完整参数及能力由 shared/canvas.ts 定义，自动进入 AI 提示与 MCP shenying://renderer。未知类型、任意CSS/HTML/URL字段不受支持。

## 动画与旁白

narration.target 按深度优先遍历**内容块**从1编号，GroupBlock 不占编号。示例中代码=1、图=2、提示=3。target 控制整块首次入场及边框聚焦；不控制块内部的代码行、节点或项目。caption 没有显示区域；旁白字幕仍使用 subtitles=true。

每块使用全幕 visual 的入场模式；新增背景、缩放/翻转/遮罩及可选dim/pulse整块聚焦见[视觉风格](./visual-style.md)。未绑定时沿用分步自动时序；all 让全部块开头显示，焦点边框仍跟随讲解。改变结构或顺序后必须重新核对target。

## 编辑与限制

网页选择“混合画布”后，默认显示组合摘要（例如“代码＋节点图＋警告卡”）、嵌套布局结构示意及逐句旁白目标列表；结构图不是最终成片截图。未绑定内容块或失效目标会有提示。AI待审稿也显示相同说明，无需阅读JSON即可核对组合。高级布局JSON编辑默认折叠，修改后点击“校验并应用画布布局”再保存剧本。该版本不是拖拽编辑器，也不支持像素坐标、任意自由定位、图片、浏览器截图或远程素材。可从完整JSON页导入示例，但请先备份已有稿件。

内容区固定高度，超出内容会被裁切，不会自动分页或缩字。推荐每幕2～4块；代码建议6行以内、卡片短文、图节点短标签。最多8块只是结构上限，不代表8块长文都可读。嵌套过多会压缩空间，必须实际预览验收。
