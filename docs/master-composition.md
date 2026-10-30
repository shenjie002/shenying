# 单根全局画布（MasterComposition）

分幕拼接（`scenes` 一条一条 `Series.Sequence`）适合讲课式内容，但天生带着 PPT 感：每幕各自入场、各自定格、切换靠硬切。**master 模式**换成另一套结构：整片只有一张画布，所有元素是带全局生命周期的“演员”，关键帧吃**绝对帧**，镜头在顶层统一推拉。

两种模式互斥：一个剧本里 `scenes` 和 `master` 只能二选一。

## 什么时候用它

- 短视频、宣传片、需要“标题缩小飞到角落变成标签”“卡片从画面外吸附进来”这类**跨段连续运镜**。
- 文案节奏已经定稿、能从帧数直接排出动作（master 的时长是写死的）。

不适合：需要配音决定时长的长讲解。master 的 `beats.frames` 就是真实帧数；可选配音每段一句、从段首播放，但不改变帧数。

## 结构

```json
{
  "title": "哪些零件",
  "format": "portrait",
  "theme": {"palette": "handbook", "cinema": true},
  "scenes": [],
  "master": {
    "backdrop": "aurora",
    "beats": [{"text": "哪些零件，绝不外包？", "frames": 720}],
    "actors": [{
      "id": "title", "label": "哪些零件", "kind": "text",
      "tone": "normal", "fontSize": 64, "fontWeight": 800, "width": 78, "glow": true,
      "keys": [
        {"frame": 0, "x": 50, "y": 43, "scale": 1.12, "opacity": 0, "easing": "spring-jelly"},
        {"frame": 22, "x": 50, "y": 43, "scale": 1, "opacity": 1, "easing": "spring-jelly"},
        {"frame": 168, "x": 24, "y": 15, "scale": 0.4, "easing": "settle"},
        {"frame": 720, "x": 24, "y": 15, "scale": 0.4}
      ]
    }],
    "camera": [
      {"frame": 0, "x": 50, "y": 50, "zoom": 1.05},
      {"frame": 330, "x": 47, "y": 43, "zoom": 1.24}
    ]
  }
}
```

- `beats`：字幕与时长来源，字数上限 160，单段 20～900 帧；总时长 = 所有 `frames` 之和（去掉 `scenes` 后不再有 TTS 估时）。
- `actors`：1～16 个演员。`kind` 取 `text` / `card` / `chip` / `line` / `icon` / `ring` / `doodle`；`tone` 复用主题色扳手；`width` 是画面百分比 6～96；`glow`/`float` 提供底光与极轻漂浮。
- `keys`：2～16 个关键帧，必须**严格递增**且不超过总时长。`x/y` 为 0～100 百分比，`scale` 0.15～3，`rotate` ±25°，`easing` 可选 `linear/smooth/settle/spring-soft/spring-bouncy/spring-snappy/spring-jelly`，在**区间起点**指定。首关键帧前不可见，末姿态持续。
- `camera`：2～12 个关键帧，`x/y` 10～90、`zoom` 1～2.4。zoom>1 会裁掉画面边缘——这是镜头推近，不是排版错误；角落标签要留在缩进后的安全区内。

## 与分幕模式的差别（为什么它不像 PPT）

| | 分幕 | 单根全局画布 |
|---|---|---|
| 时间基准 | 每幕各自从 0 开始 | 全局绝对帧 |
| 对象身份 | 每幕独立，切幕即消失 | 同一演员可整片延续 |
| 切换 | `Series` 硬切 | 无切换，元素自己走位 |
| 镜头 | 每幕内部 `camera` | 顶层统一推拉平移 |

## 3D 视口与视差

舞台最外层是真正的 CSS 透视容器（`perspective`，随画幅高度缩放，`perspectiveOrigin` 略高于中心），演员层 `transform-style: preserve-3d`。三层空间关系：

- **`depth`**（0～2，默认1）：该演员对镜头运动的响应强度。背景 `0.3～0.45`、常驻标签 `0.4～0.6`、卡片 `1.2～1.4`。镜头推进时背景几乎不动，卡片明显放大位移，产生视差而不是整体缩放。
- **`z`**（-400～600，关键帧级）：屏幕法线方向位移，负值在远处、正值扑向观众。卡片从 `z:-320` 用 `spring-jelly` 砸到 `z:30`，就有近大远小的冲击力。
- **`rotateX` / `rotateY`**（±22°）：卡片入场时的轻微俯仰/侧转；常驻标签可留 `-6°` 倾斜，弱化存在感。
- **动态投影**：`box-shadow` 的偏移、扩散与不透明度由“离观众的距离”算出（`z` 与镜头 zoom 合成），近处更散更深、远处收紧，用来隔离图层上下级。

**限制**：这是 CSS 3D 变换，不是真三维渲染——没有光照、遮挡排序、景深虚化；`backdrop-filter` 在部分环境下会被 3D 变换影响；`perspective` 过小（<600px）会让文字明显变形，脚本里按画幅高度取 1000 倍。

## 明确限制

