# 当前开发进度与新对话交接

本文件记录当前工作区状态，供后续Agent接续。不是已提交发布说明，也不是用户的《项目经验手册》。后续先检查git status，避免覆盖用户正在修改的文件。

## 当前状态摘要（本次跨会话文档核对）

- 先读[文档总索引](./README.md)：汇总所有专题，区分分幕scenes、幕内MotionSceneBlock和全局master三套时间/字段契约。下文保留按轮次的历史，旧测试数字和旧能力限制不代表当前状态。
- 当前支持：连续短片文章生成（30～120秒）、对象/段落/动作/镜头/音效表单、物理弹簧/动态图形/CSS透视；master逐段TTS配音（每beat一句、段首播放、超段长报错，不自动改动作帧）；sfxMuted默认true。分幕另有受控机制/代码focus/cues/free布局/图表动画/本地图片/容器转移/定性天平，11套主题含handbook。
- 编辑器编排区最大`min(80vh,960px)`，内部滚动、顶部标题/页签固定；桌面与窄屏浏览器检查覆盖。一次性脚本、日志、抽帧用后清理，浏览器验证默认不生成截图，并在finally关闭浏览器/Vite；不自动删除用户稿件/正式视频/素材或缓存。
- 本次同步README中英文、AGENTS、llms索引与各专题，修正“内部图表全部静态、图片/机制未实现、master拒绝配音”等旧说法，以及主题数量、镜头范围、缓存指纹。不是新增其他会话的引擎能力，也未将其他会话的修改归为本轮成果。
- **本次实测102/102测试通过、无跳过，npm run build通过**（保留>500kB包体积警告）。`tests/schema.test.ts`改读固定visual-upgrade夹具，不再因用户当前script.json为master而失败；新增项目说明/索引完整性与临时截图/配音说明回归。
- `scripts/verify-master-workflow.mts`已更新为配音可用，模拟API完成生成/应用/字幕段长编辑/对象增删/保存/无配音与TTS任务/草稿/正式任务请求；不调用真实模型/TTS、不渲染MP4、不改用户项目，不能宣称全片音画验收。Python时序测试仅用假音频时长。
- 当前已有`input/anthropic-master-120s.json`和`input/anthropic-master-120s-voice.json`来自其他会话；本轮未改它们、script.json、timeline或视频，未重新试听/渲染，保留待验收标记。工作区含大量他人暂存/未暂存改动，未提交、推送或调整暂存区。

## 最新开发验收稿（尚待用户观看）

- `input/master-motion-sound-30s.json` → `out/master-motion-sound-30s-review.mp4`。
- **30.000秒、900帧、540×960、H.264 + 48kHz单声道AAC，15个本地合成音效，无配音**。本轮用户授权补齐能力并出30秒样片；没有下载外部录音、调用模型或TTS，没有覆盖script.json或历史视频。
- 下方“最新认可”是历史用户认可，不能等同于本次新样片已获认可。

## 用户目标与已认可效果

- 用户通过自然语言与AI沟通，AI只生成/修改JSON，确定性引擎执行布局和动画。开发阶段可以补通用能力，但必须说明改了源码；不得每换题材定制React。
- 用户明确不满意“旁白句首高亮/多一条箭头/卡片横移后等待”的PPT观感。期望句内持续过程、多对象错峰接力、构图变化、镜头与文字重点随讲解变化；不意味着每个对象持续抖动。
- 用户先认可连续动画版，再认可多彩开放舞台，之后认可镜头/字号/字重/颜色变化，最新反馈认可文字增强版。
- 不编造数据/来源、执行结果、物理或真实内存通信；动画服务理解，不用无意义晃动冒充动态。

## 当前最新样片与JSON

**最新认可：**
- `input/rust-motion-typography.json`
- `out/rust-motion-typography-review.mp4`（960×540、约134.27秒、静音）
- 基于polished版加强字号、字重、重点颜色，扩大文字容器，简化资源副说明，错开一处使用标记位置。该最后一轮仅修改新JSON，没有增加引擎能力。JSON已在实际渲染中经scriptSchema解析通过；整片重新渲染成功。不能据此声称真实配音/全帧人工验收通过。

**历史版本：** 旧polished/vivid/light/连续过程首版及改写前备份的5份JSON与对应历史预览已按用户本轮清理要求删除；能力示例统一指向保留的`input/rust-motion-typography.json`。
- 用户参考原片：`out/763bc53f48a015724e14f87b0a370133.mp4`。448×960、约281秒；黑边来自用户裁剪，不是原始设计限制。

