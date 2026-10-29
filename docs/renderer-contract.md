# AI 分镜与渲染能力对齐

权威能力契约是 [`shared/capabilities.ts`](../shared/capabilities.ts)。网页文章生成提示、MCP `shenying://renderer` 与待审稿说明均复用它；target 数量校验也使用同一份映射。调整实际渲染时须同步更新契约与测试，不应承诺未实现的动作。

## 混合画布

新增 CanvasSlide 支持同幕组合代码、要点、提示、数据和简单节点图；GroupBlock 提供受约束的嵌套分栏/网格/堆叠。详情见 [混合画布](./canvas.md)，示例见 input/canvas-example.json。画布 target 为深度优先的内容块序号，只控制整块入场和边框焦点，不是块内代码行；块内内容静态，caption没有解释区。原六种模板保持不变。

## 六种实际画面

| 模板 | 实际动作 | target 含义 |
| --- | --- | --- |
| TitleSlide | 标题入场，副标题默认延迟12帧；固定右侧图形 | 不规划 target，无法用它控制副标题 |
| BulletListSlide | 要点逐项入场，当前要点突出背景 | 要点序号，从1开始 |
| CodeSlide | 代码已显示，逐行聚焦、暗化其他行并滚动；右侧解释文案 | 原始代码行号，空行也计数 |
| CardSlide | 左右两卡依次入场，无跟随讲解的卡片高亮 | 1=左，2=右，仅首次入场 |
| FlowSlide | 步骤横排入场、箭头点亮、当前步骤高亮；解释文案替换description | 步骤序号 |
| TerminalSlide | 模拟命令打字，打完显示同索引output；不执行命令 | 命令序号，不是输出行号 |

CodeSlide 一屏最多11行，progressive 会跟随焦点滚动；all 模式只展示顶部11行、不会自动滚动。代码长行不会自动换行，AI 应拆短代码或拆幕。终端打字时长取到下一命令前间隔的40%，上限45帧，不代表真实程序运行时间。

## 时序与配置

- visual.background: glow、grid、plain；animation: spring、gentle、none；pace: progressive、all。
- none 关闭入场位移和背景微动，不取消分步等待、代码焦点或终端打字。
- all 令分步项目从开头显示，并取消终端打字；列表/流程当前项高亮仍会变化。CodeSlide 不再高亮或滚动。
- 首次入场：第一个匹配的分句 target > 第一个匹配的 beat target > 分镜前68%内均匀安排。重复 target 不会让元素重新入场。
- 活动焦点：只要有句子 target，就跟随最近已开始的绑定句；否则跟随 beat，再否则自动推进。因此不要随意混用 narration 和 beats。
- caption 仅在代码侧栏、流程说明区显示。其他模板不显示它；它不是字幕。旁白字幕用 subtitles=true。

## AI 输出约定

新生成内容应显式提供 visual、subtitles 和 narration。按自然完整句拆分，每句 text 可绑定正确的 target；voiceover 必须与各句 text 用单空格连接的结果一致。标题不绑定target，解释区以外不生成caption。要点、卡片、流程、命令按首次展示顺序讲解；代码允许回看前面的行。AI 不同时生成 beats，不猜测帧数、不生成派生音频字段。

模型返回后除通用schema校验外，还会校验已有narration与voiceover一致、标题target、caption适用区域及非代码目标顺序。不符合时拒绝应用，不默默丢弃。历史无narration剧本保持兼容，仍使用原有自动时序；这些额外约束用于模型输出，不影响手工旧稿导入。

分句TTS使用实测音频句首，静音时长仍为估算；不是逐字对齐。文章生成只规划动作，不会当场配音或执行渲染。当前不支持镜头推拉、任意对象移动、机制图、截图标注、音乐和重叠转场，也没有分镜底部进度条。

待审稿显示实际动作说明，并可展开查看 visual、narration、beats、subtitles 与props。应用后仍需试听、预览并人工验收成片。
