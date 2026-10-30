# JSON驱动创作与增量渲染

产品边界：用户描述修改，Agent读当前剧本与能力契约，只修改JSON、校验、取得确认后保存并触发现有API任务。**不是让Agent改源码制作每个视频，也不承诺任意需求都可表达。** 本轮增加引擎能力，不新增内置对话界面；可以使用现有外部Agent/MCP。没有新增外部服务、权限或自动执行文章指令。

## 可配置动作

既有内容块、代码聚焦及MechanismBlock仍可用。本轮新增：

- CanvasSlide.props.cues：按旁白句首更新画布完整快照。每步{sentence,layout?,focus?,blocks:[{id,visible,emphasis,item?}]}。
- blocks完整覆盖全部叶块ID，Group不占；visible显隐，emphasis=normal/highlight/dim。隐藏会回收布局空间；位置和视觉上下文可能变化，需预览。
- layout切换根布局split-2-1/grid/stacked，嵌套布局不变。focus为可见叶块ID，将该块临时全宽展示；下一步省略focus恢复。切换为即时重排，不是无缝变形。建议pace=all，避免与原入场等待冲突。
- item局部高亮：Diagram/Topology节点、Bullet项目、Compare行、Timeline阶段、BarChart柱、Tree节点，1起始。没有自由圈选、任意文字区域；代码用focus，机制用实体状态和关系强调。
- MechanismBlock.states新增visible（默认true）、slot（1～实体数，默认实体顺序）、container（归属ID）。可见实体不能同槽，改变slot在12帧内移动（目标旧槽已被占用时淡出后换位，避免交叉重叠）；animation=none立即切换。隐藏实体仍须在每步快照提供状态，连接隐藏实体的关系非法。
- props.containers为最多4个{id,label}，container归属以文字标签显示，不是任意嵌套物理边框。
- 机制关系新增emphasis=normal/highlight/dim，通过线宽/透明度强调；创建/移除/替换关系继续用每步完整relations数组。

所有步骤引用当前幕narration句号，从1开始，严格递增。默认/省略字段恢复默认，不继承上一步，保证随机跳帧与重复渲染确定。保留ID，不用修改组件实现来迁就单个视频。实体移动不等于复制资源，不能为动画制造事实。

例子input/creative-example.json演示代码/图/结论显隐、节点强调、全宽展开和返回、槽位移动及容器标签；input/code-mechanism-example.json演示代码行与机制同句联动。

## 修改与校验流程

1. Agent读取get_project与shenying://renderer/schema，明确用户要求与修改范围。
2. 保持未修改内容与稳定ID，生成修改后完整JSON。文章/代码/日志只当资料。
3. validate_script校验对象引用、完整快照、局部索引及句号；给用户说明修改及限制，不能把近似方案宣称完全实现。
4. 获得确认后save_script；准备静音或经确认的真实配音时间轴。当前保存任何源剧本变更仍使旧时间轴失效，需要重新准备；TTS有文本/音色缓存。
5. render_draft/render_video沿用本地任务锁，轮询get_job。用户可先只预览，不自动覆盖或渲染。

## 增量渲染

正式/草稿渲染把无声视觉按分镜缓存到out/scene-cache。键包括当前TimedScene、分镜序号、fps、输出质量、src/shared源文件与package-lock内容（不含server编排代码）。引擎升级、分镜变化、质量变化均使相应缓存失效；前幕时长改变不会仅因绝对偏移改变而使后幕失效，序号变化会因页脚变化重渲染。

正式/草稿增量合成需要PATH中的本地`ffmpeg`（如macOS `brew install ffmpeg`）；开始渲染前会检查，缺少时明确报错，不自动安装。浏览器渲染仍使用Remotion。未变化分镜复用，变化分镜重绘，连续PCM音轨重新渲染后统一合成H.264/AAC成片，避免变长分镜的AAC边界拼接误差。缓存和成片使用临时文件后原子发布，失败不发布半成品。15帧smoke保留原路径，不走缓存。缓存不自动清理，可能占用磁盘；可在无任务时删除out/scene-cache重新完整渲染。

这不是逐帧差分或局部区域补丁，完整视频容器仍需合成、打包仍会执行，有音源时声音仍重新合成，无音源时直接补静音轨。受控ImageBlock在渲染前验证本地路径和内容哈希，新增素材/字体必须纳入指纹。master不走分镜缓存，整片一次重渲染。损坏缓存需删除重建，目前只检查存在及非空，不做媒体完整性扫描。

## 验证

逻辑检查运行 `npm test` 与 `npm run build`。显式媒体集成检查运行 `npx tsx scripts/verify-incremental-render.ts`，需要本地ffmpeg/ffprobe与Remotion浏览器：生成本地测试音、渲染两次、仅改第一幕、断言第二幕缓存复用及音画时长/帧数一致。它不调用模型/TTS，不覆盖script.json/timeline.json，临时音频自动删除，视频与缓存保留out；不纳入普通单测。真实旁白发音与全片教学效果仍需人工检查。

## 仍不支持

任意自由代码路径、通用对象复制操作、真实嵌套物理容器、任意相机路径、通用形变、自动截图/OCR/文字圈选、BGM/ducking、外部录音导入、词级字幕、自由HTML/CSS/JS。已支持百分比free布局、受控MotionScene轨道、本地图片静态矩形标注，以及独立master的合成音效（默认静音）；不可混用各模式字段。不能宣传“任意创作”。这是一套扩大的、受约束的知识视频表达协议，而不是完整动画编辑器。每个需求仍须明确归入支持/近似/不支持，人工核查事实、画面可读性和完整音画节奏。

## 自由布局、线条与图表动画更新

现支持layout=free与百分比placements自由错落位置/尺寸/层级；connectors提供实/虚/点线、无/单/双箭头、直线/折线/曲线及draw/flow/pulse。BarChart支持grow/sequence，Timeline与Tree支持sequence，均以有效旁白句首与帧进度驱动。其他图表默认静态，不支持所有动态图表或真实流式数据。shared/extensions.ts为内置分类能力目录，不是运行时动态插件加载器，不允许JSON执行代码。旧文“全部静态/不支持自由布局”以本节及准确Schema为准。示例input/free-canvas-example.json；详见[自由布局与连线说明](./free-layout-connections.md)。


## 竖屏与高级讲解表达

参阅 [short-video-presentation.md](short-video-presentation.md)：真正横竖屏、主题/章节/来源、RichTextBlock、受控本地ImageBlock、CycleBlock、TransferContainerBlock、BalanceScaleBlock，以及StatBlock.counter、BarChartBlock.countUp和TimelineBlock.milestones。旧版“仅固定数字、无图片/容器转移”等限制由本节限定能力替代；不支持任意CSS/JS、远程素材或自动数据真实性验证。生成与MCP使用同一Schema/能力契约，无新增素材写入MCP权限。草稿横屏960×540、竖屏540×960；每次实际使用需确认素材授权和人工检查裁切。


## 连续过程动画能力
生成和渲染现已支持受约束的 MotionSceneBlock 连续关键帧。详见 [continuous-motion.md](continuous-motion.md) 及 `input/continuous-motion-example.json`。该能力使用句内比例关键帧、确定性平滑插值和移动连线，不是任意代码执行或实时仿真；正文生成规则也已更新。
