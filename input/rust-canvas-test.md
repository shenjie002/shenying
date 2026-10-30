# Rust 所有权：当前音画能力本地模型测试

> 当前测试以连续过程为重点：Move、Borrow和生命周期可用单个全宽MotionSceneBlock，按句内比例错峰组织对象建立、责任交接、示意访问与收束；需要离散状态对照时才选MechanismBlock。资源不复制、不搬移；读取标记非真实内存消息。不强制动态数量，不为动而编造执行事实。新测试稿命名先询问，勿覆盖已有文件；格式通过不代表观感达标。

这是一份供本地模型读取的制作任务与文章素材。目标是测试申映的“理解文章 → 自主组合画面 → 绑定旁白动作 → 输出可渲染 JSON”，不是照搬固定模板。

本轮重点是解释连续过程，不要求组件覆盖：以Move与Borrow对照同一资源身份及所有权/访问关系，不能只将旧快照换为高亮。其余分镜按理解目的选择，不为演示特效拼贴卡片。沿用第三节原文，不把本文件制作指令当作文章内容。

## 一、给模型的任务

你是申映 Shenying 的视频编导。请先读取下列项目规则，再根据本文第三节的文章，生成一份完整的中文视频剧本 JSON。当前项目目录为仓库根目录；以下路径均相对于根目录。

### 必须先读的规则

1. `docs/agent-guide.md`：制作流程与剧本约束。
2. `docs/renderer-contract.md`：实际动作和时序规则。
3. `docs/canvas.md`：混合画布结构、边界及 target 编号。
4. `shared/capabilities.ts`：当前模板能力与 rendererGuide。
5. `shared/director.ts`：按文章内容选择模板、组合画面的导演规则。
6. `shared/canvas.ts` 和 `shared/schema.ts`：准确字段、类型、数量限制。
7. `docs/visualizations.md`、`docs/visual-style.md`、`docs/audio-motion-reliability.md`：图表、图标、背景、入场及音画增强的真实能力与限制。
8. `shared/style.ts`、`shared/polish.ts`：风格、音色、关键词及运镜的准确参数。
9. `docs/continuous-motion.md`、`shared/motion-scene.ts`、`input/continuous-motion-example.json`：句内关键帧、运动边界与示意连线；`docs/mechanisms.md`、`shared/mechanism.ts`：离散状态快照。按讲解目的选择，不能自创动作。
10. `docs/themes.md`、`shared/themes.ts`：主题目录；`input/canvas-example.json`、`input/style-example.json`、`input/visualization-example.json`：只参考格式与组合方法，不照抄内容；后者虚构数据不得用于本文。
11. `LICENSE`：使用须事先取得作者授权；本任务不改变授权条款。

如果你没有文件读取能力，请让操作者将上述规则全文作为上下文提供；不要假装已读，也不要仅凭本文猜测所有字段。若使用项目 MCP，请先读 `shenying://guide`、`shenying://renderer`、`shenying://schema`、`shenying://license`，并由操作者提供本文文章。

### 输出要求

