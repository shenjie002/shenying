# AI 分镜与渲染能力对齐

权威能力契约是 [`shared/capabilities.ts`](../shared/capabilities.ts)。网页文章生成提示、MCP `shenying://renderer` 与待审稿说明均复用它；target 数量校验也使用同一份映射。调整实际渲染时须同步更新契约与测试，不应承诺未实现的动作。

## 音画与可靠性

支持每幕voice白名单、分句绑定keywords、visual.camera轻微推拉与CanvasSlide visual.parallax；详情与限制见[音画与可靠性](./audio-motion-reliability.md)。关键词只是句首提示，字幕仍非逐字对齐。新增全片540p草稿渲染，MCP为render_draft，复用本地任务锁。BGM、分幕SFX、卡拉OK、自动修源码未实现；独立master已支持绝对帧触发内置合成音效，详见下节。

## 全局画布短片

`shared/master.ts` 的 masterGuide 已注入实际文章生成/MCP共用 rendererGuide。独立 `master` 与非空 scenes 互斥；演员绝对帧轨道、Remotion物理弹簧（受限自定义damping/stiffness/mass）、白名单图标逐笔绘制/脉动/旋转、progress进度环及四套手绘装饰、sfx合成音效均可在JSON规划。文章生成请求mode=scenes遵守分镜数，mode=master用专用提示交付完整连续轨道；API/MCP默认scenes保持兼容。网页默认可选连续短片，支持30～120秒、横竖屏、制作要求和默认关闭的合成音效开关。Web提供字幕/段长/对象/动作时间点/镜头/音效表单，保留JSON入口与正常预览/保存/渲染；不是拖拽时间线或自动避障。MCP复用原工具与锁，无新权限。master可选逐段TTS（每段一句、段首播放、超段长报错），没有TTS自动对时、外部录音导入或BGM；sfx默认sfxMuted:true静音。准确字段、边界及30秒示例见[单根全局画布](./master-composition.md)。

## 视觉风格

背景扩充为glow/grid/plain/aurora/grain/spotlight/code，入场支持spring/gentle/none/pop/flip/border/wipe；pace仍为progressive/all。CanvasSlide可选focus=dim或pulse。精确适用区域、帧驱动规则与限制见[视觉风格](./visual-style.md)及shared/style.ts，AI实际提示和MCP自动复用；支持StatBlock.counter、BarChartBlock.countUp与motion.grow等受控显露，不支持无约束图内追线。

## 混合画布

新增 CanvasSlide 支持同幕组合代码、要点、提示、数据和简单节点图；GroupBlock 提供受约束的嵌套分栏/网格/堆叠。详情见 [混合画布](./canvas.md)，示例见 input/canvas-example.json。画布target为深度优先的内容块序号，只控制整块入场和边框焦点，不是块内代码行；内部动作使用CodeBlock.focus、MechanismBlock.steps、MotionSceneBlock关键帧及各块声明字段，不能用target代替。narration.caption没有解释区。原六种模板保持不变。

图表/图标扩展已实现：TopologyBlock、CompareBlock、TimelineBlock、BarChartBlock、TreeBlock、IconBlock。字段、语义映射与限制见[图表指南](./visualizations.md)。AI文章提示和MCP shenying://renderer自动包含其能力与选型规则；BarChart支持motion.grow/sequence与可选countUp，Timeline支持motion.sequence或milestones，Tree支持motion.sequence；未声明内部动作的块保持静态。target仍只控制整块，局部强调用受支持的cues.item，不承诺任意节点动画。

## 代码行与机制联动

Canvas CodeBlock支持可选props.focus=[{sentence,line}]，与MechanismBlock.steps.sentence共用分句句首时钟；target仍只控制整块。行号含空行，句号递增、行号可回看；代码首次target后才能开始focus。pace=all保留内部联动，无focus旧块仍静态。代码窗口最多8行，长行不自动换行。详见docs/mechanisms.md及input/code-mechanism-example.json。相邻分镜可实现代码→机制→代码，不支持无缝变形。

## 对象运动增强

visual可选ambient，MotionScene关键帧支持四种受控弹簧，props.stagger支持固定帧组级揭示，props.focus按句自动降低非重点对象的透明度/模糊，panel对象为半透明玻璃卡并支持badge/icon；准确契约见[运动增强](./motion-effects.md)。生成提示/MCP自动包含该契约，默认兼容旧稿；不支持碰撞仿真或旧列表自动递归错峰。

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

- visual.background: glow/grid/plain/aurora/grain/spotlight/code；animation: spring/gentle/none/pop/flip/border/wipe；pace: progressive/all。准确枚举以shared/style.ts为准。
- none 关闭入场位移和背景微动，不取消分步等待、代码焦点或终端打字。
- all 令分步项目从开头显示，并取消终端打字；列表/流程当前项高亮仍会变化。CodeSlide 不再高亮或滚动。
- 首次入场：第一个匹配的分句 target > 第一个匹配的 beat target > 分镜前68%内均匀安排。重复 target 不会让元素重新入场。
- 活动焦点：只要有句子 target，就跟随最近已开始的绑定句；否则跟随 beat，再否则自动推进。因此不要随意混用 narration 和 beats。
- caption 仅在代码侧栏、流程说明区显示。其他模板不显示它；它不是字幕。旁白字幕用 subtitles=true。

## AI 输出约定

新生成内容应显式提供 visual、subtitles 和 narration。按自然完整句拆分，每句 text 可绑定正确的 target；voiceover 必须与各句 text 用单空格连接的结果一致。标题不绑定target，解释区以外不生成caption。要点、卡片、流程、命令按首次展示顺序讲解；代码允许回看前面的行。AI 不同时生成 beats，不猜测帧数、不生成派生音频字段。

模型返回后除通用schema校验外，还会校验已有narration与voiceover一致、标题target、caption适用区域及非代码目标顺序。不符合时拒绝应用，不默默丢弃。历史无narration剧本保持兼容，仍使用原有自动时序；这些额外约束用于模型输出，不影响手工旧稿导入。

分句TTS使用实测音频句首，静音时长仍为估算；不是逐字对齐。文章生成只规划动作，不会当场配音或执行渲染。当前支持受控MotionSceneBlock对象轨道、camera与移动连线，本地ImageBlock百分比标注，以及可选分镜进度条；详见下文。仍不支持任意相机路径、不受约束的机制图、浏览器截图、音乐和重叠转场。

待审稿显示实际动作说明，并可展开查看 visual、narration、beats、subtitles 与props。应用后仍需试听、预览并人工验收成片。

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


视觉主题目录：[themes.md](themes.md)。theme.palette支持blue/editorial/light/vivid/ocean/sunrise/botanical/candy/neon/blueprint/handbook，生成提示直接复用shared/themes.ts；新主题开放舞台与深浅色语义适配，非任意CSS样式或所有旧组件完整换肤。


运动设计补充：MotionScene关键帧支持fontSize(16～60)、fontWeight(400～900)、emphasis(0～1，默认1，正文色→tone色渐变)、jitter(0～3，短时帧驱动微抖)、easing(smooth/linear/settle)。可选camera轨道{sentence,at,x,y,zoom}，zoom=1～2.4，x/y=10～90；仅内部舞台推拉平移，不是整幕转场。字号和字重变化不保证任意系统字体都有连续字重，需人工查裁切；静止模式冻结插值/抖动，保留时刻状态切换。避免持续抖动、频闪和所有元素同时强调。示例input/rust-motion-typography.json。