## 已实现能力（源码是权威）

### 连续过程与运动设计

- `shared/motion-scene.ts`、`src/components/MotionSceneContent.tsx`：MotionSceneBlock。
- 对象稳定ID；shape=panel/token/ring/text/resource；位置/缩放/透明度/旋转/progress轨道，按narration句号+句内at比例计算，不写死估算秒数。
- 对象独立关键帧，错峰、重叠、接力；连线跟随边缘、持续流转点；resource内部内容条按progress逐段显露。
- 字段fontSize(16～60)、fontWeight(400～900)、emphasis(0～1，默认1)、jitter(0～3，默认0)、easing=smooth/linear/settle。emphasis为正文色→对象tone色渐变；字重是否连续取决于本机字体。微抖仅短时强调。
- camera句内轨道x/y=35～65、zoom=1～1.25，仅舞台内容推拉平移，标题/字幕不动；不是跨幕转场。随机seek确定性；animation=none冻结插值/流动但保留时刻切换。
- 已修复镜头转换时把zoom字段传给strict motionKeySchema导致渲染失败的问题，抽出cameraPose并加回归测试。
- 无自动避障、文字排版/碰撞检测、曲线路径编辑器、真实物理、无缝跨幕身份或任意代码执行。

### 主题与呈现

- `shared/themes.ts`为主题目录与视觉tokens权威，`shared/presentation.ts`引用，生成提示也复用。
- 10主题：blue/editorial/light/vivid/ocean/sunrise/botanical/candy/neon/blueprint。
- 新主题在连续舞台使用openStage、背景wash/orbits/grid、圆角及teal/rose适配；旧代码窗口保持深色，部分旧图表仍固定语义色，不是全组件完整换肤。
- `out/theme-gallery.jpg`：上排ocean/sunrise/botanical，下排candy/neon/blueprint。对应`input/theme-*-example.json`保留；3秒主题短测视频已清理，需要时重渲染。
- 顶层format=portrait实际1080×1920（草稿540×960），默认landscape1920×1080（草稿960×540）。
- 富文本、大字、按句揭示、CycleBlock、chapter/source、品牌/页脚/分镜进度。
- 本地ImageBlock：`scripts/import-image.ts`标准化PNG/JPEG/WebP，哈希路径，渲染前检查路径/内容；无网络下载、SVG或独立MCP素材写入权限。

### 其他此前实现（仍在工作区）

- MechanismBlock完整实体状态/关系快照、slot/visible/container标签；代码focus同句联动。
- cues显隐/强调/局部项/聚焦与布局快照；free百分比位置与connectors可控线型/路径/箭头/流动。
- TransferContainerBlock可视容器归属转移；BalanceScaleBlock定性天平；StatBlock.counter、BarChartBlock.countUp、TimelineBlock.milestones。
- 分镜无声视觉缓存+连续音轨合成，保守引擎指纹，format/theme等失效条件；FFmpeg必须本地安装。之前实测修复过Remotion chunk合成丢帧，现用FFmpeg concat。
- 插件仅内置分类目录`shared/extensions.ts`，不是运行时动态插件加载器。

## AI生成入口与历史验证记录

- `server/article.ts`的buildMessages实际注入rendererGuide（`shared/capabilities.ts`）和directorGuide（`shared/director.ts`）；MCP共用能力规则。新能力不是仅写文档。
- 导演规则涵盖过程编排、错峰接力、镜头/文字重点、10主题自主选型；不强制所有文章使用所有组件，不虚构素材哈希或数据。
- `input/rust-canvas-test.md`已整体统一为连续过程优先：Move/Borrow优先MotionSceneBlock，离散对照才选MechanismBlock；正文与启动提示不再强制固定实体位置或旧输出文件名，新稿路径须先确认且不覆盖已有稿件。第三节文章素材未改。
- 已修正主要文档与实际rendererGuide中“图内全部静态/禁止计数/无分镜进度条/仅visual.camera”的旧概括，区分整块target与声明式块内动作；未新增Schema或渲染能力。
- 当时完整验证：**68项测试通过，npm run build通过**（仍有>500kB包体积警告）。新增3项文档/契约回归；最后认可样片未修改，本轮无新视频渲染。
- 文字增强视频、65测试不能代替真实TTS/听感、跨题材AI创作或所有帧视觉验收；本轮无模型/TTS外发。
- 常用：`npm test`、`npm run build`、`npm run validate:storyboard -- input/rust-motion-typography.json 5`。