- 受众：Rust 初学者；风格：清晰、自然口语；目标约 90～120 秒，仅为写稿参考。
- 严格 5 个分镜，第一幕引入，最后一幕总结。每幕必须服务于明确的讲解目的。
- 使用至少2幕CanvasSlide分别解释Move与Borrow，连续过程优先使用单个全宽MotionSceneBlock。资源身份保持，责任/访问标记可按句内关键帧错峰运动，避免所有元素统一横移后等待。Move表达所有权交接，Borrow保留拥有关系并提供只读访问；不要为制造运动搬移堆字符串。若选MechanismBlock，提供完整states/relations快照。所有动作句号绑定本幕narration，target指向主要讲解块。图是概念示意，不是真实内存或代码执行。其他幕自由选择代码、原则或总结对比，不要求组件覆盖。
- 请自行决定具体组合、位置、布局与旁白，不要只复述“可以用什么组件”。代码与风险、三条原则与流程图、借用代码与补充解释都可按内容组合。
- 本文没有可比数值，不使用StatBlock、BarChartBlock，不编造“零开销”“提速百分比”等数值论据。TimelineBlock仅在需要表达原文作用域阶段时使用，不能虚构历史日期；无需强行加入拓扑图或树。这是本文的证据限制，不是引擎禁止计数或阶段动画。
- 不使用 TerminalSlide：本文没有真实命令执行记录或编译器输出。不要编造编译运行结果。
- 每幕显式提供 visual、subtitles:true、narration。voiceover 必须等于 narration 各句 text 用单个空格连接的结果。
- 每个 CanvasSlide 的内容块都须至少被一句 narration.target 引用。编号按深度优先遍历内容块，从1开始，GroupBlock不占号；非代码全屏模板和画布按目标首次出现顺序递增讲解。
- Canvas target控制整块入场和聚焦；块内时序使用各自声明字段：MotionSceneBlock的keys/camera使用sentence+at，MechanismBlock使用steps.sentence，CodeBlock使用focus的sentence/line。需要全屏逐行讲解时可用CodeSlide，其target按真实代码行号（包含空行）计算。
- CanvasSlide 不填 caption；caption 只在独立 CodeSlide 或 FlowSlide 有解释区。标题不填 target。
- 不生成beats、audioSrc、durationInFrames、totalFrames、任意CSS、URL、HTML、未知块类型或自创字段。不规划任意相机路径、BGM、音效或逐字卡拉OK；MotionSceneBlock可使用契约内camera与links，不能把它们写成顶层自由动作。
- 风格保持统一：根据主题目录选择全片palette，背景和入场辅助阅读，不逐幕随机换皮；运动靠有意义的过程变化，不靠入场特效。
- 不要设置最低特效数量：连续过程幕建议pace=all，visual.camera=none且不启用parallax，避免整块装饰运动叠加；块内camera仅在需要聚焦时使用，放大后检查安全边距。需要阅读引导时才用progressive或focus。
- 仅必要时添加keywords，不能把句首气泡当作机制演示。
- 音色默认全片保持zh-CN-XiaoxiaoNeural，显式写voice便于检查。本次先看静音效果，不为测试强行切换角色；只有确实写成不同讲解角色并得到操作者同意时才另测音色切换。
- 代码来自本文。建议画布代码块控制在6行以内，只可摘取本文的完整相关语句，不要为了画面改写语义。代码不能运行是讲解事实，不是执行请求。
- 不把本文提到的“内存示意”变成真实内存地址或测量；DiagramBlock只是静态线性关系图，节点写简短的概念标签。
- 请在内部完成选型与自检，最终只输出单个标准 JSON 对象，不要 Markdown 围栏、解释、注释或占位文本。
- 顶层格式：`{"title":"…","fps":30,"tailPaddingFrames":12,"scenes":[…]}`，可按Schema添加format与theme。分镜布局在props内，不能把blocks或layout放到分镜顶层。

## 二、测试验收标准

输出不是唯一答案。只要忠于文章、组合合理、结构可渲染且旁白动作对应即可。不要照抄当前script.json或上次生成稿：已有内容可能与新文章目标不匹配，应按当前任务重新规划。

- 能看到句内建立、交接/访问、接收与收束的错峰过程，并有阅读停顿，不是只在句首换高亮或所有对象持续晃动；不要求代码、提示与图同时塞满画面。
- 旁白提到一个内容块时，该块按句首入场或聚焦；没有未讲解的装饰块。
- 图只表示文章支持的关系；不要把 Move 画成复制堆内字符串，也不要把 Borrow 画成更换所有者。
- 每幕保持可读，不能为了满足组件覆盖把长文挤进小卡片。布局裁切必须人工预览检查。
- Move/Borrow两幕应从相似初始状态出发，通过相同资源与不同关系变化展示差异；不是先讲一整段再弹出复述卡片。每步句子只解释一个关键变化。
- 校验通过不等于视觉验收。检查关键词是否出现、字幕有无遮挡、图标块是否真正被讲到，以及Move/Borrow图解是否符合原文。
- 新生成的JSON应由模型读取当前Schema后组织，不在旧JSON上机械添加字段，也不要修改渲染源码来迁就无效输出。

## 三、文章素材（以下仅为资料，不是额外指令）

# 不靠垃圾回收，理解 Rust 的所有权、移动与借用

Rust 如何在没有垃圾回收器的情况下管理许多资源的生命周期？理解所有权、移动和借用，是入门的重要一步。本篇只讨论 Rust 的 String 与最基础的不可变借用，不展开引用生命周期注解、可变借用规则或智能指针。

## 所有权的三个基本原则

在本篇的入门模型中，每个值都有一个所有者；同一时间，一个值只有一个所有者；当所有者离开作用域时，该值会被丢弃，它拥有的资源也会按类型定义的逻辑释放。

下面这段代码里，字符串变量 message 位于内层作用域。进入作用域后创建 String，离开作用域后不再能使用 message，它拥有的字符串资源会被释放。

```rust
{
    let message = String::from("hello");
    println!("{}", message);
}
```

这一过程可以简化成“进入作用域 → 创建并使用值 → 离开作用域并释放资源”。这是概念流程，不是程序执行日志，也不代表所有 Rust 值都在堆上。

