import { commonNegativeCn, commonNegativeEn, shotBlueprints } from "./constants";
import { buildCopyReadyPrompt, clonePromptResult } from "./promptBuilder";
import type { PromptResult, Shot, ShotDimensions } from "../types/prompt";

const dimensionKeys: (keyof ShotDimensions)[] = [
  "visual",
  "camera",
  "lighting",
  "action",
  "expression",
  "physicalInteraction",
  "scene",
  "conversion",
  "negativeControl",
];

const normalizeShot = (shot: Partial<Shot> | undefined, fallback: Shot, index: number): Shot => {
  const blueprint = shotBlueprints[index] ?? shotBlueprints[0];
  const dimensions = { ...fallback.dimensions };
  for (const key of dimensionKeys) {
    const value = shot?.dimensions?.[key];
    dimensions[key] = typeof value === "string" && value.trim() ? value.trim() : dimensions[key];
  }

  return {
    id: typeof shot?.id === "number" ? shot.id : blueprint.id,
    time: typeof shot?.time === "string" && shot.time.trim() ? shot.time : blueprint.time,
    name: typeof shot?.name === "string" && shot.name.trim() ? shot.name : blueprint.name,
    task: typeof shot?.task === "string" && shot.task.trim() ? shot.task : fallback.task,
    dimensions,
  };
};

export const validateAndCompleteResult = (
  candidate: Partial<PromptResult>,
  fallback: PromptResult,
  source: PromptResult["source"] = "ai",
): PromptResult => {
  const warnings = [...(candidate.warnings ?? [])];
  const fallbackCopy = clonePromptResult(fallback);

  const shots = shotBlueprints.map((_, index) => {
    const candidateShot = Array.isArray(candidate.shots) ? candidate.shots[index] : undefined;
    if (!candidateShot) warnings.push(`AI 返回缺少镜头 ${index + 1}，已用本地规则补齐。`);
    return normalizeShot(candidateShot, fallbackCopy.shots[index], index);
  });

  for (const shot of shots) {
    for (const key of dimensionKeys) {
      if (!shot.dimensions[key]) {
        warnings.push(`镜头 ${shot.id} 缺少 ${key}，已用本地规则补齐。`);
      }
    }
  }

  const resultWithoutCopy = {
    understanding: candidate.understanding ?? fallbackCopy.understanding,
    basicSetting:
      typeof candidate.basicSetting === "string" && candidate.basicSetting.trim()
        ? candidate.basicSetting.trim()
        : fallbackCopy.basicSetting,
    shots,
    finalNegativePromptCn:
      typeof candidate.finalNegativePromptCn === "string" && candidate.finalNegativePromptCn.trim()
        ? candidate.finalNegativePromptCn.trim()
        : fallbackCopy.finalNegativePromptCn || commonNegativeCn,
    finalNegativePromptEn:
      typeof candidate.finalNegativePromptEn === "string" && candidate.finalNegativePromptEn.trim()
        ? candidate.finalNegativePromptEn.trim()
        : fallbackCopy.finalNegativePromptEn || commonNegativeEn,
    warnings,
    source,
  };

  return {
    ...resultWithoutCopy,
    copyReadyPrompt:
      typeof candidate.copyReadyPrompt === "string" && candidate.copyReadyPrompt.trim()
        ? candidate.copyReadyPrompt.trim()
        : buildCopyReadyPrompt(resultWithoutCopy),
  };
};

export const extractJsonFromText = (text: string) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text;
};

const removeJsonComments = (text: string) =>
  text
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

const normalizeLooseJson = (text: string) =>
  removeJsonComments(text)
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3');

const extractBalancedJsonObject = (text: string) => {
  const start = text.indexOf("{");
  if (start < 0) return "";

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }

  return "";
};

export const parseAIJsonResult = (content: string): Partial<PromptResult> => {
  const candidates = [
    extractJsonFromText(content),
    extractBalancedJsonObject(content),
    normalizeLooseJson(extractJsonFromText(content)),
    normalizeLooseJson(extractBalancedJsonObject(content)),
  ].filter(Boolean);

  const errors: string[] = [];
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as Partial<PromptResult>;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "未知解析错误");
    }
  }

  throw new Error(`JSON 解析失败：${errors[errors.length - 1] ?? "未找到 JSON 对象"}`);
};
