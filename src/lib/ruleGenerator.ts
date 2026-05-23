import {
  baseSetting,
  commonNegativeCn,
  commonNegativeEn,
  shotBlueprints,
  wheelchairNegativeCn,
  wheelchairNegativeEn,
} from "./constants";
import { buildCopyReadyPrompt } from "./promptBuilder";
import { parsePromptUnderstanding } from "./rawPromptParser";
import { getIndustryTemplate } from "./templates";
import type {
  IndustryId,
  PromptFormData,
  PromptGenerationRequest,
  PromptResult,
  Shot,
} from "../types/prompt";

const clean = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

const stripEndPunctuation = (value: string) => value.replace(/[。；;，,.\s]+$/g, "");
const joinCnParts = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .map(stripEndPunctuation)
    .join("，") + "。";
const joinEnParts = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .map((part) => part.trim().replace(/[,.\s]+$/g, ""))
    .join(", ");

export const inferIndustry = (formData: PromptFormData, rawPrompt: string): IndustryId => {
  if (formData.industry && formData.industry !== "general") {
    return formData.industry;
  }

  const text = `${formData.productName} ${formData.sellingPoints} ${rawPrompt}`;
  if (/口红|粉底|眼影|护肤|面霜|精华|彩妆|妆效/.test(text)) return "beauty";
  if (/手机|耳机|电脑|数码|智能|屏幕|触控|小家电|参数/.test(text)) return "digital";
  if (/宝宝|婴儿|母婴|纸尿裤|奶粉|亲肤|玩具/.test(text)) return "maternal";
  if (/食品|零食|饮品|火锅|烘焙|生鲜|拉丝|汁水|酥脆/.test(text)) return "food";
  if (/服饰|连衣裙|裤子|上衣|鞋|包|面料|显瘦|版型/.test(text)) return "fashion";
  if (/课程|培训|书籍|知识|学习|工具|学员|大纲/.test(text)) return "knowledge";
  return "general";
};

export const isElectricWheelchairPrompt = (formData: PromptFormData, rawPrompt: string) => {
  const text = `${formData.productName} ${formData.industry} ${formData.sellingPoints} ${formData.usageScenario} ${formData.extraRequirements} ${rawPrompt}`;
  return /电动轮椅|智能轮椅|轮椅.*(电动|摇杆|助行)|((电动|摇杆|助行).{0,12}轮椅)/.test(text);
};

const buildConversion = (formData: PromptFormData, shotId: number) => {
  const cta = clean(formData.ctaType, "点击购买");
  const promo = formData.enablePromotion
    ? clean(formData.promotionInfo, "突出当前优惠权益，但不使用夸张虚假承诺")
    : "不出现原价、惊爆价、库存紧张、限时抢购等强促销信息";
  const cart = formData.enableCartGuide ? "可自然引导点击购物车或购买入口" : "不出现手指指向左下角购物车的动作";

  if (shotId === 4) {
    return `${promo}，${cart}，结尾用自然口播或屏幕文字提示“${cta}”。`;
  }
  if (shotId === 1) return "只做轻量卖点提示，不提前堆叠价格信息，保持用户停留。";
  if (shotId === 2) return "在演示过程中自然露出核心卖点，避免遮挡产品主体。";
  return "用实测、参数或反馈承接购买理由，为结尾转化做铺垫。";
};

