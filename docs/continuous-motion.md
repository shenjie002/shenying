# 连续过程舞台（MotionSceneBlock）

目标是幕内的连续过程，不是仅在旁白句首换高亮。可用对象姿态轨道组织建立、传递、接收、收束；稳定身份对象支持错峰、重叠、位置/缩放/透明度/旋转/内部进度连续插值，连线随对象移动并支持连续流转点。不是实时程序执行、物理或内存仿真，也不是任意JS/CSS动画。

权威定义：`shared/motion-scene.ts`，Schema整合：`shared/canvas.ts`、`shared/schema.ts`。示例：`input/continuous-motion-example.json`，导演规则通过实际文章生成和MCP共用rendererGuide/directorGuide。

## JSON

普通叶块 `{id,type:"MotionSceneBlock",props:{description,objects,links}}` 放在CanvasSlide.props.blocks。复杂过程优先独占一幕、pace=all；块仍须被narration.target引用。

每个object有id/label、可选detail、shape(panel/token/ring/text/resource)、tone(normal/accent/warning/muted)、width/height和keys。x/y为内部舞台百分比中心，width/height为尺寸百分比；不是外层placements，也不是像素。形状尺寸和缩放后的轴对齐矩形不得越界；旋转后的包围盒不自动检查、标签不自动避让，需要人工预览。

keys为完整姿态：`{sentence,at,x,y,scale,opacity,rotation,progress}`，省略字段用默认值，不继承上一姿态。sentence从1开始，at为该句时长内0～1比例，默认0；每对象至少2帧，时间严格递增。位置/缩放/透明度/旋转/进度采用平滑插值；首帧前隐藏，最后一帧后保持。不同对象独立时钟，可重叠或接力。要停顿就连续给两个相同姿态。静音按估算句长，TTS后按实测句长，意图相同但绝对速度会变化。

环形progress绘制弧线；resource显示内容条；文字和轮廓不是任意路径形变。label最多40字、detail最多70字，SVG文字不自动换行，实际写稿应更短。

links连接不同对象，sentence为开始句号，untilSentence为隐藏/停止句号（可选）；flow=none/forward/reverse，periodFrames=30～180，dashed可选。跟随对象边缘，流转点为概念示意；没有自动路由、碰撞、避障、端点吸附或真实吞吐量。连接器不考虑旋转后边界。

animation=none冻结插值及流转，但保留关键帧时刻的状态切换；随机seek直接从当前帧计算，不依赖播放历史、CSS动画或真实时间。

## 弹簧、氛围与错峰

新增对象easing=spring-soft/spring-bouncy/spring-snappy/spring-jelly、props.stagger组级固定帧错峰、visual.ambient低对比星尘/光晕、panel玻璃卡与对象badge/icon、focus自动降噪。聚焦只降低非重点对象透明度并可选模糊，是视觉主次而非真实景深；微标签与图标不得伪造来源或认证。严格字段、停靠/静止策略与超调边界见[motion-effects.md](./motion-effects.md)。平滑、线性、settle旧稿不变；不是碰撞仿真，不是所有旧块自动支持组级错峰。

## 编排与验收

先规划理解目标和内容变化，再编写几条互补轨道。不要所有元素一直抖动，也不为静态结论造过程。Rust中移动责任标记不能暗示复制/搬移堆字符串；借用中的移动标记只表示阅读步骤，不是实际内存消息或网络包。

校验包括对象/连线唯一ID、引用、句号、关键帧顺序、入场前动作与轴对齐边界；不证明事实或可读性。需连续播放检查动作接力、停顿、文字遮挡，不能只凭静态截图确认“活”的观感。无无缝跨幕身份、通用对象变形、自动物理或内置聊天。


配色补充：theme.palette=vivid为紫/青/橙多彩浅色舞台，连续过程块移除外层卡片框，背景装饰仍是确定性帧驱动；MotionScene对象tone增加teal/rose用于语义区分，不代表事实好坏。resource.progress控制内部内容条逐段显露。示例input/rust-motion-typography.json，旧主题兼容。


运动设计补充：MotionScene关键帧支持fontSize(16～60)、fontWeight(400～900)、emphasis(0～1，默认1，正文色→tone色渐变)、jitter(0～3，短时帧驱动微抖)、easing(smooth/linear/settle)。可选camera轨道{sentence,at,x,y,zoom}，zoom=1～2.4，x/y=10～90；仅内部舞台推拉平移，不是整幕转场。字号和字重变化不保证任意系统字体都有连续字重，需人工查裁切；静止模式冻结插值/抖动，保留时刻状态切换。避免持续抖动、频闪和所有元素同时强调。示例input/rust-motion-typography.json。


最新认可编排：`input/rust-motion-typography.json`。在既有关键帧协议内增强字号/字重/颜色层次并加高文字容器、错开使用标记，最后一轮未改引擎。视频为`out/rust-motion-typography-review.mp4`；详细交接见[current-progress.md](current-progress.md)。
