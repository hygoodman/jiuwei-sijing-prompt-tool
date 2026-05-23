import { getIndustryTemplate } from "./templates";
import type { IndustryId, PromptFormData, PromptGenerationRequest, PromptUnderstanding } from "../types/prompt";

const splitItems = (text: string) =>
  text
    .split(/[，,、；;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const unique = (items: string[]) => [...new Set(items.filter(Boolean))];

const findMatches = (text: string, patterns: string[]) =>
  patterns.filter((pattern) => text.includes(pattern));

const inferIndustryFromText = (formData: PromptFormData, rawPrompt: string): IndustryId => {
  if (formData.industry && formData.industry !== "general") return formData.industry;

  const text = `${formData.productName} ${formData.sellingPoints} ${rawPrompt}`;
  if (/口红|粉底|眼影|护肤|面霜|精华|彩妆|妆效/.test(text)) return "beauty";
  if (/手机|耳机|电脑|数码|智能|屏幕|触控|小家电|参数/.test(text)) return "digital";
  if (/宝宝|婴儿|母婴|纸尿裤|奶粉|亲肤|玩具/.test(text)) return "maternal";
  if (/食品|零食|饮品|火锅|烘焙|生鲜|拉丝|汁水|酥脆/.test(text)) return "food";
  if (/服饰|连衣裙|裤子|上衣|鞋|包|面料|显瘦|版型/.test(text)) return "fashion";
  if (/课程|培训|书籍|知识|学习|工具|学员|大纲/.test(text)) return "knowledge";
  return "general";
};

const extractProductFromRaw = (rawPrompt: string) => {
  const explicit = rawPrompt.match(/(?:产品|主推|商品|卖的是|展示)\s*[：:是为]?\s*([\u4e00-\u9fa5A-Za-z0-9\- ]{2,24})/);
  if (explicit?.[1]) return explicit[1].replace(/[，。；,.;\n].*$/, "").trim();

  const candidates = [
    "电动轮椅",
    "智能轮椅",
    "轮椅",
    "口红",
    "粉底液",
    "眼影",
    "耳机",
    "手机",
    "小家电",
    "纸尿裤",
    "奶粉",
    "零食",
    "饮品",
    "连衣裙",
    "课程",
  ];
  return candidates.find((candidate) => rawPrompt.includes(candidate)) ?? "";
};

const extractAudience = (text: string) => {
  const patterns = [
    "老人",
    "行动不便老人",
    "宝妈",
    "宝宝",
    "学生",
    "白领",
    "通勤人群",
    "新手妈妈",
    "照护家庭",
    "职场新人",
  ];
  return findMatches(text, patterns).join("、");
};

const extractScene = (text: string) => {
  const patterns = [
    "客厅",
    "卧室",
    "厨房",
    "办公室",
    "商场",
    "公园",
    "社区道路",
    "社区",
    "平整路面",
    "室内外",
    "餐桌",
    "梳妆台",
    "试衣间",
    "书桌",
    "直播间",
  ];
  return findMatches(text, patterns).join("、");
};

const extractStyle = (text: string) => {
  const patterns = [
    "高清写实",
    "真人实拍",
    "科技感",
    "温暖",
    "高级",
    "干净",
    "治愈",
    "生活感",
    "电影感",
    "ASMR",
  ];
  return findMatches(text, patterns).join("、");
};

const extractActions = (text: string) => {
  const patterns = [
    "打开",
    "拿起",
    "折叠",
    "展开",
    "触控",
    "滑动",
    "涂抹",
    "试吃",
    "夹起",
    "拉丝",
    "走动",
    "转身",
    "轻推摇杆",
    "行驶",
    "对比",
    "测试",
    "展示",
  ];
  return findMatches(text, patterns);
};

const extractPhysicalDetails = (text: string) => {
  const patterns = [
    "金属",
    "阻尼",
    "折叠",
    "布料褶皱",
    "液体流动",
    "食物拉丝",
    "热气",
    "汁水",
    "触控",
    "摇杆",
    "轮椅行驶",
    "轮子",
    "扶手",
    "脚踏",
    "亲肤",
    "柔软",
  ];
  return findMatches(text, patterns);
};

const extractTrustSignals = (text: string) => {
  const patterns = ["实测", "对比", "认证", "检测", "参数", "报告", "反馈", "防水", "防摔", "续航", "吸水测试", "持妆"];
  return findMatches(text, patterns);
};

const extractConstraints = (text: string) => {
  const constraints: string[] = [];
  const negativeSentences = text.match(/(?:不要|不能|避免|杜绝|禁止)[^。；;\n]{2,40}/g);
  if (negativeSentences) constraints.push(...negativeSentences);
  constraints.push(...findMatches(text, ["无水印", "无模糊", "不变形", "表情自然", "光影一致", "安全行驶"]));
  return unique(constraints);
};

const mergeFormAndRaw = (
  formData: PromptFormData,
  rawPrompt: string,
  inputMode: PromptGenerationRequest["inputMode"],
): PromptUnderstanding => {
  const rawProduct = extractProductFromRaw(rawPrompt);
  const rawAudience = extractAudience(rawPrompt);
  const rawScene = extractScene(rawPrompt);
  const rawStyle = extractStyle(rawPrompt);
  const rawActions = extractActions(rawPrompt);
  const rawPhysicalDetails = extractPhysicalDetails(rawPrompt);
  const rawTrustSignals = extractTrustSignals(rawPrompt);
  const rawConstraints = extractConstraints(rawPrompt);
  const rawSellingPoints = unique([
    ...splitItems(rawPrompt).filter((item) => /轻便|续航|稳定|安全|显色|持妆|亲肤|新鲜|显瘦|参数|优惠|操控|折叠/.test(item)),
  ]).slice(0, 6);

  const useForm = inputMode !== "raw";
  const template = getIndustryTemplate(inferIndustryFromText(formData, rawPrompt));

  return {
    productName: useForm && formData.productName.trim() ? formData.productName.trim() : rawProduct || "主推产品",
    industryGuess: template.name,
    sellingPoints: unique([
      ...(useForm ? splitItems(formData.sellingPoints) : []),
      ...rawSellingPoints,
      ...template.focus.slice(0, inputMode === "form" ? 3 : 2),
    ]).slice(0, 8),
    targetAudience:
      useForm && formData.targetAudience.trim() ? formData.targetAudience.trim() : rawAudience || "目标消费者",
    usageScenario:
      useForm && formData.usageScenario.trim() ? formData.usageScenario.trim() : rawScene || template.defaultScene,
    videoStyle:
      useForm && formData.videoStyle.trim() ? formData.videoStyle.trim() : rawStyle || "高清写实、干净高级、真实带货短视频",
    keyActions: unique([
      ...rawActions,
      ...(useForm && formData.sellingPoints.includes("折叠") ? ["折叠", "展开"] : []),
      "展示",
    ]).slice(0, 8),
    physicalDetails: unique([...rawPhysicalDetails, template.defaultPhysicalInteraction]).slice(0, 8),
    trustSignals: unique([...rawTrustSignals, template.trustProof]).slice(0, 6),
    constraints: unique([...(useForm ? splitItems(formData.extraRequirements) : []), ...rawConstraints]).slice(0, 8),
    preservedCreative:
      inputMode !== "form" && rawPrompt.trim()
        ? rawPrompt.trim().slice(0, 280)
        : "以表单信息为准，不额外引用原始提示词。",
  };
};

export const parsePromptUnderstanding = (request: PromptGenerationRequest): PromptUnderstanding =>
  mergeFormAndRaw(request.formData, request.rawPrompt, request.inputMode);
