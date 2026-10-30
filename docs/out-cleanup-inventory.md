# 历史生成产物清理结果

本轮用户要求检查并删除历史生成相关文件，已执行精确路径清理，不是自动清理规则。

## 已删除

共94文件，约27.23MiB：

- out开发截图、参考抽帧、短测与记录：原清单77文件。
- out额外旧预览与重复产物12文件：旧Rust continuous/light/polished/vivid四份完整预览、rust-typography-review.png、draft-1793325010212.mp4、六主题preview视频。
- input旧Rust动画版本5文件：rust-motion-before-continuous.json、rust-motion-generated.json、rust-motion-light.json、rust-motion-polished.json、rust-motion-vivid.json。

相关能力文档的旧JSON引用统一改指保留的rust-motion-typography.json，主题文档不再承诺已删除的短测视频存在。

## 保留边界

- 当前试验：input/agent-boundary-20s-study.json、out/agent-boundary-20s-study-review.mp4。
- 最新认可Rust稿：input/rust-motion-typography.json、out/rust-motion-typography-review.mp4。
- 用户参考原片：out/763bc53f48a015724e14f87b0a370133.mp4。
- 主题总览：out/theme-gallery.jpg。
- 全部video-*.mp4：归属未逐一确认，不删除。
- out/scene-cache：本轮未清理，避免丢失渲染加速。
- input中测试/文档使用的example夹具、旧生成稿rust-canvas-generated.json与rust-polish-generated.json（归属及保留意图未明确），以及原始材料均保留。
- docs能力说明与当前交接文档保留，不把新增未提交文件一概当临时文件。
- script.json、项目经验手册、用户文案、public音频和图片、源码均不因本次清理删除。

## 后续约定

临时抽帧放系统临时目录，日志、抽帧和一次性脚本用后清理，不每轮在out积累；可重复运行的验证脚本属于源码，保留但默认不生成截图。仅保留少量明确用途的验收版本。替换旧验收稿前确认归属和用户修改，不覆盖用户内容。本次没有增加自动删除任务、缓存淘汰或修改渲染输出策略；未来清理仍需遵守授权边界。
