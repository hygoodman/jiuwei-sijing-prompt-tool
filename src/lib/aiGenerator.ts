import { getIndustryTemplate } from "./templates";
import type {
  AIProvider,
  AIProviderResult,
  ModelConfig,
  PromptGenerationRequest,
  TestResult,
} from "../types/prompt";

const getEndpoint = (apiBaseUrl: string) => {
  const trimmed = apiBaseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (/\/chat\/completions$/i.test(trimmed)) return trimmed;
  return `${trimmed}/chat/completions`;
};

const isMiMoEndpoint = (apiBaseUrl: string) => /xiaomimimo\.com/i.test(apiBaseUrl);

const getModelName = (config: ModelConfig) => {
  const modelName = config.modelName.trim();
  if (isMiMoEndpoint(config.apiBaseUrl) && /^mimo/i.test(modelName)) {
    return modelName.toLowerCase();
  }
  return modelName;
};

const getHeaders = (config: ModelConfig) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`,
  };

  if (isMiMoEndpoint(config.apiBaseUrl)) {
    headers["api-key"] = config.apiKey;
  }

  return headers;
};

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || response.statusText;
  } catch {
    return response.statusText;
  }
};

export const buildSystemPrompt = () => `你是一名专业的 AI 视频提示词工程师，擅长电商带货短视频、Seedance 2.0、即梦、可灵、Sora 等视频生成工具提示词写作。

你必须严格按照“九维四镜框架”输出，不能遗漏四个镜头，不能遗漏每个镜头的九个维度。

最重要的工作方式：
你不能把用户原始提示词机械切成四段。你必须先理解和拆分原始提示词，再重写补全。
请先在内部完成这些理解步骤，并把理解结果写入 JSON 的 understanding 字段：
1. 识别真正的产品，而不是照抄“主推产品”这类占位词。
2. 判断行业模板，提取产品所属行业。
3. 拆分产品卖点，把抽象卖点改成可拍摄、可看见的画面表达。
4. 提取场景、人群、人物动作、视频风格、物理交互、信任证明、限制条件。
5. 判断原始提示词里哪些信息应该保留，哪些只是文案噪音。
6. 把保留创意自然分配到四个镜头中：钩子镜抓眼、演示镜证明卖点、信任镜给证据、转化镜收口。

九个维度固定为：
visual, camera, lighting, action, expression, physicalInteraction, scene, conversion, negativeControl。

四个镜头固定为：
1. 0-3s，钩子镜，黄金抓眼，微距特写，强视觉冲击。
2. 3-7s，演示镜，展示产品核心卖点和使用过程。
3. 7-11s，信任镜，展示实测、对比、认证、参数、反馈或场景验证。
4. 11-15s，转化镜，产品完整展示、CTA、购买或咨询引导。

任务要求：
1. 读取用户输入的表单信息和原始提示词。
2. 提取产品名称、行业、卖点、场景、目标人群、视频风格和限制条件。
3. 保留用户原始提示词中的关键创意。
4. 按 15 秒四镜头节奏“重写和补全”，不是机械拆分。
5. 主提示词默认使用中文，不需要完整翻译全部九维四镜。
6. 如果用户关闭价格促销，不得生成原价、惊爆价、仅剩库存、限时抢购等强促销内容。
7. 如果用户关闭购物车引导，不得生成“手指指向左下角购物车”。
8. 最后必须追加中文统一负面约束和英文 negative prompt。
9. 如果明确是电动轮椅提示词，必须合并轮椅结构、摇杆、光影一致、真人实拍感、安全行驶等专项约束。

输出硬性要求：
只返回一个合法 JSON 对象。
不要使用 Markdown 代码块。
不要在 JSON 前后添加解释、标题、注释或自然语言。
不要使用中文字段名。
不要使用尾随逗号。
不要在 copyReadyPrompt 后追加第二份纯文本。

JSON 结构必须是：
{
  "understanding": {
    "productName": "",
    "industryGuess": "",
    "sellingPoints": [],
    "targetAudience": "",
    "usageScenario": "",
    "videoStyle": "",
    "keyActions": [],
    "physicalDetails": [],
    "trustSignals": [],
    "constraints": [],
    "preservedCreative": ""
  },
  "basicSetting": "",
  "shots": [
    {
      "id": 1,
      "time": "0-3s",
      "name": "钩子镜",
      "task": "",
      "dimensions": {
        "visual": "",
        "camera": "",
        "lighting": "",
        "action": "",
        "expression": "",
        "physicalInteraction": "",
        "scene": "",
        "conversion": "",
        "negativeControl": ""
      }
    }
  ],
  "finalNegativePromptCn": "",
  "finalNegativePromptEn": "",
  "copyReadyPrompt": ""
}`;

const buildUserPrompt = (request: PromptGenerationRequest) => {
  const template = getIndustryTemplate(request.formData.industry);
  return JSON.stringify(
    {
      inputMode: request.inputMode,
      generationMode: request.generationMode,
      formData: request.formData,
      rawPrompt: request.rawPrompt,
      industryTemplate: template,
      outputRules: {
        mainPromptLanguage: "中文",
        englishPolicy: "不完整翻译全部九维四镜，只输出 English negative prompt。",
        appendChineseNegative: true,
        appendEnglishNegative: request.formData.enableBilingualNegative,
        mustUnderstandBeforeWriting:
          "必须先输出 understanding。shots 必须基于 understanding 重写，不要把原始提示词按时间机械切成四段。",
        formPriority:
          request.inputMode === "hybrid"
            ? "表单明确填写内容优先；原始提示词中的具体创意、人物、动作、场景、风格和限制条件要保留。"
            : request.inputMode === "raw"
              ? "主要理解原始提示词，表单只提供开关和输出约束。"
              : "只使用表单字段，忽略原始提示词。",
      },
    },
    null,
    2,
  );
};

export const openAICompatibleProvider: AIProvider = {
  id: "openai-compatible",
  name: "OpenAI 兼容接口",

  async testConnection(config: ModelConfig): Promise<TestResult> {
    if (!config.apiBaseUrl.trim() || !config.apiKey.trim() || !config.modelName.trim()) {
      return { ok: false, message: "请先填写 API Base URL、API Key 和 Model Name。" };
    }

    try {
      const response = await fetch(getEndpoint(config.apiBaseUrl), {
        method: "POST",
        headers: getHeaders(config),
        body: JSON.stringify({
          model: getModelName(config),
          messages: [{ role: "user", content: "请只回复 OK" }],
          temperature: 0,
          max_completion_tokens: 8,
        }),
      });

      if (!response.ok) {
        return { ok: false, message: `连接失败：${await extractErrorMessage(response)}` };
      }

      return { ok: true, message: "连接成功，当前配置可用。" };
    } catch (error) {
      return {
        ok: false,
        message: `连接失败：${error instanceof Error ? error.message : "未知错误"}。如果是 CORS，请尝试兼容代理地址。`,
      };
    }
  },

  async generatePrompt(
    config: ModelConfig,
    request: PromptGenerationRequest,
  ): Promise<AIProviderResult> {
    if (!config.apiBaseUrl.trim() || !config.apiKey.trim() || !config.modelName.trim()) {
      throw new Error("AI 配置缺失，请填写 API Base URL、API Key 和 Model Name。");
    }

    const response = await fetch(getEndpoint(config.apiBaseUrl), {
      method: "POST",
      headers: getHeaders(config),
      body: JSON.stringify({
        model: getModelName(config),
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(request) },
        ],
        temperature: 0.35,
        max_completion_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response));
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("AI 返回内容为空或格式不兼容。");
    }

    return { content };
  },
};
