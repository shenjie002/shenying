# MCP 接入

申映提供官方 TypeScript SDK 实现的本地 **stdio MCP server**，不是 HTTP MCP endpoint。无需为 MCP 开端口；项目读写工具通过固定的 `http://127.0.0.1:3001/api` 复用本地 API 及任务锁。

## 安装与启动

使用前须按 LICENSE 获得授权。在项目目录执行 `npm install`。需要 API 的工具使用前，另开终端运行 `npm run dev`（开发）或 `npm run build && npm start`（构建后）。配音还需要 README 中的 Python 环境；模型配置由 API 读取，MCP 不读取密钥。

在支持 MCP 的客户端配置如下。**将路径替换为自己的绝对路径**；直接调用本地 tsx，避免 npm 启动日志污染 stdio 协议输出。

```json
{
  "mcpServers": {
    "shenying": {
      "command": "node",
      "args": ["/absolute/path/shenying/node_modules/tsx/dist/cli.mjs", "/absolute/path/shenying/server/mcp-stdio.ts"],
      "env": {
        "SHENYING_MCP_ALLOW_WRITES": "0",
        "SHENYING_MCP_ALLOW_EXTERNAL": "0",
        "SHENYING_MCP_ALLOW_RENDER": "0"
      }
    }
  }
}
```

具体配置文件位置取决于客户端。`npm run mcp` 可用于终端手动启动；它启动后等待 JSON-RPC 消息，并不是交互式命令行。stdio 通道只能输出协议内容，调试信息应写 stderr。

## 权限

默认三个开关全关闭。只接受值 `1` 为启用；修改后重启 MCP 进程。

| 开关 | 效果 |
| --- | --- |
| SHENYING_MCP_ALLOW_WRITES=1 | 提供覆盖保存及静音时间轴工具 |
| SHENYING_MCP_ALLOW_EXTERNAL=1 | 提供调用外部模型生成待审剧本的工具；与 WRITES 同时开启才提供 TTS |
| SHENYING_MCP_ALLOW_RENDER=1 | 提供渲染工具；该权限自身允许写入视频，不依赖 WRITES，并可能首次下载浏览器 |

这些是功能边界，不是客户端审批系统或许可证授权。先在 Agent 客户端设置工具确认策略；文本外发、覆盖、渲染必须取得用户确认。拥有本机进程执行权限的客户端仍可绕过 MCP，因此这不是对恶意本机程序的隔离沙箱。

## Tools

| 名称 | 作用 | 依赖 |
| --- | --- | --- |
| get_project | 当前剧本、有效时间轴、任务 | API |
| get_job | 当前/最近任务、日志、进度 | API |
| get_capabilities | 当前权限及模型配置状态，不返回密钥 | API |
| validate_script | 结构及跨字段校验，不写入 | 无 API |
| preview_timeline | 静音估算，不写入 | 无 API |
| save_script | 覆盖当前剧本，变更会使时间轴失效 | API + WRITES |
| prepare_silent | 启动静音时间轴任务 | API + WRITES |
| generate_storyboard | 向配置的模型发送文章，返回待审稿，不保存 | API + EXTERNAL |
| prepare_tts | 文本发送 Edge TTS，写音频及时间轴 | API + WRITES + EXTERNAL |
| render_draft | 全片960×540/30fps低清草稿，与正式渲染复用任务锁 | API + RENDER |
| render_video | 基于有效时间轴生成 MP4 | API + RENDER |

剧本参数使用 `script` 对象。实际 JSON Schema 可读 `shenying://schema`；再调用 validate_script 检查跨字段规则。generate_storyboard 参数遵循 shared/article.ts：article、audience、style、duration、sceneCount，以及mode=scenes|master（默认scenes）、format=landscape|portrait、instructions（≤2000字符）、soundEffects（默认false，仅master）。master支持30～120秒固定时长、忽略sceneCount，用专用提示生成完整全局轨道；校验输出模式/精确帧数/画幅/音效开关，不符合则拒绝，不静默转模式。

配音、静音和渲染返回 `{job: ...}` 后用 get_job 轮询到 done/error，不要把已入队当成完成。当前只保留最近一次任务，API 重启会丢失状态。HTTP 409 表示正在执行其他任务；工具错误通过 MCP `isError` 返回。请求超时不保证后台任务或外部模型调用被取消。生成文章的客户端应允许至少 190 秒工具超时。

视频路径 `/out/name.mp4` 可通过 `http://127.0.0.1:3001/out/name.mp4` 在本机访问。MCP 不传输视频二进制，也不提供任意路径读取。

