/** Built-in extension catalog: installing executable plugins is a developer operation, not JSON input. */
export const visualExtensions = [
 {id:'motion.continuous',category:'mechanisms',version:1,fields:'MotionSceneBlock.objects/links',description:'句内比例关键帧、连续姿态轨道、重叠/接力、内部流转，非真实仿真'},
 {id:'explanation.transfer',category:'mechanisms',version:1,fields:'TransferContainerBlock/BalanceScaleBlock',description:'完整归属快照平滑转移、定性天平阻尼'},
 {id:'explanation.progress',category:'charts',version:1,fields:'StatBlock.counter/BarChartBlock.countUp/TimelineBlock.milestones',description:'受控数值显露或有依据起终点、时间轴当前状态'},
 {id:'presentation.text',category:'presentation',version:1,fields:'RichTextBlock',description:'富文本片段、语义色、大字与按句揭示'},
 {id:'presentation.media',category:'presentation',version:1,fields:'ImageBlock',description:'受控本地图片、说明、来源和静态区域框'},
 {id:'presentation.theme',category:'presentation',version:1,fields:'format/theme/chapter/source/CycleBlock',description:'横竖屏、统一主题、章节导航与局部循环'},
 {id:'layout.free',category:'layout',version:1,fields:'CanvasSlide.layout/placements',description:'百分比自由错落矩形、图层；cue切换'},
 {id:'connections.paths',category:'connections',version:1,fields:'CanvasSlide.connectors',description:'直线/折线/曲线、无/单/双箭头、实/虚/点线、绘制/流动/呼吸'},
 {id:'charts.bar',category:'charts',version:1,fields:'BarChartBlock.motion',description:'固定来源数值，柱形增长或按项显露'},
 {id:'charts.sequence',category:'charts',version:1,fields:'TimelineBlock.motion/TreeBlock.motion',description:'按项显露，不计算数据或模拟过程'},
 {id:'mechanism.states',category:'mechanisms',version:1,fields:'MechanismBlock.steps',description:'对象状态/关系、预设槽位与显隐'},
 {id:'code.focus',category:'code',version:1,fields:'CodeBlock.focus',description:'按旁白代码行聚焦'},
] as const;
export function extensionGuide(){return `内置能力分类目录（不是任意插件加载器）：\n${visualExtensions.map(e=>`${e.id}@${e.version} [${e.category}] ${e.fields}：${e.description}`).join('\n')}\n只能使用此版本Schema允许字段；不能从JSON指定脚本/包/URL。新增可执行插件需开发者安装、实现Schema/渲染/校验并测试发布，当前不支持运行时任意动态插拔。`;}