## 历史产物清理（已获本轮用户授权并执行）

- 已删除94个历史文件，约27.23MiB：89个out开发截图/短测/重复草稿/旧预览，及5份旧Rust动画JSON。
- 保留当前20秒JSON/视频、最新Rust文字增强JSON/视频、主题总览、用户参考原片、全部video-*.mp4及scene-cache。未动public素材/音频、script.json和用户文案。
- `docs/out-cleanup-inventory.md`已由旧清点名单改为本次结果及保留边界；测试夹具与能力文档保留，旧示例引用已修正。
- 后续不要每轮累积截图/短测/版本稿；临时抽帧放系统临时目录，新的验收版本替代旧版时先明确归属再清理。没有实现后台自动删除或缓存淘汰，不将本轮授权扩大到未来用户文件。

## 工作区与安全边界

- 大量修改与新增文件尚未提交；最后已知推送基线b1c107f。后续应git log/status确认，不能自动提交/推送。
- 用户自改`script.json`、《项目经验手册.md》、生成稿、参考材料均需保护；不能将用户变化归为助手成果。不修改《项目经验手册》来记录开发进度。
- `git diff --check -- . ':!项目经验手册.md'`通过；用户手册既有EOF空行警告不擅自修复。
- 不提交out、public导入素材、音频缓存、timeline、密钥。LICENSE事先书面授权要求不得淡化。

## 20秒仅文案能力试验

- 新稿：`input/agent-boundary-20s-study.json`；草稿：`out/agent-boundary-20s-study-review.mp4`，540×960、18.23秒、静音估算。直接创作JSON，仅依据参考文案提炼核心判断，未使用参考片画面、OCR或音轨；不等于整篇覆盖。
- 单舞台编排提问→自己做→让出去→判断问题，包含文字层级、缩为锚点、退出、新重点接力；未改Schema或渲染源码。
- 修改`shared/director.ts`实际共用生成提示：鼓励大字、视觉主角与注意力交接，不默认等大卡片常驻；同步docs/mcp.md、llms-full.txt及tests/director.test.ts。68项测试与build通过。提示通过不证明外部模型创作质量，本轮没有外部模型/TTS调用。
- 抽帧发现：字号虽接近当前60上限，SVG舞台映射后主文字仍偏小，外层固定标题较抢眼、留白过多。此版是边界试验，不称专业效果或能力上限已穷尽；需用户连续播放反馈，未做全帧验收。下一步优先文字尺度/标题层级及读停节奏，不增加装饰组件。
- 用户强调只从Markdown理解并直接写JSON，不要为文章写生成脚本或复刻参考片。此前误建临时生成/OCR文件及anthropic-text-only-v1.json已按用户要求删除；之后out历史产物清理见上节。

## 通用运动增强（本轮）

- 已实现`shared/motion-effects.ts`：对象空间轨道三种弹簧、可选visual.ambient慢漂移星尘/光晕、MotionScene.props.stagger固定帧组级入场。无新外部请求或MCP权限。
- Schema/渲染/共用AI导演提示、网页环境选项与JSON编辑说明已同步；详见docs/motion-effects.md。默认旧稿不变，none冻结氛围/取消错峰等待与位移；显式stagger不被pace=all关闭。仅连续舞台对象支持组级stagger，未给所有旧列表自动递归实现；不是碰撞物理。
- 验收稿`input/motion-effects-study.json`，视频`out/motion-effects-study-review.mp4`，540×960、24.37秒静音估算。已有20秒稿与Rust稿未覆盖；仅保留一个新视频，时间戳中间文件改名发布而非另留副本。
- 当前同名验收稿/视频已按用户反馈原位迭代：移除panel线框改为开放大字，主对象scale=1.4～1.5并加受限镜头，背景aurora叠加glow。不是玻璃材质实现；未新增材质字段或改引擎。24.37秒静音，Schema校验与实际渲染通过，10秒抽帧文字无明显裁切；此前星尘版已被此版替代，不另存历史视频。
- 72项测试、build通过（包体积警告仍在）；实际短片渲染成功，抽帧无明显端点越界，未完成逐帧/连续人工验收。对象超调路径不自动避障；低对比星尘在缩略图里不明显，需原尺寸播放检查。字体尺度、外层标题与留白问题未由本轮解决。

