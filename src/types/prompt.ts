export type InputMode = "form" | "raw" | "hybrid";

export type GenerationMode = "local" | "ai";

export type OutputLanguage = "zh" | "enNegativeOnly" | "bilingualNegative";

export type IndustryId =
  | "general"
  | "beauty"
  | "digital"
  | "maternal"
  | "food"
  | "fashion"
  | "knowledge";

export type PromptSource =
  | "local"
  | "ai"
  | "ai-with-local-fallback"
  | "plain-text-ai";

export interface PromptFormData {
  productName: string;
  industry: IndustryId;
  sellingPoints: string;
  targetAudience: string;
  usageScenario: string;
  videoStyle: string;
  promotionInfo: string;
  ctaType: string;
  extraRequirements: string;
  outputLanguage: OutputLanguage;
  enablePromotion: boolean;
  enableCartGuide: boolean;
  enableBilingualNegative: boolean;
}

export interface ModelConfig {
  apiBaseUrl: string;
  apiKey: string;
  modelName: string;
  enableAI: boolean;
}

export interface ShotDimensions {
  visual: string;
  camera: string;
  lighting: string;
  action: string;
  expression: string;
  physicalInteraction: string;
  scene: string;
  conversion: string;
  negativeControl: string;
}

export interface Shot {
  id: number;
  time: string;
  name: string;
  task: string;
  dimensions: ShotDimensions;
}

export interface PromptUnderstanding {
  productName: string;
  industryGuess: string;
  sellingPoints: string[];
  targetAudience: string;
  usageScenario: string;
  videoStyle: string;
  keyActions: string[];
  physicalDetails: string[];
  trustSignals: string[];
  constraints: string[];
  preservedCreative: string;
}

export interface PromptResult {
  understanding?: PromptUnderstanding;
  basicSetting: string;
  shots: Shot[];
  finalNegativePromptCn: string;
  finalNegativePromptEn: string;
  copyReadyPrompt: string;
  warnings?: string[];
  source: PromptSource;
  plainText?: string;
}

export interface PromptGenerationRequest {
  inputMode: InputMode;
  generationMode: GenerationMode;
  formData: PromptFormData;
  rawPrompt: string;
}

export interface IndustryTemplate {
  id: IndustryId;
  name: string;
  keywords: string[];
  suitableProducts: string[];
  focus: string[];
  defaultScene: string;
  defaultLighting: string;
  defaultPhysicalInteraction: string;
  trustProof: string;
  ctaHint: string;
}

export interface TestResult {
  ok: boolean;
  message: string;
}

export interface AIProviderResult {
  content: string;
}

export interface AIProvider {
  id: string;
  name: string;
  testConnection(config: ModelConfig): Promise<TestResult>;
  generatePrompt(
    config: ModelConfig,
    request: PromptGenerationRequest,
  ): Promise<AIProviderResult>;
}
