# 九维四镜提示词补全工具

面向 AI 视频生成的 15 秒 9:16 电商带货短视频提示词补全工具。

## 功能

- 表单生成、原始提示词补全、表单 + 原始提示词融合
- 九维四镜结构化输出
- 本地规则兜底
- OpenAI 兼容模型配置，适配 MiMo、DeepSeek、通义千问、OpenAI 等兼容接口
- 复制、TXT 导出、Markdown 导出

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

API Key 仅保存在浏览器 localStorage，不会写入源码。