## 字幕按语义分句修复

- `shared/subtitles.ts`移除28字硬切：完整短句整页，长句沿逗号/分号/冒号分页，句号/问号/叹号不跨句拼接，闭引号跟随本句；无标点长句保留完整由画面换行。
- 分页时长按字数比例估算，不是逐词音频对齐；74项测试与build通过，新增字幕保真/边界/旧稿及静止时刻测试。
- 当前同名`out/motion-effects-study-review.mp4`已重渲染替换，未积累另一版；用户原稿不动。超长无标点文本可能占多行，需人工检查空间，不以硬切解决。

## 卡片材质与焦点降噪（本轮）

- 新增panel半透明渐变玻璃卡（细边、圆角、投影、顶部高光），对象可选badge微标签与icon白名单图标；新增props.focus快照自动将非重点对象降透明并可选模糊，成员切换12帧平滑过渡。
- 实现位置：shared/motion-scene.ts（Schema/focusPose/guide）、src/components/MotionSceneContent.tsx（卡片/标签/图标/udid defs）、shared/canvas.ts与shared/schema.ts（引用与句号校验）。无新外部请求、未改MCP权限；旧稿无需新字段。
- 测试：新增tests/motion-material.test.ts（聚焦插值与静止、边界拒绝、badge/icon限制）；77项全部通过，build通过。
- 验收稿`input/motion-effects-study.json`原位改写并重渲染为`out/motion-effects-study-review.mp4`（540×960、19.4秒静音），不再保留上一版视频。抽帧可见玻璃卡、角标、图标、聚焦模糊与分屏结论；未做逐帧/全片人工验收。
- 边界：icon/badge只是视觉标注，不证明来源或认证；focus是视觉降噪不是真实景深；字体尺度、自动排版与跨幕连续性仍未解决。

## 弹簧节奏与环境呼吸（本轮抛光）

- 放大聚焦阻尼：“调度”放大改为`spring-bouncy`，关键帧间隔从54帧压到约22帧，并紧接一个相同姿态留阅读时间。实测scale峰值1.141、目标1.12、约0.23秒到达后回落到1.12停稳；这是关键帧节奏+弹簧预设的组合，不是新的全局缩放特效。
- 环境呼吸视差：新增`ambientDrift`，启用ambient时整层慢速平移/缩放（约25秒+9秒双层，<12px），aurora/glow背景光跟随并各自带相位偏移；绝对帧驱动、相邻帧位移<1px、animation=none冻结。
- 首版漂移周期约71秒，在19秒片内几乎不可见，已调至可感知的慢速区间；这是实测后修正，不是只改注释。
- 78项测试（新增ambientDrift有界/确定/无抖动/静止冻结）与build通过；`out/motion-effects-study-review.mp4`已原位重渲染（19.4秒静音）。已抽帧比对放大三帧与背景三帧，未做全片逐帧人工验收；超调路径不自动避障。

## 暖色手帐风与俏皮弹性（本轮）

- 主题目录扩为11套，新增`handbook`：暖褐底、米白大字、琥珀边、radius=26、琥珀/橙黄高亮；主题新增`highlight`色token与`subtitleBg/subtitleFg`，浅色主题的highlight自动改用#b45309以过对比测试。
- MotionScene tone新增`highlight`（暖黄荧光笔式重点）；弹簧新增`spring-jelly`（damping7/stiffness320，超调最明显）。字幕胶囊改为主题驱动（handbook暖黄底深字、圆角22），不改变分句与时长逻辑。
- 79项测试与build通过：主题对比测试扩展到highlight与11套主题，新增spring-jelly超调大于soft且有界停靠的断言。
- 验收稿`input/motion-effects-study.json`改为handbook+highlight+spring-jelly原位重渲染，`out/motion-effects-study-review.mp4`（19.4秒静音）。抽帧确认暖色卡片、大圆角、黄色高亮与字幕胶囊；未做全片逐帧人工验收。
- 仍是产品能力：用户/ AI 只需在JSON选palette=handbook、tone=highlight、easing=spring-jelly，不改源码。未提供任意CSS或自定义色值。

## 渲染性能优化（本轮，含实测）

