# 申映 Shenying

### 把知识讲清楚，让文章变成视频。  
### Turn knowledge into clear, narrated explainer videos.

[中文](#中文说明) · [English](#english)

> **授权说明：本项目源码公开，但不是开源授权。除法律及 GitHub 平台条款允许的范围外，任何使用（包括个人、研究和商用）、复制、修改或分发，均须事先联系作者并取得明确书面授权。** 详见 [LICENSE](./LICENSE)。联系入口：[shenjie002](https://github.com/shenjie002)，也可通过本仓库 Issue 提交授权请求。下方安装与运行说明仅供已获授权的用户使用。
>
> **Permission required:** Public source does not mean open source. Except as permitted by law and GitHub's terms, any use (including personal, research, and commercial use), copying, modification, or distribution requires prior explicit written permission. See [LICENSE](./LICENSE). Contact [shenjie002](https://github.com/shenjie002) or open a permission-request issue. Setup instructions below are for authorized users only.

---

## 中文说明

### Agent 发现与 MCP

供搜索或评估本项目的 Agent 阅读：[llms.txt](./llms.txt) · [完整参考 llms-full.txt](./llms-full.txt) · [Agent 工作指南](./docs/agent-guide.md)。这些文件帮助理解项目，不保证被搜索引擎或 Agent 收录。开发 Agent 另见 [AGENTS.md](./AGENTS.md)。

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
| 文章生成剧本 | 粘贴或导入 Markdown/TXT；设置受众、风格、目标时长及分镜数量；生成后先审阅再应用 |
| 可视化编辑 | 编辑旁白与模板参数，添加、删除和调整分镜顺序，也支持 JSON 校验导入 |
| 六种场景 | 标题、要点列表、代码讲解、双栏对比、流程演示、终端模拟 |
| 视觉与节奏 | 光晕/网格/纯色背景，柔和弹簧或轻缓入场，分步或完整展示，自定义比例节拍 |
| 代码演示 | 轻量词法着色、行号、逐行聚焦、焦点滚动及解释侧栏 |
| 配音与时间轴 | Edge TTS 中文旁白、音频缓存、实际时长测量、静音估算时间轴 |
| 分句讲解 | 单句合成、句首绑定画面目标、随句字幕，可合并回整幕配音 |
| 预览与导出 | 分镜定位预览、任务日志、渲染进度，导出 1080p / 30fps / H.264 MP4 |

**终端演示只是视觉模拟，不会执行填写的命令。**

### 项目状态

这是正在开发的**单项目 MVP**。基础配音、渲染、下载和视频播放曾经用户手动验证；近期的六场景视觉升级、文章生成和分句字幕仍需对当前版本执行构建、测试及实际成片验收。本文列出的实现能力不等于所有组合均已验证稳定。

尚未实现：机制图、截图标注、多项目、持久化任务队列、批量制作、逐字字幕对齐、SRT 导出、背景音乐混音和场景间重叠转场。

### 环境要求

- Node.js 22，npm。
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
- 目标时长只是写稿参考，不保证最终视频严格等长。

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

- **Article-to-storyboard:** paste text or import Markdown/TXT; choose audience, style, approximate duration, and scene count. Review before applying.
- **Visual editing:** edit scene content and narration; add, remove, reorder, and switch scenes; validate JSON imports.
- **Six scene types:** title, bullet list, code walkthrough, side-by-side comparison, process flow, and simulated terminal.
- **Motion controls:** glow/grid/plain backgrounds, spring or gentle entrances, progressive or full presentation, and custom proportional beats.
- **Code focus:** lightweight lexical coloring, line numbers, active-line focus, scrolling, and explanatory captions.
- **Narration:** online Edge TTS, content-addressed audio caching, measured audio durations, and an explicitly silent timing mode.
- **Sentence-based narration:** synthesize sentences separately, bind visual targets to sentence starts, and display burned-in captions.
- **Preview and export:** jump to scenes, inspect task logs and rendering progress, and export 1080p / 30 fps / H.264 MP4.

**Terminal scenes simulate commands visually. They do not execute commands.**

### Status and limitations

This is an actively developed **single-project MVP**. The basic narration/render/download/playback workflow has been manually confirmed by the user. Recent visual, article-generation, and sentence-caption changes still require build, test, and end-to-end verification on the current version.

Not implemented yet: mechanism diagrams, screenshot annotations, multiple projects, persistent task queues, batch production, word-level alignment, SRT export, background-music mixing, and overlapping scene transitions.

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

Silent timing, whole-scene caption timing, proportional beats, and pagination within long sentences are approximate. **This is not word-level alignment.** Captions are burned into the video; no SRT export is provided. Sentence synthesis can affect prosody, so always listen to the result. Requested duration is a writing target, not a guaranteed runtime.

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
