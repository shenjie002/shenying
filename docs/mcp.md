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
| render_video | 基于有效时间轴生成 MP4 | API + RENDER |

剧本参数使用 `script` 对象。实际 JSON Schema 可读 `shenying://schema`；再调用 validate_script 检查跨字段规则。generate_storyboard 参数遵循 shared/article.ts（article、audience、style、duration、sceneCount）。

配音、静音和渲染返回 `{job: ...}` 后用 get_job 轮询到 done/error，不要把已入队当成完成。当前只保留最近一次任务，API 重启会丢失状态。HTTP 409 表示正在执行其他任务；工具错误通过 MCP `isError` 返回。请求超时不保证后台任务或外部模型调用被取消。生成文章的客户端应允许至少 190 秒工具超时。

视频路径 `/out/name.mp4` 可通过 `http://127.0.0.1:3001/out/name.mp4` 在本机访问。MCP 不传输视频二进制，也不提供任意路径读取。

## Resources 与 Prompt

- `shenying://overview`：项目概览与文档索引。
- `shenying://guide`：Agent 制作流程与安全约束。
- `shenying://license`：授权条款。
- `shenying://schema`：剧本 JSON Schema。
- `shenying://example`：示例剧本。
- Prompt `article_to_video`：输入 article，生成审稿优先的制作工作流指引，不自动外发或运行任务。

## Agent 搜索与发现

仓库根目录有 llms.txt 与 llms-full.txt；README 链接这些说明。它们方便能够访问 GitHub 的 Agent 了解项目，**不是搜索收录保证**。仓库本身没有部署公开网站，也没有注册公共 MCP 目录；如后续部署官网，可在网站根路径发布同样的文件。不要为方便发现而将本地 API 直接公开。
