interface GenerationProgressProps {
  active: boolean;
  percent: number;
  label: string;
}

export default function GenerationProgress({ active, percent, label }: GenerationProgressProps) {
  if (!active) return null;

  return (
    <div className="mb-4 rounded-lg border border-emerald-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-emerald-950">{label}</span>
        <span className="font-semibold text-emerald-700">{Math.round(percent)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(4, percent))}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-stone-500">
        <span className={percent >= 18 ? "text-emerald-700" : ""}>理解输入</span>
        <span className={percent >= 38 ? "text-emerald-700" : ""}>请求模型</span>
        <span className={percent >= 72 ? "text-emerald-700" : ""}>解析结构</span>
        <span className={percent >= 92 ? "text-emerald-700" : ""}>校验补齐</span>
      </div>
    </div>
  );
}
