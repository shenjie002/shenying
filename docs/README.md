# 文档与当前能力索引

本文汇总各会话已落地的功能。Schema/实际渲染为权威，专题中的示例和历史测试不能代替当前成片验收。公开源码不代表开源或使用许可；使用前须按[LICENSE](../LICENSE)取得事先明确书面授权。

## 先选创作模式

| 模式 | 时间与用途 | 编辑/音频 | 说明 |
| --- | --- | --- | --- |
| 分幕 scenes | 六种全屏模板或CanvasSlide混合画布；分句TTS按实测时长驱动 | 分幕表单、画布布局JSON；支持整幕/分句配音 | [Agent流程](./agent-guide.md)、[画布](./canvas.md) |
| 幕内连续 MotionSceneBlock | 作为Canvas叶块，句号+句内比例关键帧；对象与连线在幕内连续变化 | 画布JSON；配音改变句长，动作按比例变化；不跨幕延续身份 | [连续过程](./continuous-motion.md)、[运动增强](./motion-effects.md) |
| 全局画布 master | 与非空scenes互斥；演员身份跨段延续，绝对帧；AI生成请求支持30～120秒 | 字幕/段长/对象/动作/镜头/音效表单与JSON；可每beat一句TTS、段首播放，超段长报错，不自动改动作帧 | [全局画布](./master-composition.md) |

用户输入文章、画幅、时长和制作要求，由AI交付待审编排；不应每换题材定制React或要求用户手写绝对帧。API/MCP的mode默认scenes兼容旧客户端，网页默认连续短片。合成音效默认关闭；`master.sfxMuted`默认true，静音保留触发点，不影响配音。外部模型与Edge TTS分别需要用户确认；配置本地模型不等于配音完全离线。

## 能力专题

| 文档 | 当前能力及边界 |
| --- | --- |
| [真实渲染契约](./renderer-contract.md) | 生成/MCP共用能力，整块target与块内字段区分，不虚构actions或任意CSS/JS |
| [背景与注意力](./visual-style.md) | 七种背景、七种入场、整块dim/pulse；none/all仍有各自时序规则 |
| [主题](./themes.md) | 11套主题含handbook；cinema去母版，不是所有旧组件完全换肤 |
| [图表与图标](./visualizations.md) | 拓扑/矩阵/时间轴/柱图/树/白名单图标；grow/sequence、countUp/counter、milestones等受控内部动作；无任意数据形变 |
| [状态与关系](./mechanisms.md) | 稳定实体完整快照、状态/关系、代码行focus同句联动；不是代码执行 |
| [JSON创作协议](./json-creation.md) | cues显隐/局部强调/全宽聚焦与恢复、机制visible/slot/container；分镜缓存不是逐帧差分 |
| [自由布局与连线](./free-layout-connections.md) | 百分比矩形、跨块实/虚/点线、箭头/直折曲线与draw/flow/pulse；无自动避障或动态插件 |
| [竖屏与高级表达](./short-video-presentation.md) | 真横竖屏、RichText、本地哈希图片/静态标注、Cycle、容器归属转移、定性天平、数值与节点 |
| [连续过程](./continuous-motion.md) | 帧驱动对象/移动连线、动态文字/镜头；幕内轨道，不是真实时仿真 |
| [运动增强](./motion-effects.md) | 四档弹簧、环境呼吸、组级stagger、玻璃卡、badge/icon、reveal/float/capsule/glow和focus降噪 |
| [全局画布](./master-composition.md) | CSS透视/视差/动态投影、受限自定义物理弹簧、动态图标/进度环/手绘、合成音效与逐段配音；无真实光照/自动配音对时 |
| [音画与可靠性](./audio-motion-reliability.md) | 音色、句首关键词、标点分页字幕、配音/音效边界、草稿和失败诊断；无逐词对齐/BGM/ducking/自动改源码 |

图片仅允许用户有权使用且显式导入的本地PNG/JPEG/WebP，不支持远程URL/SVG/OCR或自动截图。统计与来源须有资料依据；图标、进度环和虚构测试夹具均不构成真实性/认证证据。

## 使用、集成与维护

- [安装及产品说明](../README.md)：本地启动、模型配置、正常网页创作/导出；编排区最大高度80vh且不超过960px，内部滚动、标题固定。
- [Agent流程](./agent-guide.md)：资料安全、审稿、校验、覆盖确认与任务顺序。
- [MCP](./mcp.md)：本地stdio、默认只读、原API任务锁及权限；无新素材写入通道。
- [渲染性能](./render-performance.md)：分幕视觉缓存、无音源跳过整片音轨、自动并发/GL开关；master整片重渲，历史实测不是性能保证。
- [当前进度](./current-progress.md)：最新工作区、待验收样稿与历史用户认可稿；只作交接，不作发布稳定性保证。
- [历史清理清单](./out-cleanup-inventory.md)：历史一次性删除及保留边界，不是定时清理策略。

临时脚本、日志、抽帧用后清理；可重复运行的验证脚本保留，默认不生成截图。正式视频、用户文章/JSON、音频/素材缓存和scene-cache不是临时垃圾，不能顺手删除。测试不得调用真实模型或`prepare(...,'tts')`；浏览器流程检查用模拟API，不覆盖当前项目。构建、单测、浏览器检查与完整音画人工验收应分别报告。
