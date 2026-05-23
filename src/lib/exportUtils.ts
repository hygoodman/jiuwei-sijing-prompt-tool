import type { PromptResult } from "../types/prompt";

const downloadText = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const timestamp = () => {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
};

export const exportTxt = (result: PromptResult) => {
  downloadText(result.copyReadyPrompt, `九维四镜提示词-${timestamp()}.txt`, "text/plain;charset=utf-8");
};

export const exportMarkdown = (result: PromptResult) => {
  const content = result.copyReadyPrompt
    .replace(/^视频基础设定：/m, "# 视频基础设定")
    .replace(/^镜头一：/m, "## 镜头一：")
    .replace(/^镜头二：/m, "## 镜头二：")
    .replace(/^镜头三：/m, "## 镜头三：")
    .replace(/^镜头四：/m, "## 镜头四：")
    .replace(/^统一负面约束：/m, "## 统一负面约束")
    .replace(/^English negative prompt:/m, "## English negative prompt");

  downloadText(content, `九维四镜提示词-${timestamp()}.md`, "text/markdown;charset=utf-8");
};