渲染权限开启后同时提供render_video和render_draft，草稿同样会写视频并可能下载浏览器，需用户确认。默认不会自动重试或改源码。句首关键词、voice与camera/parallax参数由同一shenying://schema和renderer资源提供，细节见docs/audio-motion-reliability.md。

## Resources 与 Prompt

- `shenying://overview`：项目概览与文档索引。
- `shenying://guide`：Agent 制作流程与安全约束。
- `shenying://license`：授权条款。
- `shenying://renderer`：真实模板动作、图表和语义图标白名单、内容选型规则、背景/入场/整块聚焦风格（shared/style.ts，docs/visual-style.md）、target 映射、时序规则与限制；生成前必读，与文章生成提示共用 shared/capabilities.ts、shared/canvas.ts 与 shared/director.ts。新图表默认静态，BarChart/Timeline/Tree及StatBlock可通过契约内motion/milestones/countUp/counter执行受控内部动作；target仍只控制整块入场/聚焦，指标和关系需有资料依据，详见 docs/visualizations.md。
- `shenying://schema`：剧本 JSON Schema。
- `shenying://example`：示例剧本。
- Prompt `article_to_video`：输入 article，生成审稿优先的制作工作流指引，不自动外发或运行任务。

## 单根全局画布与合成音效

`shenying://schema` 与 renderer 已包含独立master（scenes:[]）、物理spring受限参数、白名单动态图标/进度环/手绘装饰、master.sfx绝对帧合成音效。validate_script/preview_timeline可直接校验/预览，保存及无配音准备/渲染继续通过现有API任务锁；未增加权限、素材写入工具或外部请求。master可用prepare_tts按beat逐段合成配音（每段一句、段首播放，超段长报错，绝对帧不随配音自适应）；prepare_silent意为无配音，可保留bloop/whoosh/tick/chime（需master.sfxMuted:false，默认静音）。文章生成可显式mode=master请求连续短片，mode=scenes保持分幕。Web提供段落/对象/时间点/镜头/音效表单和JSON编辑、预览与正常任务导出；不是拖拽时间线，也不自动避障。见[master-composition.md](./master-composition.md)及`input/master-motion-sound-30s.json`。

## 文档导航与编辑器

[docs/README.md](./README.md)汇总全部能力、三种模式差别及维护边界；[项目说明](../README.md)提供安装和本地模型配置。网页分镜编排区最大80vh/960px、内部滚动且标题固定，不影响旁边预览。浏览器验证使用模拟API，不调用真实模型/TTS，默认不写截图；一次性日志/脚本/抽帧用后清理，不删除用户稿件、正式视频或缓存。

## Agent 搜索与发现

仓库根目录有 llms.txt 与 llms-full.txt；README 链接这些说明。它们方便能够访问 GitHub 的 Agent 了解项目，**不是搜索收录保证**。仓库本身没有部署公开网站，也没有注册公共 MCP 目录；如后续部署官网，可在网站根路径发布同样的文件。不要为方便发现而将本地 API 直接公开。

## 代码与机制同句联动

CanvasSlide的CodeBlock可选props.focus=[{sentence,line}]，在指定旁白句首聚焦真实代码行，可与MechanismBlock.steps.sentence同步。target仍表示整块，不增加工具、权限或外部请求；validate_script与网页导入共用shared/schema.ts的句号/行号/首次入场校验。旧无focus代码块不变。例子input/code-mechanism-example.json，限制见docs/mechanisms.md。

## 状态与关系演示（首版）

MechanismBlock按旁白分句切换固定实体的完整状态与关系快照，不再只做卡片先后入场。先规划理解目标、主体、初始状态、变化与结论；资料无变化时不强制动画。Schema/运行时共享shared/mechanism.ts，跨字段校验句号与target；MCP schema/renderer资源自动包含新契约，未增加权限或外部请求。编辑入口为画布JSON，组合说明展示步骤，网页提供非阻断编排提示。示例input/mechanism-example.json覆盖Rust Move/Borrow与教学订单；并非保证任意话题自动好看。详见[状态演示说明](./mechanisms.md)。

## JSON创作与增量渲染

新增CanvasSlide.props.cues支持按句显隐、局部item强调、根布局切换、focus临时全宽与恢复；MechanismBlock支持visible、预设slot移动、container归属标签及关系emphasis。全部为完整快照与受约束参数，不是自由CSS或任意动画。Agent只改JSON，现有API/MCP权限、确认与任务锁不变；没有新增内置聊天界面。正式/草稿渲染按分镜复用视觉缓存，变化幕重绘，连续音轨及完整容器重新合成；不是任意帧或区域级重渲染。保存变更后仍需重新准备时间轴。示例input/creative-example.json；准确字段和不支持项见[JSON创作说明](./json-creation.md)，不得承诺任意创作。