- 静音时间轴跳过整片 WAV 渲染，改 FFmpeg 补等长静音轨；旧实现白跑一整趟（19.4秒片占11.7s）。
- 并发从写死2改为`min(8,CPU-1)`，`SHENYING_CONCURRENCY` 可覆盖；缓存指纹移除`server/`，改编排不再清空全部分镜缓存；草稿用x264 veryfast。
- 实测：19.4秒整片重绘 16.8s→6.7s；缓存命中 13.4s→1.4s；7分17秒整片 **167s**（此前20分钟量级）。`GL=angle`实测14.2s比默认6.7s更慢，故默认不开GPU后端；未接NVENC/VideoToolbox。
- 新增`docs/render-performance.md`并链接；79项测试与build通过。产物`out/anthropic-parts-v1-review.mp4`已用新流水线重渲染（437.1s、540×960、静音），未逐帧人工验收。

## 成片取向（cinema）与镜头范围（本轮）

- `theme.cinema=true`：隐藏品牌/页脚/页码/进度条/画布大标题/舞台说明，外层留白大幅收窄，画面接近满幅；默认false保持原幻灯片式框架，旧稿不受影响。
- 镜头范围放宽：x/y 10～90、zoom 1～2.4、每帧可带easing。**修复真实bug**：cameraPose曾把镜头关键帧丢进对象scale上限(1.5)的schema，zoom>1.5会渲染报错；现改为独立插值并加回归测试（80项通过）。
- 验收稿`input/video-style-50s.json` → `out/video-style-50s-review.mp4`：6镜、49.1秒、540×960、静音，cinema+推拉镜头+快切。渲染22.4s（并发8、静音跳过音轨）。
- 仍未解决：每镜仍是单一构图、无跨镜连续运动、无遮罩/图像层；SVG内字号上限60导致主体仍偏小。因此“像视频”只是前进了一步，不等于达到参考片水准。

## 微场景与微观动效（本轮，反PPT）

- 对象新增`reveal`(fade/rise/wipe/typewriter/pop)、`revealFrames`、`float`(0～3正弦漂浮)、`capsule`/`glow`；均在JSON声明、默认兼容旧稿，`animation=none`冻结。
- 修复两个真实bug：①cameraPose误用对象scale上限导致zoom>1.5报错（上一轮已修）；②本轮revealP未写入pose导致typewriter渲染为空字符串——抽帧发现后修正。
- 验收稿`input/video-style-30s.json`→`out/video-style-30s-review.mp4`（18.4秒、540×960、静音、cinema）：胶囊标题+逐字出现+卡片漂浮+擦除入场。81项测试与build通过。
- 仍未解决（不能声称已摆脱PPT感）：跨幕连续运动/对象身份延续、遮罩与图像层、密集多机位剪辑。当前仍是“单镜一构图 + 元素进出”。

## 单根全局画布 master 模式（本轮重点）

- 新增 `shared/master.ts` + `src/MasterCanvas.tsx`：整片一张画布，演员按**绝对帧**关键帧走位，顶层虚拟摄像机推拉平移；不再一条幕一条幕拼接。
- 因此跨段连续运镜成立：标题从画面中央缩小飞到左上角变成常驻标签，卡片依次从画面外飞入，全程不切换场景。
- 接入方式：`scenes: []` + `master`，两者互斥；`previewTimeline` 用 `master.beats` 求和作总时长；`renderTimeline` 有专门分支整片一次渲染（无分幕缓存）。
- 验收稿 `input/master-canvas-24s.json` → `out/master-canvas-24s-review.mp4`：24.3 秒、540×960、静音，一次渲染 8.6 秒；85 项测试与 build 通过。
- 过程中修掉两个自己引入的问题：早退分支误放进 `Slide` 导致整片全黑；主题背景键名写成 `bg`（实际是 `background`）导致黑底。都是抽帧发现，不是看代码推断。
- 限制：帧数写死、不走 TTS 估时；无遮罩/图像层；master 尚未接入 Web 编辑器与 MCP；仍不是“大厂爆款”水准。

## 3D 视口（本轮追加）

- 舞台加真正的 `perspective` + `preserve-3d`；演员新增 `depth`（视差系数）、关键帧级 `z`、`rotateX/rotateY`。
- 镜头不再整体缩放舞台，改为**每个演员按 depth 各自响应**：背景慢、常驻标签轻、卡片快，形成视差。卡片从 `z:-320` 用弹簧砸到 `z:30`，抽帧可见明显近大远小。
- 投影随距离变化：越近越散越深，远处收紧。
- 样片 `input/master-canvas-3d-24s.json` → `out/master-canvas-3d-24s-review.mp4`，24.3 秒，一次渲染 14.0 秒（3D 变换比 2D 慢约 60%）。86 项测试与 build 通过。
- 限制：CSS 3D 不是真三维，无光照/遮挡/景深；`backdrop-filter` 与 3D 变换叠加时观感不稳；透视值过小会让文字变形。

