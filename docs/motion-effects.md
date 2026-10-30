# 弹簧反馈、环境氛围与组级错峰

权威定义为`shared/motion-effects.ts`、`shared/motion-scene.ts`、`shared/style.ts`。生成、MCP、网页预览与渲染共用Schema。旧稿省略新增字段时不变，不是所有对象自动弹跳。

## 对象弹簧

MotionSceneBlock对象关键帧`easing`新增：
- `spring-soft`：柔和回落。
- `spring-bouncy`：明显弹性回落。
- `spring-snappy`：快速响应、短回落。
- `spring-jelly`：高刚度低阻尼的果冻式回弹（超调最明显），适合“戳一下”的俏皮反馈，不适合连续多次使用。

与已有easing一样，控制当前关键帧到下一关键帧；按30fps与两帧间实际时长计算，不依赖播放历史。位置、缩放、旋转可超调，透明度/进度/字号/字重/颜色仍有界平滑，终点精确停靠。弹簧只填充整段过渡，不会自行缩短段长：若希望弹一下很快停稳，应把关键帧间隔压到约15～25帧，随后再给一个相同姿态留阅读时间；段长超过40帧时超调会被摄得非常缓，看起来接近缓动而非回弹。使用预设阻尼/刚度/质量的Remotion弹簧，不是碰撞或重力仿真。镜头使用受限camera契约，可选择四种spring easing，无任意相机代码路径。自定义物理参数只在独立master中开放，见[全局画布](./master-composition.md)。

关键帧端点校验不等于超调路径自动避障；为弹性运动预留边距。animation=none保留按时刻切换姿态，不插值或弹跳。

## 环境层

`visual.ambient={kind:"stardust"|"glow",density:"low"|"medium",intensity:0～1}`。省略关闭；density默认low，intensity默认0.5。星尘28/52点，三层尺寸、慢漂移与低频亮度变化；glow为三层弥散光晕，density仅影响星尘。以绝对帧和固定种子计算，不联网，无随机闪烁。none冻结在初始环境状态；plain背景也可显式启用。

### 层内呼吸视差

`visual.ambient`启用时，整个环境层包在同一个温和呼吸容器里：约25秒主周期叠加9秒次周期，平移幅度小于12px，整体缩放约0.97～1.03；aurora与glow背景光也跟随同一视差轻微位移与缩放，形成前后层速度差。参数由`ambientDrift`统一计算，不使用CSS时钟或随机量：任意seek可复现，相邻帧位移小于1px，不会变成可见抖动。animation=none时固定在第0帧状态，不呼吸也不漂移（当前也不提供单独只冻结粒子的开关）。网页视觉编辑器提供关闭/星尘/光晕，精细参数通过JSON修改。不同主题对比度仍须人工检查。

## 组级错峰

MotionSceneBlock.props.stagger：

```json
[{"sentence":1,"objects":["model","dispatch","sandbox"],"intervalFrames":4,"durationFrames":24,"preset":"spring-bouncy"}]
```

最多6组，2～12对象/组，同一对象不得跨组重复；对象必须存在。对象首关键帧必须是组指定sentence且at=0，采用可读稳定姿态，不再重复写透明度0入场。按列表顺序错开3～12帧（默认4），各对象揭示12～45帧（默认24）。叠加向上28个SVG舞台单位的弹簧揭示与8帧淡入，不移动原关键帧或连线的语义时钟，隐藏对象的连线也隐藏。

pace=all保留显式错峰；animation=none取消错峰等待与位移，但首关键帧前仍隐藏。句长不足时揭示仍按固定帧运行，不自动改写旁白时长，需拆分/增加阅读空间。此版只针对连续舞台内对象，不是所有旧列表/卡片的通用递归stagger。

## 卡片材质、微标签与图标

`shape=panel`渲染为半透明渐变玻璃卡：细边、圆角、柔和投影，顶部微弱高光；`text`不画框。卡片内容为label、detail、可选badge和icon。

- `badge`：1～12字微标签（如“示意”“公司自报”“账本”），渲染在卡片右上角，只用于已有资料支持的归因或状态；不能伪造认证、来源或“已核实”。
- `icon`：限`shared/motion-scene.ts`中`motionIconNames`白名单（Brain/Workflow/Terminal/FileText/Cpu/Database/Server/Globe/Layers/Box/Sparkles/Zap/Activity/Gauge/TrendingUp/ShieldCheck/Network/GitBranch/Settings/Code2），仅panel/token/resource显示，放在label上方。图标是语义锚点，不代替解释也不暗示认证。
- tone新增`highlight`（暖黄荧光笔式重点，浅色主题自动改用深琥珀保证对比），用于真正的关键词而非整句。
- 旧对象无需新字段；卡片样式由主题card/radius与tone驱动（handbook主题radius=26、暖褐底、琥珀边），不支持任意CSS、自定义颜色或图片底纹。

## 微场景与微观动效（anti-PPT）

三个字段都只在对象级声明，默认不改变旧稿：

- `reveal`：`fade`（默认）/`rise`（上浮淡入）/`wipe`（从左擦除）/`typewriter`（逐字出现，仅text有意义）/`pop`（轻微过冲）。配套 `revealFrames` 6～45、默认16；建议12～20，过长会显得慢。首次出现时执行一次，不重复。
- `float`：0～3，默认0。极轻的正弦漂浮（`sin(frame/44+相位)`），帧驱动、`animation=none` 冻结。只给少量主体用，全屏一起飘会更假。
- `capsule`/`glow`：text 对象加圆角胶囊底座与柔和底光，避免“大字报”式裸文字；`glow` 对 panel 则画一条底部光条。

限制：`typewriter` 是逐字截断显示，不是真打字机光标；`wipe` 是按对象宽度裁剪，若文字超宽会被截；这些都不是逐词音频对齐。MotionScene分幕路径不延续跨幕对象身份；需要标题跨段缩成标签等全局延续时选独立master，不能把master字段写进MotionScene。

## 自动聚焦降噪（focus）

`props.focus`为1～12完整快照：`{sentence,at?,ids:[对象ID],dimOpacity:0.05～1（默认0.28）,blur:0～6（默认0）}`。

- `ids`是此刻的讲解主体；其余对象自动降到dimOpacity并可选高斯模糊，形成主次而非全部同亮。
- 成员变化在下一快照前12帧内平滑过度，不改变对象关键帧或连线语义时钟；animation=none立即切换。
- 聚焦也影响连线透明度；两端任一模糊时线也模糊。
- 这是视觉降噪，不是真实景深、遮挡或物理聚焦；不自动判断语义，需人工选择主体。不要把全部对象常驻在ids中，也不要每句都换焦点。

## 验收

`input/motion-effects-study.json`约19秒能力试验，覆盖玻璃卡、微标签/图标、focus降噪、错峰与三种对象弹簧。JSON编辑通过现有画布高级JSON入口，不执行自由CSS/JS。测试与构建不能代替连续播放、深浅主题及边界裁切人工检查。字体尺度与自动排版仍是独立限制，不能用粒子或回弹掩盖。
