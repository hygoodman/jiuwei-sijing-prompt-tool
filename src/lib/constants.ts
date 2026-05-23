import type { Shot, ShotDimensions } from "../types/prompt";

export const dimensionLabels: Record<keyof ShotDimensions, string> = {
  visual: "视觉维度",
  camera: "镜头语言维度",
  lighting: "灯光维度",
  action: "动作维度",
  expression: "表情维度",
  physicalInteraction: "物理交互维度",
  scene: "场景环境维度",
  conversion: "转化指令维度",
  negativeControl: "负面强控维度",
};

export const shotBlueprints: Pick<Shot, "id" | "time" | "name" | "task">[] = [
  {
    id: 1,
    time: "0-3s",
    name: "钩子镜",
    task: "黄金抓眼，吸引用户停留。",
  },
  {
    id: 2,
    time: "3-7s",
    name: "演示镜",
    task: "展示产品核心卖点和真实使用过程。",
  },
  {
    id: 3,
    time: "7-11s",
    name: "信任镜",
    task: "通过实测、对比、参数或反馈建立产品信任。",
  },
  {
    id: 4,
    time: "11-15s",
    name: "转化镜",
    task: "完整展示产品与购买理由，促成点击、咨询或下单。",
  },
];

export const baseSetting =
  "15秒，9:16竖屏，4K高清写实，真人实拍感，电商带货短视频，适合TikTok、Instagram Reels、YouTube Shorts。";

export const commonNegativeCn =
  "画面流畅稳定，无抖动，无模糊，面部清晰不变形，人体结构正常，产品无穿模，无变形，无偏色，轮廓清晰，纹理完整，无水印，无多余文字logo，文字排版清晰可读，人物动作自然，灯光一致，场景真实可信，无AI畸变，人物比例正常，全局保持人物和场景的光影一致性。";

export const commonNegativeEn =
  "low quality, blurry, deformed, bad anatomy, bad hands, face distortion, product distortion, jittery motion, watermark, extra limbs, wrong text, unreadable text, logo error, overexposure, underexposure, inconsistent lighting, unrealistic physics";

export const wheelchairNegativeCn =
  "行驶时保持手指轻推摇杆，轮椅结构正常，避免轮椅多轮、少轮、结构错乱、扶手错位、脚踏错位，避免坡度过大、危险驾驶、夸张越野场景。";

export const wheelchairNegativeEn =
  "electric wheelchair structure error, extra wheels, missing wheels, misplaced armrests, misplaced footrests, unsafe driving, overly steep slope, exaggerated off-road scene";

export const defaultFormData = {
  productName: "",
  industry: "general",
  sellingPoints: "",
  targetAudience: "",
  usageScenario: "",
  videoStyle: "",
  promotionInfo: "",
  ctaType: "点击购买",
  extraRequirements: "",
  outputLanguage: "zh",
  enablePromotion: true,
  enableCartGuide: true,
  enableBilingualNegative: true,
} as const;

export const defaultModelConfig = {
  apiBaseUrl: "",
  apiKey: "",
  modelName: "",
  enableAI: false,
} as const;