- 动作按固定帧编排，由AI生成或表单编辑，**不随配音时长自适应**；改文案需核对段长，必要时在编辑器调整。
- 可选配音（“生成配音”）：每个 beat 的 text 用 Edge TTS（zh-CN-XiaoxiaoNeural）合成一句，从该段起始绝对帧播放；实测配音帧数超过 `beats.frames` 时报错并指出段号，需删字或加长该段，不自动变速或拉伸动作。字幕仍整段显示，不逐词同步。配音会把字幕文本发往在线TTS服务，需先确认外发。
- 没有逐词音频对齐、没有遮罩层/图层混合、没有图像或视频层，不能执行任意 CSS/JS。
- 弹簧使用真正的 Remotion `spring()`，不是碰撞或实时物理；正文不应持续弹跳。
- 单根画布**没有分幕缓存**：任何改动都会整片重渲（24 秒样片约 8 秒，见 `docs/render-performance.md`）。
- 网页“文章 → 视频剧本”可选连续动效短片或分幕讲解；master支持30～120秒固定时长，文章、受众、风格、横竖屏、制作要求和合成音效开关进入专用模型提示，模型负责完整动作编排。分幕模式保持原配音流程；MCP/API默认mode=scenes兼容旧客户端，网页默认显示连续短片。
- Web表单可修改字幕、段长、主题/背景、对象文字/类型/图标/字号/位置/时间点/弹簧、镜头坐标及音效。时间显示为秒、内部转帧；段长改变时段内轨道按比例缩放，后续整体顺延，关键帧碰撞则拒绝。不是拖拽时间线/自动避障，也不是配音对时。保存及无配音准备/草稿/正式导出均走原任务锁，无临时渲染脚本要求。

## 用户使用流程

1. 展开“文章 → 视频剧本”，选择“连续动效短片 · 可配音”，输入文章，选择固定时长30～120秒、画幅和制作要求；合成音效默认关闭，可显式开启（开启后生成剧本的 `sfxMuted` 为 `false`）。
2. 点击生成会把文章与要求发往已配置模型，可能收费；先检查待审稿，再确认应用。不自动保存、不自动配音或渲染；无模型配置时仍可由Agent创作后导入JSON。
3. 在编辑区改字幕、节奏与对象动作；点击段落/动作时间点可跳到对应预览帧。段长变更会重排轨道但不会重新理解文案，仍需检查阅读节奏。
4. 保存→“无配音试跑”或“生成配音”→全片草稿→正式渲染。不需要用户编写React、JSON或运行临时脚本。也可在保存后点“生成配音”，按段合成旁白后再导出；配音超段长会报错。

验收检查：`node node_modules/tsx/dist/cli.mjs scripts/verify-master-workflow.mts`，使用本机已装Remotion Chromium及模拟API，覆盖表单/待审/编辑/保存/任务按钮，不写实际项目、不调用模型/TTS。它不证明真实模型能稳定达到样片设计质量，也不调用真实TTS。覆盖桌面/窄屏编排区最大高度、内部滚动与固定标题；默认不生成截图，结束关闭浏览器/Vite，不遗留本轮日志或抽帧。

## 物理弹簧、微插画与音效

- master 关键帧 `spring:{damping,stiffness,mass}` 可覆盖弹簧预设：阻尼5～40、刚度40～400、质量0.3～2；仅在该起点 easing 为 spring-* 时生效。空间属性可超调，opacity/progress 保持有界，终点精确停靠。推荐15～30帧到位后用相同姿态留阅读停顿。旧 MotionScene 仍只开放四套预设，不能直接复制自定义 spring 字段。
- 演员可选 `icon` 白名单（见 shared/master.ts 或 renderer 契约）；`kind:icon` 必须指定 icon；卡片也能带图标。`iconMotion:none|draw|pulse|spin`，draw 使用 keys.progress 0～1 驱动图标每条笔画显露；pulse/spin 按演员局部帧运行，不适合持续干扰正文。
- `kind:ring` 用 progress 驱动完整进度环，可带中心图标；label 为静态说明，不自动显示百分比。不得把虚构进度当作数据。
- `kind:doodle` + `decoration:underline|circle|arrow|spark` 为四套固定SVG手绘路径，同样按 progress 绘制；label 仍必填作为语义说明但不显示文字。不是任意SVG导入或定制插画素材库。
- `master.sfxMuted`：默认 `true`，音效静音但保留触发点，配音不受影响；写 `false` 才在预览和成片里发声。网页“文章 → 视频剧本”开启音效时会自动设为 `false`，编辑器音效区也有静音开关。
- `master.sfx:[{frame:326,sound:"bloop",gain:0.4}]`：最多60项，frame必须小于beats总帧；sound=bloop/whoosh/tick/chime，gain0～0.6默认0.3。由本地振荡器和固定种子噪声合成，不下载第三方录音；48kHz单声道PCM按30fps采样对齐，音效尾部在片尾裁掉。预览通过Remotion Audio播放相同合成波形，导出走PCM混合与AAC封装。
- 重叠音效相加，PCM输出硬限幅0.95；这不是专业响度归一化或ducking，大量叠加可能失真。优先稀疏使用，试听调整；无BGM、外部录音导入、配音自动对齐。Web的“无配音试跑”保留音效；“生成配音”时旁白与音效一起渲染进一条音轨，没有ducking，音效可能压住人声，需试听调低gain。

30秒示例：`input/master-motion-sound-30s.json` → `out/master-motion-sound-30s-review.mp4`（540×960、900帧/30.000秒、15个音效触发点、无配音）。校验命令：`npm run validate:storyboard -- input/master-motion-sound-30s.json`，不要附分镜数。

## 参考

- 2D 版样片：`input/master-canvas-24s.json` → `out/master-canvas-24s-review.mp4`（24.3 秒）
- 3D 视差版：`input/master-canvas-3d-24s.json` → `out/master-canvas-3d-24s-review.mp4`（24.3 秒，视差 + Z 轴砸入 + 动态投影）
- 测试：`tests/master.test.ts`