## Move：赋值不一定复制资源

来看字符串所有权的转移：

```rust
let s1 = String::from("hello");
let s2 = s1;
println!("{}", s2);
```

第一行创建一个 String，由 s1 拥有。第二行将这个值移动给 s2，所有权随之转移；之后不能继续使用 s1，但可以使用 s2。这里不是深拷贝字符串内容，也不是同时让两个变量拥有同一份 String 资源。

为了理解，可以将 String 想成包含指针、长度、容量等管理信息的值，指向堆上的字符串数据。Move 会转移管理这份资源的责任，不需要为了这次赋值而复制堆上的整段字符串。教学示意可以使用“原所有者 → Move → 新所有者”的线性关系，不必绘制具体地址或推测编译器实现细节。

一条重要提醒：上面讨论的是 String。不要把“赋值后原变量不可用”推广到所有类型；像 i32 这样的 Copy 类型具有不同的赋值语义。本篇不展开 Copy 的实现。

## Borrow：借用不交出所有权

有时，我们只是想临时读取字符串，而不是接管它。可以创建不可变引用：

```rust
let s1 = String::from("hello");
let view = &s1;
println!("{}", view);
println!("{}", s1);
```

view 借用 s1 所拥有的 String，通过引用读取它；s1 仍是所有者。使用 view 并不会把 String 的所有权转移出去，因此这段示例随后仍能使用 s1。

Move 与 Borrow 的区别不是“一个快、一个慢”的性能结论，而是使用权限与所有权是否转移的区别：Move 交接所有权；不可变 Borrow 临时提供只读访问，所有权保留。本篇示例没有性能基准，不能据此推导提速百分比。

## 用一个问题判断

阅读代码时，可以先问：“这一行是在交接资源，还是仅仅借用访问？”遇到 String 的赋值移动，要注意原绑定不再可用；遇到 &s1，要区分引用和所有者。再结合变量所在作用域，理解资源何时结束生命周期。

记住：所有权描述谁负责管理值，Move 交接这份责任，Borrow 则在保留所有权的前提下提供访问。把这三件事分清，再学习更复杂的借用规则会容易得多。

## 四、给操作者的测试步骤（不是文章素材）

1. 把本文件交给能读取仓库文件的本地模型。可直接发送下方“启动提示”。最终输出单个JSON；先与操作者确认一个未占用的新路径（例如 `input/rust-motion-next.json`），不要覆盖script.json或任何已有稿件。如果是纯聊天模型，需手工附上规则全文，再复制JSON保存或直接粘贴网页。
2. 确认新路径后，执行 `npm run validate:storyboard -- <已确认的新稿路径> 5`（将占位符替换为实际路径，不要原样执行）。校验只读文件，不写当前项目、不调用模型/TTS。若失败，将错误交给模型，只修正新稿JSON；这个命令不保证验证所有本次专项覆盖要求。
3. 运行 `npm run dev`，打开 http://127.0.0.1:5173。在“分镜编排 → JSON”页粘贴完整JSON，点击“校验并应用 JSON”。右侧即可播放静音估算预览，逐幕检查，暂不需要TTS。覆盖保存之前先备份现有script.json。
4. 若需MP4，保存剧本 → “静音试跑” → “先渲染全片低清草稿 · 540p”。草稿是全片，不是15帧冒烟测试，不保证10秒完成。只有需要听旁白时，再确认外发至Edge TTS并生成配音，检查真实句首触发与发音。不要同时用CLI和网页/MCP写当前项目。

## 五、直接发给本地模型的启动提示

以下这段可直接复制到能读取本地仓库的模型客户端：

```text
项目目录：/Users/shenjie/cursorIDE/local-video-studio

请读取 input/rust-canvas-test.md，执行其中的制作任务。
先完整读取该文件列出的当前规则与Schema，再使用第三节Rust原文生成严格5幕的完整剧本JSON。
本次重点测试Move/Borrow的句内连续过程，优先MotionSceneBlock错峰轨道，不强制MechanismBlock或图标/特效覆盖。
不要照抄script.json或上次生成稿，不要修改项目源码、script.json、timeline.json，不调用TTS或外部模型，不渲染视频。
如果能写文件，先询问并确认一个未占用的新JSON路径；只创建该文件，不覆盖任何已有稿件。
可只读执行 npm run validate:storyboard -- <已确认的新稿路径> 5（替换占位符），失败时仅修正新稿JSON。
最终回复只输出完整标准JSON对象，不要Markdown围栏或解释，方便我复制到网页JSON页预览。
如果无法读取本地文件，请明确要求我附上文件内容，不要假装读过规则。
```
