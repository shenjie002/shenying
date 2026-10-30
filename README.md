# 申映 Shenying

### 把知识讲清楚，让文章变成视频。  
### Turn knowledge into clear, narrated explainer videos.

[中文](#中文说明) · [English](#english)

> **授权说明：本项目源码公开，但不是开源授权。除法律及 GitHub 平台条款允许的范围外，任何使用（包括个人、研究和商用）、复制、修改或分发，均须事先联系作者并取得明确书面授权。** 详见 [LICENSE](./LICENSE)。联系入口：[shenjie002](https://github.com/shenjie002)，也可通过本仓库 Issue 提交授权请求。下方安装与运行说明仅供已获授权的用户使用。
>
> **Permission required:** Public source does not mean open source. Except as permitted by law and GitHub's terms, any use (including personal, research, and commercial use), copying, modification, or distribution requires prior explicit written permission. See [LICENSE](./LICENSE). Contact [shenjie002](https://github.com/shenjie002) or open a permission-request issue. Setup instructions below are for authorized users only.

---

## 中文说明

### 项目介绍视频

[🌐 在线演示网站 / Live demo](https://shenjie002.github.io/shenying/)（只读介绍与预录视频，不提供在线制作服务）

[▶ 查看申映项目介绍视频（MP4，约 7 MB）](https://github.com/shenjie002/shenying/releases/download/project-introduction-video/video-1793351473140.mp4) · [视频发布页 / Watch or download](https://github.com/shenjie002/shenying/releases/tag/project-introduction-video)

通过实际演示了解文章、结构化剧本、人工审阅、配音和视频导出的制作流程。此视频是项目介绍，不代表所有能力组合均已验收，也不保证任意文章一键成片。

**English:** [Watch the project introduction](https://github.com/shenjie002/shenying/releases/tag/project-introduction-video). This demonstration introduces the workflow; it is not a guarantee of unattended production quality.

### 图表与语义图标

文章生成会依据内容选择拓扑、对比矩阵、时间轴、柱状图、层级树及白名单图标，并与原有块混排。没有真实数据不生成性能图，不默认判定两方案谁对谁错。旁白target控制整块；柱图显露/计数、时间轴节点和树的顺序显露使用独立声明字段，不是任意数据变形。见[图表指南](./docs/visualizations.md)及[虚构数据布局示例](./input/visualization-example.json)。

### Evidence-led charts and icons

Article generation can also compose TopologyBlock (supported node relations), CompareBlock (neutral two-column facts), TimelineBlock (sourced ordered events), BarChartBlock (source-backed comparable numbers), TreeBlock (bounded hierarchy), and a whitelist-only semantic IconBlock. Callouts have built-in state icons. The actual prompt, schemas, and Remotion renderer are implemented; this is not a wishlist. No invented metrics, dates, or relationships. Narration targets control whole-block reveal/focus; supported chart motion, counters and milestones use separate declared fields. This is not arbitrary data morphing or node animation. See [visualization guide](./docs/visualizations.md) and explicitly fictional [layout test fixture](./input/visualization-example.json).

### Agent 发现与 MCP

供搜索或评估本项目的 Agent 阅读：[llms.txt](./llms.txt) · [完整参考 llms-full.txt](./llms-full.txt) · [Agent 工作指南](./docs/agent-guide.md)。这些文件帮助理解项目，不保证被搜索引擎或 Agent 收录。开发 Agent 另见 [AGENTS.md](./AGENTS.md)。

模型生成前会接收[真实渲染能力契约](./docs/renderer-contract.md)，按各模板实际动作规划分句旁白、target及视觉参数；待审稿可展开检查动作编排，不会把任意文字指令当成可实现的动画。

本项目提供本地 **stdio MCP 服务**，可读取项目、校验剧本、估算时间轴，并按显式权限开放保存、模型生成、配音和渲染。默认只读，复用现有本地 API 的任务锁；授权及用户确认要求仍然适用。客户端配置、工具清单和权限说明见 [MCP 接入指南](./docs/mcp.md)。

### 这是什么？

**申映（Shenying）是一个本地运行的教育讲解视频制作工作台。** 它将文章整理成结构化分镜，让你在网页中修改旁白与画面，再通过语音合成和 Remotion 输出 MP4。

适合技术科普、代码讲解、知识总结、流程说明和方案对比。它不是传统拖拽剪辑器，也不是无需审稿的一键成片服务。

```text
粘贴文章 / 导入 Markdown
          ↓
AI 生成分镜 → 人工审阅 → 可视化编辑
          ↓
整幕或分句配音 → 时间轴与字幕 → 画面预览
          ↓
Remotion 本地渲染 → 下载 MP4
```

不配置模型也可以编辑示例或导入标准 JSON 剧本。

### 功能

| 能力 | 说明 |
| --- | --- |
| 文章生成剧本 | Markdown/TXT输入；选择分幕讲解或连续短片、受众/风格/画幅/时长/制作要求；生成后审阅，分幕模式另设分镜数量 |
| 可视化编辑 | 分幕内容/旁白/顺序；master字幕、段长、对象、动作时间点、镜头及音效表单；保留JSON校验导入。左侧独立滚动，顶部切换栏固定 |
| 六种场景 | 标题、要点列表、代码讲解、双栏对比、流程演示、终端模拟 |
| 视觉与节奏 | 光晕/网格/纯色背景，柔和弹簧或轻缓入场，分步或完整展示，自定义比例节拍 |
| 代码演示 | 轻量词法着色、行号、逐行聚焦、焦点滚动及解释侧栏 |
| 配音与时间轴 | Edge TTS 中文旁白、音频缓存、实际时长测量、静音估算时间轴 |
| 分句讲解 | 单句合成、句首绑定画面目标、随句字幕，可合并回整幕配音 |
| 连续讲解 | MotionSceneBlock按句内比例组织对象/连线；master单根全局画布按绝对帧延续演员身份，二者字段和时间基准不同 |
| 画布与过程 | 代码行focus、机制状态/关系快照、cues显隐/聚焦、百分比自由布局与跨块连线 |
| 高级表达 | RichText、受控本地ImageBlock、Cycle、容器归属转移、定性天平、计数与节点强调，不是自动事实验证 |
| 主题与动效 | 11主题（含handbook）、cinema去母版、四档弹簧、氛围/错峰/聚焦；master另有受限自定义弹簧、动态图标/手绘、CSS透视/视差 |
| 音效 | master本地合成bloop/whoosh/tick/chime，sfxMuted默认true，保留触发点不发声；无BGM/ducking |
| 预览与导出 | 横屏1920×1080/竖屏1080×1920，30fps H.264；全片草稿960×540/540×960；分幕视觉缓存，master整片重渲 |

**终端演示只是视觉模拟，不会执行填写的命令。**

另有按每幕内容自主选择的[背景、入场与聚焦风格](./docs/visual-style.md)：极光、颗粒、斜光、代码暗纹，以及缩放、翻转、发光边框和遮罩展开。画布支持整块暗化或低频呼吸聚焦，以及StatBlock.counter等受控计数；不支持逐词配音追线。

## 连续动效短片：用户入口

网页“文章 → 视频剧本”可选连续动效短片（30～120秒固定时长、可逐段配音、合成音效默认静音）或原分幕讲解（支持TTS）。输入文章、画幅、时长和制作要求，AI返回完整待审编排；合成音效默认关闭。应用后用表单改字幕、段长、对象、动作时间点、镜头与音效，再保存→无配音试跑或生成配音（每段一句、不得超段长）→草稿→正式导出，不要求用户改JSON/源码或运行临时脚本。需要已配置模型且生成会外发文章，先确认隐私与费用。配音自适应对时、自动避障、真实模型设计质量仍未验收，不以样片或测试通过保证“一键达到样片水准”。详见[全局画布工作流](./docs/master-composition.md)。

## 音画与制作优化

生成前可见[音画与可靠性说明](./docs/audio-motion-reliability.md)：有限音色、句首关键词提示、轻缓运镜/画布视差及全长低清草稿均已有实现；BGM/分幕SFX、卡拉OK逐字字幕与AI自动改源码/自修复未实现；独立master全局画布已支持本地合成音效与绝对帧触发，见[全局画布说明](./docs/master-composition.md)，不代表外部录音或配音自动对齐。

### 混合画布

新增 **CanvasSlide** 可将代码、要点、提示、数据及简单节点图组合在同一分镜，并通过 GroupBlock 嵌套分栏、网格和堆叠布局。支持按整块绑定旁白句首入场与聚焦，保留原六种模板。网页先选择“混合画布”，用结构化布局 JSON 编辑并应用；不是拖拽或任意坐标编辑器。见 [画布指南](./docs/canvas.md) 与 [代码＋图解＋提示示例](./input/canvas-example.json)。支持百分比free布局、CodeBlock.focus逐行聚焦和哈希路径本地图片/静态矩形标注；不支持自动截图、远程素材或自动布局避障。内容过多仍可能裁切，需预览确认。

### 项目状态

这是正在开发的**单项目 MVP**。基础配音、渲染、下载和视频播放曾经用户手动验证；近期的六场景视觉升级、文章生成和分句字幕仍需对当前版本执行构建、测试及实际成片验收。本文列出的实现能力不等于所有组合均已验证稳定。

尚未实现：自动截图/OCR标注、自动布局避障、任意CSS/JS或动态插件、多项目、持久化任务队列、批量制作、逐字字幕对齐、SRT导出、BGM/ducking和场景间重叠转场。已实现的受控机制、本地图片标注、图表动画不等于任意动画能力。

### 文档与能力导航

[docs 总索引](./docs/README.md)按创作流程、能力类型、运维和历史记录整理全部专题，包含其他会话新增的功能。先选分幕/幕内连续过程或master全局画布，再看对应Schema；不要跨模式复制字段。最新工程状态见[当前进度](./docs/current-progress.md)，用户认可样片、开发验收稿和待渲染稿分别记录，不以历史测试数字代表当前状态。

分镜编排区最大高度为视口80%、上限960px，长内容在区内滚动，顶部标题/页签保持可见；不随内容增长推长整页。开发临时脚本、日志和抽帧用后清理，不自动删除正式视频、用户稿件或scene-cache。

### 环境要求

- Node.js 22，npm。
- 本地 FFmpeg：正式/草稿视频的增量合成需要PATH中可用的 `ffmpeg`，macOS可用 `brew install ffmpeg`。
- Python：推荐 3.10 或更新的受支持版本；早期开发环境使用过 3.8。
- 首次渲染可能需要联网下载 Remotion 使用的 Chrome Headless Shell。
- 真实配音需要访问 Edge TTS；文章生成需要模型服务。
- 建议先在 macOS / Linux 使用。当前 Python 默认路径为 `.venv/bin/python`；Windows 需要设置 `PYTHON` 为实际解释器路径。

### 快速开始

在项目根目录执行：

```bash
npm install
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
npm run dev
```

打开 **http://127.0.0.1:5173**。

开发命令同时启动 Vite 前端（5173）与本地 API（3001）。生产界面可通过 `npm run build`、`npm start` 启动，访问 **http://127.0.0.1:3001**。

服务只绑定本机。不要直接暴露到公网。所有命令都应在项目根目录运行；移动项目后如虚拟环境路径失效，请重新创建 `.venv`。可通过 `PYTHON` 环境变量指定 Python 解释器。

### 配置文章生成模型（可选）

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

填写：

```dotenv
LLM_BASE_URL=https://your-provider.example/v1
LLM_MODEL=your-model-name
LLM_API_KEY=your-api-key
```

- 目前支持 **OpenAI 兼容 Chat Completions** 协议，不代表支持所有厂商的原生接口。
- Base URL 不要附加 `/chat/completions`，但按服务商要求保留 `/v1` 等前缀。
- 远程模型地址须为 HTTPS，本机模型服务允许 HTTP。
- 密钥仅在后端读取，**不要使用 `VITE_` 前缀，不要提交 `.env`**。
- 本地模型也需提供兼容接口：`LLM_BASE_URL=http://127.0.0.1:<端口>/v1`，`LLM_MODEL`填实际模型ID；当前适配器要求非空`LLM_API_KEY`，无鉴权的本地服务可填非秘密占位值。模型不会通过file://自动读取资料，应在网页导入文章或使用有项目文件读取权限的Agent。调用本地模型不代表Edge TTS也在本地。
- 配置变更后重启后端服务并刷新页面。

### 制作第一支视频

1. 编辑示例，或在「文章 → 视频剧本」中输入文章生成待审稿。
2. 核对事实、代码、旁白和画面参数，点击「应用到编辑器」。这一步不自动写入磁盘。
3. 保存剧本。JSON 文本必须先「校验并应用」，才会进入当前项目。
4. 如需分句讲解，在分镜中拆分旁白并设置句首目标：代码行号或项目序号，从 1 开始。
5. 点击「生成配音」，或先用「静音试跑」检查估算时间轴。静音试跑本身不导出视频。
6. 预览、试听，点击「开始渲染视频」，完成后下载并检查 MP4。

视觉升级示例位于 `input/visual-upgrade.json`，也可在 JSON 页签显式载入。保存新稿会替换当前源剧本，建议先备份。

### 时间轴与字幕如何工作？

- 真实音频按 `ceil(秒数 × fps)` 覆盖帧，再加幕尾留白。留白用于阅读，不是同步精度保证。
- 分句模式每句单独合成并测时，句间留 3 帧，绑定动作从句首触发。
- 未绑定目标和比例节拍仍按近似时间安排。
- 静音模式、整幕字幕和长句字幕分页均为估算，**不是逐字语音对齐**。
- 字幕直接嵌入画面，暂不输出 SRT。分句合成可能改变语气连贯性，请实际试听。
- 分幕模式的目标时长只是写稿参考；master的总时长由beats.frames与尾帧固定，配音超段长报错，不自动变速或拉伸动作。

### 命令行

```bash
npm run build                 # 类型检查 + Vite 构建
npm test                      # 逻辑单测，不启动浏览器
npm run audio                 # 生成真实配音
npm run audio -- --silent     # 准备静音估算时间轴
npm run render                # 渲染完整视频
npm run render -- --smoke     # 前 15 帧、缩小尺寸的渲染检查
npm run video                 # 配音成功后渲染
```

冒烟渲染不能证明全部场景、字幕或音轨正确。浏览器与成片请手动验收。

### 工程结构

```text
web/                  Vite + React 编辑工作台
src/                  预览与成片共用的 Remotion 场景
shared/               剧本校验、类型与时间计算
server/               本地 API、模型适配和渲染编排
scripts/              配音与命令行入口
tests/                逻辑测试
input/                示例输入与剧本
public/audio/         生成的配音缓存（不提交）
out/                  MP4 输出（不提交）
script.json           当前源剧本
timeline.json         派生时间轴（不提交）
.env.example          模型配置示例，不含密钥
```

源剧本修改后，旧时间轴会失效，需要重新准备。当前任务状态仅存内存，重启不恢复；不要同时通过 CLI 和网页写同一个项目。

### 隐私、费用与内容审核

- 渲染在本机完成，剧本、音频缓存和成片保存在本地。
- AI 编排会把文章与制作要求发送到配置的模型服务；TTS 会发送旁白文本，因此不是完全离线工具。
- 模型调用可能收费；取消本地等待不保证提供商停止处理或计费。
- 当前文章原文与待审稿不主动持久化，离开页面前请自行保存。
- 发布前核对事实、素材授权、字体与语音服务条款。不要仅凭模型输出或构建通过判断内容正确。

### 创作经验

[视频创作经验手册](./项目经验手册.md) 只记录选题、剧本、分镜、视觉表达、旁白、节奏与成片检查方法，不混入工程维护记录。

---

## English

### Agent discovery and MCP

Agents evaluating the project can read [llms.txt](./llms.txt), [llms-full.txt](./llms-full.txt), and the [Agent workflow](./docs/agent-guide.md). These documents help discovery and understanding but do not guarantee search indexing. Coding agents should also read [AGENTS.md](./AGENTS.md).

A local **stdio MCP server** exposes read-only validation and project queries by default. Explicit permission switches enable saving, model generation, TTS, and rendering through the existing local API. License authorization and user consent are still required. See the [MCP integration guide](./docs/mcp.md) for client setup, tools, resources, and security boundaries.

### What is Shenying?

**Shenying is a local-first workspace for creating narrated educational and technical explainer videos.** Turn an article into a structured storyboard, review and edit it in a web interface, synthesize narration, and render an MP4 with Remotion.

It is designed for concept explanations, code walkthroughs, process demonstrations, knowledge summaries, and comparisons. It is not a general-purpose timeline editor or a review-free, one-click video generator.

```text
Article / Markdown → AI storyboard → Human review → Visual editor
         → Narration and timing → Preview → Local MP4 rendering
```

You can also edit examples or import storyboard JSON without configuring an LLM.

### Features

- **Article-to-storyboard:** Markdown/TXT, audience/style/format/instructions, with scene-based explainers or fixed-duration master films (30–120s generation). Review before applying.
- **Visual editing:** scene content/narration or master paragraphs, actors, keys, camera and SFX. The editor scrolls independently (80vh, capped at 960px) with a sticky header; validated JSON remains available.
- **Six scene types:** title, bullet list, code walkthrough, side-by-side comparison, process flow, and simulated terminal.
- **Motion controls:** glow/grid/plain backgrounds, spring or gentle entrances, progressive or full presentation, and custom proportional beats.
- **Code focus:** lightweight lexical coloring, line numbers, active-line focus, scrolling, and explanatory captions.
- **Narration:** online Edge TTS, content-addressed audio caching, measured audio durations, and an explicitly silent timing mode.
- **Sentence-based narration:** synthesize sentences separately, bind visual targets to sentence starts, and display burned-in captions.
- **Preview and export:** jump to scenes, inspect task logs and rendering progress, and export 1080p / 30 fps / H.264 MP4.

**Terminal scenes simulate commands visually. They do not execute commands.**

### Mixed canvas

CanvasSlide combines code, bullet lists, callouts, verified statistics, and simple node diagrams within one scene. Nested GroupBlock containers support constrained split/grid/stacked layouts, with whole-block narration-triggered reveals and focus. The initial editor uses validated layout JSON, not drag-and-drop or arbitrary coordinates. See [canvas guide](./docs/canvas.md) and [example](./input/canvas-example.json). Supported additions include code-line focus, bounded percentage free layout, local hash-addressed ImageBlock annotations, mechanism snapshots, continuous MotionScene tracks and master global actors. No remote assets, automatic screenshots or collision-free layout. See the complete [documentation index](./docs/README.md).

### Status and limitations

This is an actively developed **single-project MVP**. The basic narration/render/download/playback workflow has been manually confirmed by the user. Recent visual, article-generation, and sentence-caption changes still require build, test, and end-to-end verification on the current version.

Not implemented: automatic screenshot/OCR annotation, automatic collision avoidance, arbitrary scripts/plugins, multiple projects, persistent task queues, batch production, word-level alignment, SRT export, BGM/ducking and overlapping transitions. Master supports optional per-beat Edge TTS (must fit the fixed beat; no automatic retiming), synthesised cues muted by default, real bounded springs, icons/doodles and CSS 3D/parallax. See [master workflow](./docs/master-composition.md).

Task state lives in memory and does not survive a server restart. Avoid simultaneous CLI and web writes to the same project. Long text and code require manual layout review.

### Requirements and quick start

Use Node.js 22 and a supported Python version, preferably 3.10 or later. Initial rendering may download Chrome Headless Shell. Real narration and AI storyboarding require network services.

Run from the project root:

```bash
npm install
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
npm run dev
```

Visit **http://127.0.0.1:5173**. The API runs on port 3001. To serve a built interface, run `npm run build` followed by `npm start`, then visit **http://127.0.0.1:3001**.

The current default interpreter path is `.venv/bin/python` (macOS/Linux). On Windows, set `PYTHON` to the actual interpreter path. Recreate the virtual environment if moving the project breaks its paths. Services bind to localhost; do not expose them directly to the internet.

### Optional LLM configuration

Copy `.env.example` to `.env` and configure:

```dotenv
LLM_BASE_URL=https://your-provider.example/v1
LLM_MODEL=your-model-name
LLM_API_KEY=your-api-key
```

The adapter expects an **OpenAI-compatible Chat Completions API**. Do not include `/chat/completions` in the base URL. Remote endpoints must use HTTPS; local endpoints may use HTTP. Restart the server after configuration changes.

Keep keys on the server. **Never prefix secrets with `VITE_`, and never commit `.env`.**

### Workflow

1. Edit an example, import JSON, or generate a storyboard from an article.
2. Review facts, code, narration, and visual parameters.
3. Apply the draft to the editor and save explicitly.
4. Optionally split narration into sentences and assign one-based visual targets.
5. Generate narration or prepare a silent timing preview.
6. Preview, listen, render, download, and inspect the final MP4.

The visual-upgrade example is available at `input/visual-upgrade.json` and through the JSON editor. Back up the current storyboard before replacing it.

### Timing and captions

Measured audio durations are rounded up to frames, with configurable scene-end padding. Sentence mode synthesizes each sentence independently, adds a three-frame gap, and triggers bound visuals at sentence starts.

Silent timing, whole-scene caption timing, proportional beats, and pagination within long sentences are approximate. **This is not word-level alignment.** Captions are burned into the video; no SRT export is provided. Sentence synthesis can affect prosody, so always listen to the result. Requested duration is approximate for scene-based drafts. Master uses fixed beat frames; narration starts at each beat and is rejected if it exceeds that beat, with no automatic retiming.

### Commands

```bash
npm run build                 # Type check and build the web UI
npm test                      # Logic tests; no browser automation
npm run audio                 # Generate real narration
npm run audio -- --silent     # Prepare estimated silent timing
npm run render                # Render the complete video
npm run render -- --smoke     # Render the first 15 frames at reduced scale
npm run video                 # Narrate, then render
```

A smoke render does not validate every scene or the complete audio track. Review browser behavior and the final video manually.

### Data and privacy

- `script.json` is the editable source; `timeline.json` is derived timing data invalidated by source changes.
- Audio is cached under `public/audio/`; videos are written to `out/`. Generated files and secrets are excluded from version control by default.
- Rendering happens locally. Article generation sends the article and instructions to your configured model provider; TTS sends narration to its speech service. This is **not fully offline**.
- Provider requests may incur charges. Canceling a local request does not guarantee cancellation or a refund from the provider.
- Article input and un-applied generated drafts are not automatically persisted. Save them before leaving the page.
- Verify factual accuracy, material rights, and applicable font, speech-service, and Remotion licensing terms before publishing or commercial use.

Creation guidance is maintained separately in the Chinese [Video Creation Handbook](./项目经验手册.md).

## 状态与关系演示（首版）

MechanismBlock按旁白分句切换固定实体的完整状态与关系快照，不再只做卡片先后入场。先规划理解目标、主体、初始状态、变化与结论；资料无变化时不强制动画。Schema/运行时共享shared/mechanism.ts，跨字段校验句号与target；MCP schema/renderer资源自动包含新契约，未增加权限或外部请求。编辑入口为画布JSON，组合说明展示步骤，网页提供非阻断编排提示。示例input/mechanism-example.json覆盖Rust Move/Borrow与教学订单；并非保证任意话题自动好看。详见[状态演示说明](./docs/mechanisms.md)。

## JSON创作与增量渲染

新增CanvasSlide.props.cues支持按句显隐、局部item强调、根布局切换、focus临时全宽与恢复；MechanismBlock支持visible、预设slot移动、container归属标签及关系emphasis。全部为完整快照与受约束参数，不是自由CSS或任意动画。Agent只改JSON，现有API/MCP权限、确认与任务锁不变；没有新增内置聊天界面。正式/草稿渲染按分镜复用视觉缓存，变化幕重绘，连续音轨及完整容器重新合成；不是任意帧或区域级重渲染。保存变更后仍需重新准备时间轴。示例input/creative-example.json；准确字段和不支持项见[JSON创作说明](./docs/json-creation.md)，不得承诺任意创作。

## 自由布局、线条与图表动画更新

现支持layout=free与百分比placements自由错落位置/尺寸/层级；connectors提供实/虚/点线、无/单/双箭头、直线/折线/曲线及draw/flow/pulse。BarChart支持grow/sequence，Timeline与Tree支持sequence，均以有效旁白句首与帧进度驱动。其他图表默认静态，不支持所有动态图表或真实流式数据。shared/extensions.ts为内置分类能力目录，不是运行时动态插件加载器，不允许JSON执行代码。旧文“全部静态/不支持自由布局”以本节及准确Schema为准。示例input/free-canvas-example.json；详见[自由布局与连线说明](./docs/free-layout-connections.md)。


## 竖屏与高级讲解表达

参阅 [docs/short-video-presentation.md](docs/short-video-presentation.md)：真正横竖屏、主题/章节/来源、RichTextBlock、受控本地ImageBlock、CycleBlock、TransferContainerBlock、BalanceScaleBlock，以及StatBlock.counter、BarChartBlock.countUp和TimelineBlock.milestones。旧版“仅固定数字、无图片/容器转移”等限制由本节限定能力替代；不支持任意CSS/JS、远程素材或自动数据真实性验证。生成与MCP使用同一Schema/能力契约，无新增素材写入MCP权限。草稿横屏960×540、竖屏540×960；每次实际使用需确认素材授权和人工检查裁切。


## 连续过程动画能力
生成和渲染现已支持受约束的 MotionSceneBlock 连续关键帧。详见 [docs/continuous-motion.md](docs/continuous-motion.md) 及 `input/continuous-motion-example.json`。该能力使用句内比例关键帧、确定性平滑插值和移动连线，不是任意代码执行或实时仿真；正文生成规则也已更新。


视觉主题目录：[docs/themes.md](docs/themes.md)。theme.palette支持blue/editorial/light/vivid/ocean/sunrise/botanical/candy/neon/blueprint/handbook，生成提示直接复用shared/themes.ts；新主题开放舞台与深浅色语义适配，非任意CSS样式或所有旧组件完整换肤。
