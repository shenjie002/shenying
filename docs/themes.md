# 可选视觉主题

顶层 `theme.palette` 已有11套预设。模型生成提示自动读取 `shared/themes.ts` 的完整目录；不需要为每个话题改源码。它们是配色、舞台框架、背景装饰和圆角预设，不是10种独立动画引擎，也不是完整的任意美术样式编辑器。

| 值 | 视觉方向 | 选型参考（非限制） |
|---|---|---|
| blue | 深蓝、有框 | 传统技术讲解 |
| editorial | 暖黑、有框 | 编辑式解说 |
| light | 蓝白、有框 | 简洁说明 |
| vivid | 紫青橙、开放舞台 | 活泼知识动画 |
| ocean | 海盐青蓝、柔和圆角 | 网络、系统、流转 |
| sunrise | 暖杏珊瑚、开放舞台 | 生活、人文、故事 |
| botanical | 米绿、大圆角、低对比轨道 | 自然、健康、可持续 |
| candy | 粉紫与青色、大圆角 | 创意、轻松入门 |
| neon | 深紫霓虹、微网格 | AI、计算、未来概念 |
| blueprint | 工程蓝图、小圆角、微网格 | 架构、结构、流程 |
| handbook | 暖褐手帐、大圆角、琥珀高亮、暖黄字幕胶囊 | 轻松讲解、生活化科普、活泼知识分享 |

同一支片选一个主主题，对象身份保持同一颜色；不按关键词生硬决定风格，不靠频繁换色冒充动画。视觉题材匹配不表示安全、科学或认证背书。可与布局、形状、tone、连续关键帧组合，但JSON不允许任意CSS/颜色/脚本。

所有主题适配MotionScene对象的teal/rose/highlight；highlight为暖黄荧光笔式重点，浅色主题自动换成深琥珀以保证对比（≥3:1，由测试守护）；低对比装饰由帧驱动，animation=none冻结。开放主题的MotionScene免外层框，不影响其他块边界。旧代码窗口仍保持深色，部分旧图表仍使用固定语义色，不能承诺全部组件完全换肤。

字幕胶囊（subtitles=true）使用主题的subtitleBg/subtitleFg：默认深底白字，handbook为暖黄底深字；圆角22px，属于主题化外观，不改变分句与时长逻辑。对象弹簧新增spring-jelly（高刚度低阻尼，明显果冻回弹），与spring-soft/bouncy/snappy同级可选，仍是确定性关键帧插值。

## 预览

`out/theme-gallery.jpg` 六宫格：上排ocean/sunrise/botanical，下排candy/neon/blueprint。

每个新主题对应 `input/theme-主题名-example.json`。原3秒主题短测视频已清理，选色总览保留为`out/theme-gallery.jpg`；需要时从JSON重渲染，不把短测当完整节奏验收。输入示例是一幕完整旁白，可以正常静音预览或准备时间轴。

切换示例：

```json
"theme": {"palette":"ocean","brand":"申映","footer":"把知识，讲清楚。","chapters":true}
```

对比测试检查基础色在原始背景/卡片上的对比度，不证明透明度过渡、叠色、所有图表或任意文本都可读；实际成片需检查遮挡、字幕及小屏阅读。
