import { getIndustryTemplate } from "../lib/templates";
import type { IndustryId } from "../types/prompt";

interface TemplatePreviewProps {
  industry: IndustryId;
}

export default function TemplatePreview({ industry }: TemplatePreviewProps) {
  const template = getIndustryTemplate(industry);

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-900">模板预览</h2>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
          {template.name}
        </span>
      </div>
      <div className="grid gap-3 text-sm text-stone-700">
        <div>
          <p className="mb-1 font-medium text-stone-900">核心关键词</p>
          <div className="flex flex-wrap gap-2">
            {template.keywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-stone-100 px-2 py-1 text-xs">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 font-medium text-stone-900">适合产品</p>
          <p>{template.suitableProducts.join("、")}</p>
        </div>
        <div>
          <p className="mb-1 font-medium text-stone-900">生成重点</p>
          <p>{template.focus.join("、")}</p>
        </div>
      </div>
    </section>
  );
}
