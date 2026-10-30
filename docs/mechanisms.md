# 状态与关系演示

目标是解释变化，不是增加装饰。当前新增CanvasSlide的MechanismBlock，Schema与时间选择权威定义为shared/mechanism.ts。完整可导入例子为input/mechanism-example.json：Rust Move、Borrow及明确标为教学假设的订单流程共用同一组件，没有Rust专用分支。

## 创作顺序

AI在内部先明确：本幕理解目标 → 视觉主体 → 初始状态 → 关键变化 → 结束结论，再输出已有Schema的JSON。不要输出自创plan/actions字段。文章明确描述状态或关系变化时可选择机制块；观点、长文、数值比较仍用现有文字/代码/图表模板。没有材料支持的过程不能自行补齐。

## 数据契约

MechanismBlock的props为：

- heading：最多32字。
- entities：2～4个{id,label}，ID唯一，label最多32字，身份与上下位置全程固定。
- steps：2～6个完整快照；每步含sentence、caption、states、relations。
- sentence：所在幕narration从1开始的句号，严格递增。第一步必须在首次target该块的句子触发；每步对应句子的target都必须指向此块。
- states：每步必须为每个实体提供且仅提供一个{entity,text,tone}；text最多32字，tone为neutral/active/muted/warning。语义由资料决定，颜色不自动判定真假对错。
- relations：每步完整关系集合，最多4个{from,to,label,kind}；label最多16字；kind=solid/dashed仅线型，没有预设所有权含义。引用已定义实体，不能自连或重复同方向关系。没有关系写[]。
- caption：最多100字，显示在块底部，解释本步；与narration.caption不同。

实体身份始终存在；现支持visible显隐与slot预设位置移动，不支持任意路径或运行时创建身份。状态和关系变化采用12帧淡化过渡（animation=none即时切换），不是对象移动或代码执行模拟。实测分句时间轴或静音估算驱动同一选择器，不使用墙钟或CSS定时。pace=all只取消整块等待，不取消内部步骤。非步骤句保留最近状态。

## 编辑与验收

建议用一个MechanismBlock作为画布全宽主体，不是每幕左代码右提示。可在画布JSON中编辑，应用时校验句号/target；网页组合说明会列出每步绑定。全剧本JSON导入与保存、MCP validate_script均执行同一跨字段校验。

网页编排提示会提醒连续3幕split-2-1、块过多、机制块挤进分栏；只是提示，不强迫为了变化换布局。

测试重点：同一资源身份是否保持；前后关系是否符合文章；字幕、长状态文字、线标签是否可读；静音与真实配音句首是否匹配。静态截图和构建通过不代表完成全片验收，模型输出仍须审阅。四实体/四关系密集图仍可能重叠，优先简化或拆幕。

## 代码与机制同句联动

CodeBlock可选`props.focus:[{sentence,line}]`：sentence是本幕旁白句号，严格递增；line为真实代码行号，含空行，允许回看。每步必须引用有有效target的旁白，且不得早于代码块首次target句。target仍只选择整块；同一句可target机制块，同时更新代码focus与机制steps.sentence。两个块都必须至少被target一次。

推荐短代码用grid等宽左代码右机制，focus用normal避免暗化正在对照的代码；pace=all保留行聚焦和机制步骤。聚焦窗口最多8行，跟随当前行，无逐字打字；长行不换行，应缩短摘录或拆幕。未提供focus的旧代码块保持静态。示例：`input/code-mechanism-example.json`。复杂机制可用相邻分镜“代码→全宽机制→代码”，没有无缝变形能力。

## 当前边界

这是通用机制演示的第一版，不是任意话题自动生成专业动画的保证。MechanismBlock自身不提供任意相机路径、图内自由坐标、追线、数据计算、代码运行、分支执行引擎、图片或自动视觉评分。其他画布能力另见[连续过程](./continuous-motion.md)、[自由布局](./free-layout-connections.md)及[本地图片](./short-video-presentation.md)，不要混用不同块字段。Rust与订单例子验证相同数据模型可复用，不证明所有话题或模型都能正确选型。系统保证结构/引用/时序约束，事实、可读性和讲解效果仍需人工验收；不适合机制演示的文章应降级为清晰排版，不编造动画。

更新：states.visible/slot/container与relations.emphasis及归属标签详见docs/json-creation.md；“位置固定”指旧稿默认行为，不再代表所有配置都禁止移动。
