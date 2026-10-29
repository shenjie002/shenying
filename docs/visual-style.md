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

## AI 内容驱动

技术/架构优先grid或code与gentle/pop；概念引入可用aurora与gentle/flip；风险场景可用grain与border，画布需要引导时再选pulse；密集数据/长文字优先plain/grid，不让背景抢占阅读。保持全片风格统一，不逐幕随机换特效。所有规则由rendererGuide注入文章实际模型请求并暴露给MCP。

代码暗纹采用固定示例装饰字符串，不读取或泄漏文章/密钥，不应当成教学代码。颗粒位置确定性生成，不用随机数和CSS时间动画，预览/渲染均按帧可复现。新效果不产生外部请求。

## 运镜补充

已支持visual.camera=none/push/pull内容层微量缩放，以及CanvasSlide可选parallax；见[音画与可靠性](./audio-motion-reliability.md)。它们不是真3D或自动镜头路径。

## 测试示例

`input/style-example.json` 是同一Rust画布内容的四种风格对照：极光+翻转、颗粒+边框、斜光+缩放暗化、代码暗纹+遮罩。它用于比较效果，不是建议一条正式视频频繁切换风格。可运行 `npm run validate:storyboard -- input/style-example.json 4` 后从网页JSON页导入；保存前备份当前项目。

## 尚未实现

数字滚动计数、动态柱形增长、图内连线随配音追踪、任意文字圈选、九宫格专项展示、像素碎片入场、任意相机路径和场景间重叠转场未实现，模型不得输出或承诺。如需这些效果应另行扩展Schema、渲染和测试，而非仅改提示。

生成结果仍须人工检查阅读性、遮挡和实际动态节奏；静态截图、单测、构建不能代替完整媒体验收。
