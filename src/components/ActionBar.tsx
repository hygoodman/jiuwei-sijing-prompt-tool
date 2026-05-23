import { Eraser, RefreshCw, Sparkles } from "lucide-react";
import type { GenerationMode } from "../types/prompt";

interface ActionBarProps {
  generationMode: GenerationMode;
  isGenerating: boolean;
  onGenerate: () => void;
  onClear: () => void;
  onRegenerate: () => void;
  onSwitchMode: (mode: GenerationMode) => void;
}

export default function ActionBar({
  generationMode,
  isGenerating,
  onGenerate,
  onClear,
  onRegenerate,
  onSwitchMode,
}: ActionBarProps) {
  return (
    <section className="sticky bottom-4 z-10 rounded-lg border border-stone-200 bg-white/95 p-3 shadow-lg backdrop-blur">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles size={16} />
          {isGenerating ? "生成中" : "生成提示词"}
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-400"
        >
          <RefreshCw size={16} />
          重新生成
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-red-300"
        >
          <Eraser size={16} />
          清空内容
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode(generationMode === "ai" ? "local" : "ai")}
          className="ml-auto rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-400"
        >
          切换 {generationMode === "ai" ? "本地规则补全" : "AI 智能补全"}
        </button>
      </div>
    </section>
  );
}