const shotSpecificContent = (
  shotId: number,
  understanding: ReturnType<typeof parsePromptUnderstanding>,
  templateFocus: string,
) => {
  const product = understanding.productName;
  const sellingPoints = understanding.sellingPoints.join("、") || templateFocus;
  const audience = understanding.targetAudience;
  const actionFlow = understanding.keyActions.length
    ? understanding.keyActions.join("、")
    : "拿起、展示、演示、测试";
  const physical = understanding.physicalDetails.filter((item) => item.length < 60).join("、");
  const trust = understanding.trustSignals.filter((item) => item.length < 80).join("、");

  switch (shotId) {
    case 1:
      return {
        visual: `从原始创意中提炼最抓眼的一点做微距特写：${product}的${understanding.sellingPoints[0] ?? templateFocus}，画面第一秒形成强视觉冲击，文字放在安全区内。`,
        camera: "微距定格后轻微推近，先给产品局部质感，再用一次短切展示使用前状态，镜头稳定无晃动。",
        action: `人物将${product}从画面边缘自然带入中心，围绕“${understanding.sellingPoints[0] ?? "核心卖点"}”做一个可见动作，停顿半秒让用户看清关键细节。`,
        expression: `${audience}看到产品细节后露出自然惊艳、被吸引的表情。`,
      };
    case 2:
      return {
        visual: `把卖点拆成可视化动作展示：${sellingPoints}。产品主体始终占据画面中心，细节不被手部或道具遮挡。`,
        camera: "特写转中景，跟随动作轻推；每个关键操作点给到短暂停留，让模型能理解连续动作。",
        action: `人物按“${actionFlow}”的顺序连续演示${product}，动作具体、自然、完整，不跳步。`,
        expression: "人物表情沉浸、享受、认可，反应真实不过度夸张。",
      };
    case 3:
      return {
        visual: `把信任信息转成真实画面：${trust || `${product}的实测、对比、参数或反馈`}，强化可信细节。`,
        camera: "中景推镜，穿插细节特写和结果停顿，节奏比演示镜更稳，强调真实证据。",
        action: `人物进行一次可被看懂的测试、对比或场景验证，并把“${trust || "验证结果"}”展示给镜头。`,
        expression: "人物表情笃定、真实、认可，像真实体验后的推荐。",
      };
    default:
      return {
        visual: `完整展示${product}、包装或使用成果，并回收前面保留的创意设定：${understanding.preservedCreative}，保留清晰留白用于CTA文字。`,
        camera: "广角全景收束，最后轻微推近产品和购买信息，结尾稳定停帧。",
        action: `人物把${product}摆到画面中心，结合${physical || "真实物理细节"}做一次自然推荐动作，形成明确收尾。`,
        expression: "人物自信推荐，表情亲和自然，避免僵硬和过度表演。",
      };
  }
};

export const generateLocalPrompt = (request: PromptGenerationRequest): PromptResult => {
  const { formData, rawPrompt } = request;
  const inferredIndustry = inferIndustry(formData, rawPrompt);
  const template = getIndustryTemplate(inferredIndustry);
  const understanding = parsePromptUnderstanding(request);
  const product = understanding.productName;
  const sellingPoints = understanding.sellingPoints.join("、") || template.focus.slice(0, 3).join("、");
  const audience = understanding.targetAudience;
  const scene = understanding.usageScenario;
  const style = understanding.videoStyle;
  const extra = clean(formData.extraRequirements, "");
  const rawCreative =
    request.inputMode !== "form" && rawPrompt.trim()
      ? `保留原始提示词中的关键创意：${rawPrompt.trim()}。`
      : "";
  const wheelchair = isElectricWheelchairPrompt(formData, rawPrompt);

  const shots: Shot[] = shotBlueprints.map((blueprint) => {
    const specific = shotSpecificContent(
      blueprint.id,
      understanding,
      template.focus.slice(0, 3).join("、"),
    );

    return {
      ...blueprint,
      dimensions: {
        visual: specific.visual,
        camera: specific.camera,
        lighting: `${stripEndPunctuation(template.defaultLighting)}，整体风格为${style}，全局光影一致。`,
        action: specific.action,
        expression: specific.expression,
        physicalInteraction:
          blueprint.id === 2
            ? `${understanding.physicalDetails.join("、")}，重点体现${sellingPoints}。`
            : understanding.physicalDetails.join("、") || template.defaultPhysicalInteraction,
        scene: `${stripEndPunctuation(scene)}，背景干净无杂物，道具少而准确，保留文字安全区。${rawCreative}`,
        conversion: buildConversion(formData, blueprint.id),
        negativeControl: joinCnParts(
          "避免画面模糊、人物变形、产品穿模、字体错误、水印、光影不一致",
          wheelchair && blueprint.id >= 2 ? "避免轮椅结构错乱、危险驾驶和夸张越野场景" : "",
          extra ? `额外限制：${extra}` : "",
        ),
      },
    };
  });

  const finalNegativePromptCn = joinCnParts(commonNegativeCn, wheelchair ? wheelchairNegativeCn : "");
  const finalNegativePromptEn = formData.enableBilingualNegative
    ? joinEnParts(commonNegativeEn, wheelchair ? wheelchairNegativeEn : "")
    : commonNegativeEn;

  const resultWithoutCopy = {
    basicSetting: `${baseSetting} 产品：${product}。行业模板：${template.name}。目标人群：${audience}。核心卖点：${sellingPoints}。`,
    understanding,
    shots,
    finalNegativePromptCn,
    finalNegativePromptEn,
    warnings: request.generationMode === "ai" ? ["AI 配置缺失或调用失败，已使用本地规则补全。"] : [],
    source: "local" as const,
  };

  return {
    ...resultWithoutCopy,
    copyReadyPrompt: buildCopyReadyPrompt(resultWithoutCopy),
  };
};