## 经验总结（本轮沉淀）

- **JSON 决定上限，引擎决定下限**：同样的能力，保守编排就是等大卡片轮播；有主次、退让、接力才像专业讲解。改提示词有效，但不能代替设计。
- **弹簧必须配短时长**：spring 只填充关键帧间隔。段长 >40 帧时超调被稀释成缓动；想要"Q弹"要把放大段压到 15～25 帧，再给相同姿态留阅读时间。
- **可见性要实测**：ambient 首版周期 71 秒，19 秒片子里只动几像素，等于没做。任何"细微动效"都要抽帧或数值验证，不能只看代码写了 sin。
- **对比度归测试管**：新增色调一律进主题对比测试；暖黄 highlight 在浅色主题必须换深琥珀，否则白底黄字不可读。
- **主体要少**：一镜一个视觉主角；旧信息缩成锚点或退出，比"全部常驻+半透明"更有主次。focus 降噪是声明式能力，优于手工写透明度。
- **字幕规则**：短句整句、长句按标点分句，禁止按字数硬切跨句拼页。
- **能力进产品，不进每个视频**：用户/AI 只写 JSON；源码改动一次性补齐 Schema/渲染/提示/测试/文档五处，缺一就会"文档有、引擎没有"。
- **不要用装饰掩盖短板**：字体尺度、自动排版避让、跨幕连续身份仍未解决，粒子和回弹不能替代。

## 物理弹簧、动态图形与合成音效（最新一轮）

- master弃用阻尼余弦近似，改真正Remotion spring()，四预设与旧MotionScene一致；master关键帧可选spring:{damping:5～40,stiffness:40～400,mass:0.3～2}。起点easing控制至下一帧，opacity/progress有界，首关键帧前不可见；旧MotionScene仍仅四预设，不开放自定义参数。
- `src/components/ActorGraphic.tsx`：master增加icon/ring/doodle；图标白名单，draw逐笔/pulse/spin，progress环与underline/circle/arrow/spark四套固定手绘路径。不是自由插画/外部SVG素材库。
- `shared/sfx.ts`：bloop/whoosh/tick/chime本地确定性合成，JSON绝对帧事件，gain≤0.6、最多60项；预览Audio与导出PCM同源。导出48kHz单声道混合、PCM硬限幅0.95再AAC，无BGM/ducking/外部录音。master不再无条件补静音；prepare_tts明确拒绝master。
- 修复CLI校验master入口（不传分镜数），Web载入master时不再访问不存在的scene，支持JSON编辑/预览/保存/无配音准备/渲染，无可视化演员关键帧编辑器。MCP既有schema、renderer、validate/preview和写入任务锁可复用，无新工具/权限；普通文章生成仍按分镜数，不自动切换master。
- Schema/渲染/共享生成及MCP契约/文档/测试同步。91项测试通过、build通过，保留>500kB包体积告警；新增MCP内存协议校验、CLI入口、文档JSON示例、物理数值与PCM时序/硬限幅回归。
- 实测最终渲染画面完成约7.4s（含打包1.0s，草稿），非通用性能保证。抽查整片稀疏帧及回弹/绘制中间帧：初稿超调被淡入遮住，改为先显露后24帧回弹；可见scale在318帧1.588→322帧1.362→334帧1.45，非仅代码宣称。
- 已确认视频900帧/30.000秒、非静音音轨。解码初稿音轨15个触发阈值相对设定约1～12ms（包络），峰值约0.513/-5.8dBFS，无削波；最终仅移动一处bloop触发326→314帧以匹配落点。未真实试听、未全帧人工验收；不能说音效听感或参考片级效果已达标。
- 当前限制：画面仍是文字/受控矢量图形，手写固定帧编排，不是AI自动编舞/配音自适应。下一步先让用户观看30秒样片决定方向，不继续自行加特效或清理历史out。

## 连续短片产品入口接入（历史阶段，配音现状见当前摘要）

