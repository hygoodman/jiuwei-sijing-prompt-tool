import { defaultModelConfig } from "./constants";
import type { ModelConfig } from "../types/prompt";

const MODEL_CONFIG_KEY = "nine-dim-four-shot-model-config";

export const loadModelConfig = (): ModelConfig => {
  try {
    const raw = localStorage.getItem(MODEL_CONFIG_KEY);
    if (!raw) return { ...defaultModelConfig };
    return { ...defaultModelConfig, ...JSON.parse(raw) };
  } catch {
    return { ...defaultModelConfig };
  }
};

export const saveModelConfig = (config: ModelConfig) => {
  localStorage.setItem(MODEL_CONFIG_KEY, JSON.stringify(config));
};
