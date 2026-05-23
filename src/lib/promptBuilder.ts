import { dimensionLabels } from "./constants";
import type { PromptResult, Shot } from "../types/prompt";

const shotTitle = (shot: Shot) => {
  const cnTime = formatShotTime(shot.time);
  return `镜头${["一", "二", "三", "四"][shot.id - 1] ?? shot.id}：${cnTime}，${shot.name}`;
};

export const formatShotTime = (time: string) =>
  time
    .replace("0-3s", "0到3秒")
    .replace("3-7s", "3到7秒")
    .replace("7-11s", "7到11秒")
    .replace("11-15s", "11到15秒");

export const buildCopyReadyPrompt = (result: Omit<PromptResult, "copyReadyPrompt">): string => {
  if (result.plainText && result.source === "plain-text-ai") {
    return result.plainText;
  }

  const understandingBlock = result.understanding
    ? `模型理解摘要：
产品：${result.understanding.productName}
行业判断：${result.understanding.industryGuess}
卖点拆分：${result.understanding.sellingPoints.join("、") || "未明确，已按行业模板补齐"}
场景/人群/风格：${result.understanding.usageScenario}；${result.understanding.targetAudience}；${result.understanding.videoStyle}
关键动作：${result.understanding.keyActions.join("、") || "展示、演示、测试、推荐"}
保留创意：${result.understanding.preservedCreative}

`
    : "";

  const shotBlocks = result.shots
    .map((shot) => {
      const dimensions = Object.entries(dimensionLabels)
        .map(([key, label]) => `${label}：${shot.dimensions[key as keyof typeof dimensionLabels]}`)
        .join("\n");

      return `${shotTitle(shot)}
任务：${shot.task}
${dimensions}`;
    })
    .join("\n\n");

  return `${understandingBlock}视频基础设定：
${result.basicSetting}

${shotBlocks}

统一负面约束：
${result.finalNegativePromptCn}

English negative prompt:
${result.finalNegativePromptEn}`.trim();
};

export const clonePromptResult = (result: PromptResult): PromptResult => ({
  ...result,
  shots: result.shots.map((shot) => ({
    ...shot,
    dimensions: { ...shot.dimensions },
  })),
  warnings: [...(result.warnings ?? [])],
});