- 用户明确要求能力用于产品，而不是只手工做样片；本轮不再新增视频，重点打通正常创作与编辑入口。
- `shared/article.ts`新增mode=scenes|master、format、instructions、soundEffects，API/MCP默认scenes兼容旧客户端。网页默认展示master/竖屏/30秒，合成音效默认关闭；master请求限制30～120秒。
- `server/article.ts`增加master专用导演提示，生成完整演员/关键帧/字幕/镜头/音效，不强制分镜数，不要求用户写帧或改代码。返回校验模式、精确时长（无尾padding）、画幅、音效开关，错误拒绝不静默转换。分幕原流程保留。
- `web/MasterEditor.tsx`与master.css提供表单编辑字幕/段长/主题背景、对象增加删除/文字类型/图标/字号尺寸/动作时间点/弹簧/镜头坐标/音效。秒数转帧，点击段落或时间点跳转预览；`shared/master-edit.ts`按段缩放/后移轨道，帧碰撞拒绝不丢动作。不是拖拽时间线/自动避障/AI自然语言局部重编排。
- 正常网页的应用→预览→保存→无配音准备→草稿/正式导出按钮已接通，原API任务锁与权限不变；master TTS界面禁用且后端拒绝。MCP生成请求参数、提示、说明同步。README/llms/MCP/renderer/master/agent指南已更新。
- **96项测试通过，build通过**，保留>500kB警告。`scripts/verify-master-workflow.mts`用已装Remotion Chromium+Vite、模拟API完成浏览器检查：文章表单→待审应用→改字幕/段长→增加删除对象→保存→准备→草稿/正式任务请求，确认无页面错误、配音禁用。不调用真实模型/TTS、不写用户项目；任务/导出响应是模拟，不能说本轮浏览器真实渲染验收。
- 真实generateArticle适配器另有mock fetch测试，MCP用内存协议测字段透传/越界拒绝。尚未真实外发跨题材文章测试，因此“入口可用”不等于“不同文章都能自动稳定达到手工样片水平”。下一步应在用户批准外发后做真实模型跨题材质量验收，配音自适应对时仍是缺口。没有改script.json、清理历史out、提交或推送。

## master 逐段配音与音效默认静音（其他会话实现）

- master 可用“生成配音”/prepare_tts：`scripts/generate-audio.py` 每个beat的text合成一句（晓晓），记录到时间轴 `masterNarration:[{beat,from,durationInFrames,audioSrc}]`，from为段起始绝对帧；动作帧不变，配音超段长报错并给出段号，不自动变速或拉伸。
- `src/MasterCanvas.tsx` 按段挂载配音，预览与成片同源；`server/pipeline.ts` 有配音时用Remotion渲染整条WAV（配音+未静音音效）再与静音画面合成，无配音时仍用 `mixSfx`。渲染前校验音频路径与时长范围。无ducking。
- `master.sfxMuted` 默认 `true`：保留触发点但不发声；网页文章生成勾选音效时后端设为false，编辑器音效区有静音开关。旧剧本未写该字段的一律静音。
- 新增 `tests/master-narration.test.ts`（离线，不调用TTS）。旧测试曾直接 `prepare(script,'tts')` 断言拒绝，放开后会真实外发，已删除；任何测试不得调用prepare('tts')。
- 交付：`input/anthropic-master-120s.json`（120秒，36个音效点）与 `input/anthropic-master-120s-voice.json`（第1/2段调为130/200帧以容纳配音，sfxMuted:true）。按缓存配音核对16段均不超长，最紧余7～11帧；未渲染、未试听。
- 验证：100项测试中98通过，build通过。`tests/schema.test.ts` 两项读当前script.json并假设分幕剧本，当前项目为master剧本时失败，与本轮无关。

## 推荐下一步

1. 用户换题材时冻结源码，只生成新JSON，验证能力泛化，保留所有用户稿件。
2. 主要文档与Rust测试任务的旧限制已统一，并有tests/documentation-contract.test.ts回归；后续新增能力时直接修改原有说明，不靠末尾追加“旧文作废”。仍须按真实Schema逐项核对，不把文本回归当作语义或媒体验收。
3. 增加跨题材及长文案、深浅主题、镜头放大边界、字重回退、none模式的媒体回归。
4. 历史产物已按本轮授权清理；保持少量当前验收稿，不自动删除归属不明的正式视频或用户文件。
5. 非必要不增加装饰组件：高级感依赖主次、留白、文字层次、运动节奏，不用全员持续抖动替代。
