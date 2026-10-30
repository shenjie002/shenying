# 背景、入场与注意力引导

实际能力与提示共用 shared/style.ts。Schema、网页下拉框、文章生成提示和MCP shenying://renderer读取相同枚举与说明。不是只扩下拉框；已在Remotion实现下列效果。

## visual 参数

| 字段 | 支持值 |
| --- | --- |
| background | glow微动光晕、grid科技网格、plain纯色、aurora弥散极光、grain细颗粒、spotlight斜向柔光、code代码暗纹 |
| animation | spring柔和弹簧、gentle轻缓位移、none无入场、pop弹簧缩放、flip透视翻转、border边框亮起、wipe遮罩展开 |
| pace | progressive分步、all开头完整展示 |
| focus（可选） | normal默认；dim整块聚焦暗化、pulse低频呼吸边框仅CanvasSlide支持 |

旧剧本保持原默认值glow/spring/progressive；focus默认normal。none关闭背景运动与呼吸，但不取消分步等待、代码焦点或终端打字。all不改变焦点目标时序。切换到非画布模板时编辑器将focus重置normal。

入场只作用于实际Reveal区域：标题、项目、卡片、画布内容块；独立CodeSlide的代码窗口和TerminalSlide的终端窗口没有全窗入场，仅保留自身代码聚焦或命令打字。wipe是整块遮罩展开，不是逐字打字；border是临时外框亮起而非真实描边绕行；flip是轻微Y轴透视，不能指定任意3D相机。

Canvas focus依照原有narration/beat活动目标变化，dim轻度暗化非活动块，pulse使用帧驱动低频呼吸。不是任意词语圈选、图节点或柱条动画。未开始任何目标时不暗化。

## 环境与内部弹簧

visual.ambient可选stardust/glow，网页视觉编辑器可选开关；density/intensity通过JSON调节。MotionScene内部弹簧与组级stagger不是外层Reveal的spring入场，字段及静止模式见[motion-effects.md](./motion-effects.md)。

## AI 内容驱动

技术/架构优先grid或code与gentle/pop；概念引入可用aurora与gentle/flip；风险场景可用grain与border，画布需要引导时再选pulse；密集数据/长文字优先plain/grid，不让背景抢占阅读。保持全片风格统一，不逐幕随机换特效。所有规则由rendererGuide注入文章实际模型请求并暴露给MCP。

代码暗纹采用固定示例装饰字符串，不读取或泄漏文章/密钥，不应当成教学代码。颗粒位置确定性生成，不用随机数和CSS时间动画，预览/渲染均按帧可复现。新效果不产生外部请求。

## 运镜补充

已支持visual.camera=none/push/pull内容层微量缩放，以及CanvasSlide可选parallax；见[音画与可靠性](./audio-motion-reliability.md)。它们不是真3D或自动镜头路径。

## 测试示例

`input/style-example.json` 是同一Rust画布内容的四种风格对照：极光+翻转、颗粒+边框、斜光+缩放暗化、代码暗纹+遮罩。它用于比较效果，不是建议一条正式视频频繁切换风格。可运行 `npm run validate:storyboard -- input/style-example.json 4` 后从网页JSON页导入；保存前备份当前项目。

## 尚未实现

已支持StatBlock.counter与BarChartBlock.countUp受控数字显露（非滚轮字形动画），free布局connectors的draw/flow/pulse，以及MotionSceneBlock内随对象移动的示意连线和受限camera轨道。任意图表数据形变、逐字配音追线、任意文字圈选、九宫格专项展示、像素碎片入场、任意相机路径和场景间重叠转场仍未实现，模型不得输出或承诺。准确字段见[高级讲解表达](./short-video-presentation.md)、[自由布局](./free-layout-connections.md)及[连续过程](./continuous-motion.md)；不以修改提示代替扩展Schema、渲染和测试。

生成结果仍须人工检查阅读性、遮挡和实际动态节奏；静态截图、单测、构建不能代替完整媒体验收。

## 自由布局、线条与图表动画更新

现支持layout=free与百分比placements自由错落位置/尺寸/层级；connectors提供实/虚/点线、无/单/双箭头、直线/折线/曲线及draw/flow/pulse。BarChart支持grow/sequence，Timeline与Tree支持sequence，均以有效旁白句首与帧进度驱动。其他图表默认静态，不支持所有动态图表或真实流式数据。shared/extensions.ts为内置分类能力目录，不是运行时动态插件加载器，不允许JSON执行代码。旧文“全部静态/不支持自由布局”以本节及准确Schema为准。示例input/free-canvas-example.json；详见[自由布局与连线说明](./free-layout-connections.md)。


## 竖屏与高级讲解表达

参阅 [short-video-presentation.md](short-video-presentation.md)：真正横竖屏、主题/章节/来源、RichTextBlock、受控本地ImageBlock、CycleBlock、TransferContainerBlock、BalanceScaleBlock，以及StatBlock.counter、BarChartBlock.countUp和TimelineBlock.milestones。旧版“仅固定数字、无图片/容器转移”等限制由本节限定能力替代；不支持任意CSS/JS、远程素材或自动数据真实性验证。生成与MCP使用同一Schema/能力契约，无新增素材写入MCP权限。草稿横屏960×540、竖屏540×960；每次实际使用需确认素材授权和人工检查裁切。


视觉主题目录：[themes.md](themes.md)。theme.palette支持blue/editorial/light/vivid/ocean/sunrise/botanical/candy/neon/blueprint/handbook，生成提示直接复用shared/themes.ts；新主题开放舞台与深浅色语义适配，非任意CSS样式或所有旧组件完整换肤。