## 自由布局、线条与图表动画更新

现支持layout=free与百分比placements自由错落位置/尺寸/层级；connectors提供实/虚/点线、无/单/双箭头、直线/折线/曲线及draw/flow/pulse。BarChart支持grow/sequence，Timeline与Tree支持sequence，均以有效旁白句首与帧进度驱动。其他图表默认静态，不支持所有动态图表或真实流式数据。shared/extensions.ts为内置分类能力目录，不是运行时动态插件加载器，不允许JSON执行代码。旧文“全部静态/不支持自由布局”以本节及准确Schema为准。示例input/free-canvas-example.json；详见[自由布局与连线说明](./free-layout-connections.md)。


## 竖屏与高级讲解表达

参阅 [short-video-presentation.md](short-video-presentation.md)：真正横竖屏、主题/章节/来源、RichTextBlock、受控本地ImageBlock、CycleBlock、TransferContainerBlock、BalanceScaleBlock，以及StatBlock.counter、BarChartBlock.countUp和TimelineBlock.milestones。旧版“仅固定数字、无图片/容器转移”等限制由本节限定能力替代；不支持任意CSS/JS、远程素材或自动数据真实性验证。生成与MCP使用同一Schema/能力契约，无新增素材写入MCP权限。草稿横屏960×540、竖屏540×960；每次实际使用需确认素材授权和人工检查裁切。


## 渲染性能

静音不渲染整片音轨、并发自动（SHENYING_CONCURRENCY 可覆盖）、缓存指纹不含服务器编排代码；详见[渲染性能](./render-performance.md)。草稿任务更快完成，不改变输出内容与权限。

## 通用运动增强

对象弹簧easing、visual.ambient星尘/光晕、MotionScene组级stagger、panel玻璃卡与badge/icon、自动focus降噪已实现，字段与边界见[motion-effects.md](./motion-effects.md)。focus只做视觉主次（降透明度/模糊），不是真实景深；badge/icon不得伪造来源或认证。只在JSON显式选择时启用；动画none冻结氛围并取消错峰入场位移。组级错峰仅适用于连续舞台对象，不是旧列表的递归动画；无碰撞物理。示例`input/motion-effects-study.json`。

## 连续过程动画能力
导演规则已加强动态文字的主次与注意力交接：鼓励少量大字、旧重点缩成锚点或退出、新重点接力和阅读停顿，不默认等大卡片常驻；单个全宽MotionSceneBlock可承载完整构图。仅使用既有Schema，未新增字体、渐变材质、遮罩或跨幕形变能力。示例`input/agent-boundary-20s-study.json`仅依据文案提炼，静音估算，不代表事实核实或AI自动生成质量已验收。
生成和渲染现已支持受约束的 MotionSceneBlock 连续关键帧。详见 [continuous-motion.md](continuous-motion.md) 及 `input/continuous-motion-example.json`。该能力使用句内比例关键帧、确定性平滑插值和移动连线，不是任意代码执行或实时仿真；正文生成规则也已更新。


配色补充：theme.palette=vivid为紫/青/橙多彩浅色舞台，连续过程块移除外层卡片框，背景装饰仍是确定性帧驱动；MotionScene对象tone增加teal/rose用于语义区分，不代表事实好坏。resource.progress控制内部内容条逐段显露。示例input/rust-motion-typography.json，旧主题兼容。


视觉主题目录：[themes.md](themes.md)。theme.palette支持blue/editorial/light/vivid/ocean/sunrise/botanical/candy/neon/blueprint/handbook，生成提示直接复用shared/themes.ts；新主题开放舞台与深浅色语义适配，非任意CSS样式或所有旧组件完整换肤。


运动设计补充：MotionScene关键帧支持fontSize(16～60)、fontWeight(400～900)、emphasis(0～1，默认1，正文色→tone色渐变)、jitter(0～3，短时帧驱动微抖)、easing(smooth/linear/settle)。可选camera轨道{sentence,at,x,y,zoom}，zoom=1～2.4，x/y=10～90；仅内部舞台推拉平移，不是整幕转场。字号和字重变化不保证任意系统字体都有连续字重，需人工查裁切；静止模式冻结插值/抖动，保留时刻状态切换。避免持续抖动、频闪和所有元素同时强调。示例input/rust-motion-typography.json。
