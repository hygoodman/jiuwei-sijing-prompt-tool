import type { GenerationMode } from "../types/prompt";

interface GenerationModePanelProps {
  generationMode: GenerationMode;
  hasConfig: boolean;
  onChange: (mode: GenerationMode) => void;
}

export default function GenerationModePanel({
  generationMode,
  hasConfig,
  onChange,
}: GenerationModePanelProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-stone-900">生成方式</h2>
        <span className="text-xs text-stone-500">{hasConfig ? "已检测到 API 配置" : "未配置 API，建议本地规则"}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: "local" as const, label: "本地规则补全" },
          { id: "ai" as const, label: "AI 智能补全" },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              generationMode === option.id
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-stone-200 bg-white text-stone-700 hover:border-emerald-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
