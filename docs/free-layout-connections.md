# 自由排版、连线与基础图表动画

## 目标与边界

用户不需要知道字段，通过外部Agent/MCP描述需求；Agent发现能力、生成/修改JSON、校验并经确认保存，引擎渲染。当前网页不是内置聊天产品。新增能力与旧模板兼容，不为特效编造数据或因果。

### 分类目录

shared/extensions.ts登记当前内置能力ID、分类、版本、字段与说明，注入真实生成提示/MCP renderer。分类为layout、connections、charts、mechanisms、code。

**这是内置能力目录，不是运行时插件系统。** 添加新可执行扩展仍需开发者实现Schema、组件、校验、提示和跨题材测试后发布。JSON不得指定模块、包、脚本或URL。未实现任意动态安装、卸载或第三方插件执行。

## 1. 自由错落布局

CanvasSlide.props.layout="free"，placements为所有叶块的完整位置列表：

```json
{"id":"code","x":0,"y":0,"width":45,"height":60,"layer":0}
```

坐标相对于标题下方的内容区，单位百分比。x/y为左上，width/height为尺寸，各在0～100内，尺寸至少12，右下不能越界。layer为0～10，默认0。位置矩形允许重叠，但不保证自动避碰/可读性；AI应避免遮挡。自由模式扁平渲染所有叶块，Group只保留深度优先编号，Group自身禁止free布局。

cues可选择layout=free并提供完整placements（省略使用根placements），或切换grid/stacked/split-2-1恢复预设。cues.focus仍可临时全宽单块。位置/尺寸重排为即时切换，没有平滑自由轨迹或无缝变形。

## 2. 跨块连线

props.connectors最多12条，仅free布局渲染，每条{id,from,to,fromAnchor?,toAnchor?,label?,sentence?,style?}。引用叶块稳定ID；不自连，连线ID唯一。锚点top/right/bottom/left，默认right→left。sentence指定起始旁白句号，省略幕首开始。cues可给connectors完整快照替换根连线集合，[]清除。

style提供：

| 参数 | 可选值 |
|---|---|
| stroke | solid实线、dashed虚线、dotted点线 |
| arrow | none、end、both |
| route | straight直线、elbow折线、curve曲线 |
| motion | none、draw一次绘制、flow循环移动虚线、pulse低频透明度变化 |
| tone | neutral、accent、warning |

默认实线、单向箭头、直线、静止、accent色。flow以移动虚线示意流向，会优先使用流动虚线而非stroke；draw以一次路径显露优先，不同时保留虚线纹理。animation=none冻结为完整静态线。绘制、流动和呼吸均由Remotion帧驱动，无CSS定时。

线条是概念关系，不代表实测网络流量、真实运行、因果证明。不会自动绕开障碍或避免标签重叠。矩形百分比锚点计算直线/单弯折线/曲线；与MechanismBlock内部关系不同，内部关系仍使用既有kind/emphasis，不要把connectors.style写进机制关系。

## 3. 图表动画首批

BarChartBlock、TimelineBlock、TreeBlock可选motion：

```json
{"mode":"grow","sentence":3,"durationFrames":24}
```

- BarChart支持grow按统一进度从零显露柱形；默认固定最终数值从开始就显示；可选countUp:true配合grow按显露进度计数，不是滚轮字形或真实时间序列。sequence按顺序显露项目。
- Timeline/Tree支持sequence按项淡入，grow会被校验拒绝。
- none保持静态；省略motion兼容旧稿。
- sentence必须为本幕有效旁白句号；durationFrames为6～90，默认24。animation=none显示最终静态状态；随机跳帧确定。

这不是时间序列数据变化，也不是计算/预测。数据、日期和层级必须来自资料。仍未实现折线/饼/环形/散点图、数据更新形变、任意SVG或真实流式数据源，不可统称“所有动态图表均支持”。

## 示例与验收

input/free-canvas-example.json可直接导入，故意标注虚构数据，只测布局，不可用作性能结论。它展示左上输入、中部步骤、右下柱图、曲线虚线流动与折线绘制。测试覆盖所有线型枚举组合、引用、坐标越界、旁白句号和进度边界；组合可解析不代表所有组合都已人工逐个验收。媒体抽查包括静音短片与最终帧，不代表真实配音全片验收。

下游新增素材/组件需纳入分镜渲染引擎指纹。AI先查能力目录，不支持就说明或提供替代，不改TSX“实现”用户单次要求。
