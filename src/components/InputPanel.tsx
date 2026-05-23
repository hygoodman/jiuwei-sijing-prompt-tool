import type { InputMode, PromptFormData } from "../types/prompt";
import { industryOptions } from "../lib/templates";

interface InputPanelProps {
  inputMode: InputMode;
  formData: PromptFormData;
  onInputModeChange: (mode: InputMode) => void;
  onFormChange: (formData: PromptFormData) => void;
}

const modeOptions: { id: InputMode; label: string }[] = [
  { id: "form", label: "表单生成" },
  { id: "raw", label: "原始提示词补全" },
  { id: "hybrid", label: "表单 + 原始提示词融合" },
];

const modeDescriptions: Record<InputMode, string> = {
  form: "只读取表单字段，忽略下方原始提示词；适合你已经把产品信息拆清楚时使用。",
  raw: "主要读取下方原始提示词，表单里的产品、卖点、场景等内容不会参与生成；适合直接粘贴旧提示词或文案让工具补全。",
  hybrid:
    "同时读取表单和原始提示词；表单明确填写的内容优先，原始提示词里的具体创意、场景、动作和限制会尽量保留。",
};

const fieldClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function InputPanel({
  inputMode,
  formData,
  onInputModeChange,
  onFormChange,
}: InputPanelProps) {
  const update = <K extends keyof PromptFormData>(key: K, value: PromptFormData[K]) => {
    onFormChange({ ...formData, [key]: value });
  };

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {modeOptions.map((option) => (
          <button
            key={option.id}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              inputMode === option.id
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-stone-200 bg-white text-stone-700 hover:border-emerald-300"
            }`}
            onClick={() => onInputModeChange(option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-900">
        {modeDescriptions[inputMode]}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>产品名称</span>
          <input
            className={fieldClass}
            value={formData.productName}
            onChange={(event) => update("productName", event.target.value)}
            placeholder="例如：电动轮椅、口红、小家电"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>行业选择</span>
          <select
            className={fieldClass}
            value={formData.industry}
            onChange={(event) => update("industry", event.target.value as PromptFormData["industry"])}
          >
            {industryOptions.map((industry) => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700 md:col-span-2">
          <span>产品卖点</span>
          <textarea
            className={fieldClass}
            rows={3}
            value={formData.sellingPoints}
            onChange={(event) => update("sellingPoints", event.target.value)}
            placeholder="例如：续航久、折叠轻便、通过小坡道、操控简单"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>目标人群</span>
          <input
            className={fieldClass}
            value={formData.targetAudience}
            onChange={(event) => update("targetAudience", event.target.value)}
            placeholder="例如：老人、宝妈、通勤白领"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>使用场景</span>
          <input
            className={fieldClass}
            value={formData.usageScenario}
            onChange={(event) => update("usageScenario", event.target.value)}
            placeholder="例如：居家、商场、公园平缓路面"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>视频风格</span>
          <input
            className={fieldClass}
            value={formData.videoStyle}
            onChange={(event) => update("videoStyle", event.target.value)}
            placeholder="高清写实、温暖生活感、科技感"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>CTA 类型</span>
          <input
            className={fieldClass}
            value={formData.ctaType}
            onChange={(event) => update("ctaType", event.target.value)}
            placeholder="点击购买 / 私信咨询 / 领取资料"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700 md:col-span-2">
          <span>促销信息</span>
          <input
            className={fieldClass}
            value={formData.promotionInfo}
            onChange={(event) => update("promotionInfo", event.target.value)}
            placeholder="例如：新品福利、套装优惠；关闭促销开关后不会生成强促销"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700 md:col-span-2">
          <span>额外要求</span>
          <textarea
            className={fieldClass}
            rows={3}
            value={formData.extraRequirements}
            onChange={(event) => update("extraRequirements", event.target.value)}
            placeholder="例如：不要夸张表演、不要危险驾驶、人物表情自然"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 rounded-md bg-stone-50 p-3 text-sm sm:grid-cols-2">
        <label className="space-y-1 font-medium text-stone-700">
          <span>生成语言</span>
          <select
            className={fieldClass}
            value={formData.outputLanguage}
            onChange={(event) =>
              update("outputLanguage", event.target.value as PromptFormData["outputLanguage"])
            }
          >
            <option value="zh">中文主提示词</option>
            <option value="enNegativeOnly">中文主提示词 + 英文负面词</option>
            <option value="bilingualNegative">中文主提示词 + 中英负面词</option>
          </select>
        </label>
        <div className="grid gap-2 pt-1 text-stone-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enablePromotion}
              onChange={(event) => update("enablePromotion", event.target.checked)}
            />
            启用价格促销
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enableCartGuide}
              onChange={(event) => update("enableCartGuide", event.target.checked)}
            />
            启用购物车引导
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enableBilingualNegative}
              onChange={(event) => update("enableBilingualNegative", event.target.checked)}
            />
            启用中英双语负面词
          </label>
        </div>
      </div>
    </section>
  );
}
