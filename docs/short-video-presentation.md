# 竖屏讲解、素材与高级表达

这是内置、受约束 JSON 能力，不是任意 CSS/JS 插件系统。创作无需修改 React 源码。完整字段及上限以 `shared/presentation.ts`、`shared/advanced.ts` 和 `shared/canvas.ts` 为准，生成与 MCP 复用同一能力契约。

## 舞台与文字

顶层 `format: "portrait"` 输出1080×1920，默认横屏1920×1080；草稿分别540×960/960×540。网页可选择方向。切换方向不会自动改写多列内容，应调整布局或拆幕，尤其代码/关系图需要人工检查。

`theme.cinema:true`为成片取向：隐藏品牌、页脚、页码、章节进度条、画布大标题与舞台说明，画面近似满幅；默认false保留幻灯片式框架。适合短视频，但来源/事实标注仍建议保留在片尾或说明区。

`theme: {palette:"editorial",brand:"申映",footer:"把知识讲清楚",chapters:true}`。palette支持blue/editorial/light/vivid/ocean/sunrise/botanical/candy/neon/blueprint/handbook，目录与tokens以shared/themes.ts为准；统一画布卡片与富文本强调色，背景仍遵循visual.background的帧驱动装饰；不保证所有旧图表和代码窗口完全换肤。每幕可设置chapter、source。进度条一幕一段，不是自动语义章节合并。

RichTextBlock含align、size和segments。片段支持text、tone、breakBefore及sentence；sentence为旁白从1开始的句号，不是词级时间戳。保留未显露文字的占位。CycleBlock支持rotate/pulse和cycle/gear/activity图形，属于概念示意，不代表程序执行。

示例：`input/portrait-editorial-example.json`。

## 图片证据

显式导入用户有权使用的本地素材：

```sh
npx tsx scripts/import-image.ts /绝对路径/图片.png
```

仅接收20MB以内PNG/JPEG/WebP；FFmpeg标准化到最多2400×2400 PNG、移除元数据及动画，输出内容哈希路径。无网络下载、不修改剧本。导入动作由用户或经确认的Agent执行，MCP没有独立素材写入工具。`public/images/`已忽略，不提交用户素材。

ImageBlock.props={src,fit:"contain",caption?,source?,highlight?:{x,y,width,height}}。src必须为images/64位小写哈希.png|jpg|webp，不接受远程地址、SVG、任意路径或代码。百分比标注相对于显示区域；contain有留白时不是原图坐标。来源只是声明，不表示系统已核实。

正式/草稿增量渲染检查素材实际路径和内容哈希；修改素材需重新导入，不允许原路径替换内容。缺图或哈希不匹配应报错而不是复用旧缓存。素材目录是本地信任边界，不应允许不可信进程并发修改。无自动OCR、自动框选、截图浏览器或网页抓取。

## 卡片归属转移

TransferContainerBlock.props包含containers:[{id,label}]、cards:[{id,label}]、steps:[{sentence,assignments:[{card,container}]}]及durationFrames。每步完整覆盖所有卡片。2～3容器、最多6卡片，身份稳定；归属按句首变化、位置平滑插值。首步必须为该块首次target句，后续步骤也绑定该块。卡片按固定顺序自动排列，不支持任意坐标、复制、嵌套物理容器或路径避障；路径可能交叉，应减少同时转移。

## 定性天平

BalanceScaleBlock.props={leftLabel,rightLabel,steps:[{sentence,tilt:"left"|"center"|"right"}],durationFrames}。首步和后续句号绑定该块target。阻尼动画是视觉示意，不是物理仿真或定量测量。只有资料明确描述权衡倾向时才用；普通差异用CompareBlock，不由AI判胜负。

## 数字与节点

StatBlock可选counter={sentence,from,to,decimals,unit,kind:"reveal"|"change",durationFrames}。value须等于to.toFixed(decimals)+unit。reveal只能从0显露最终值；change需原文同时提供起终点和单位，校验器无法证明资料真实性，需要编辑审核。BarChartBlock可选countUp:true，必须搭配motion.mode=grow，数字跟随显露比例，不代表真实时间序列。

TimelineBlock可选milestones:[{sentence,event}]，event从1开始，支持回看，sentence严格递增。当前节点强调、此前完成、之后待开始，仅展开当前详情；不与motion混用。不编造时间和因果。

所有动作确定性帧驱动，animation=none冻结插值但保留句首状态切换。完整示例：`input/advanced-explainer-example.json`。

## 验收与边界

单元测试、构建、短片渲染不等于真实文章创作或完整配音听感通过。需在冻结引擎后验证自然语言修改只改JSON。仍无自动布局避障、任意路径、通用数据变形、真正动态插件或内置聊天。


配色补充：theme.palette=vivid为紫/青/橙多彩浅色舞台，连续过程块移除外层卡片框，背景装饰仍是确定性帧驱动；MotionScene对象tone增加teal/rose用于语义区分，不代表事实好坏。resource.progress控制内部内容条逐段显露。示例input/rust-motion-typography.json，旧主题兼容。


视觉主题目录：[themes.md](themes.md)。theme.palette支持blue/editorial/light/vivid/ocean/sunrise/botanical/candy/neon/blueprint/handbook，生成提示直接复用shared/themes.ts；新主题开放舞台与深浅色语义适配，非任意CSS样式或所有旧组件完整换肤。
