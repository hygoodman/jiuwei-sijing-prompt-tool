import { Clipboard, Download, FileDown } from "lucide-react";
import { dimensionLabels } from "../lib/constants";
import { formatShotTime } from "../lib/promptBuilder";
import type { PromptResult } from "../types/prompt";

interface OutputPanelProps {
  result: PromptResult | null;
  onCopy: () => void;
  onManualCopy: () => void;
  onExportTxt: () => void;
  onExportMarkdown: () => void;
  copied: boolean;
}

const sourceLabel: Record<PromptResult["source"], string> = {
  local: "本地规则",
  ai: "AI 智能补全",
  "ai-with-local-fallback": "AI + 本地补齐",
  "plain-text-ai": "AI 纯文本",
};

export default function OutputPanel({
  result,
  onCopy,
  onManualCopy,
  onExportTxt,
  onExportMarkdown,
  copied,
}: OutputPanelProps) {
  return (
    <section className="min-h-[720px] rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">生成结果</h2>
          <p className="text-sm text-stone-500">
            {result ? `来源：${sourceLabel[result.source]}` : "生成后会在这里展示完整提示词"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCopy}
            disabled={!result}
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Clipboard size={16} />
            {copied ? "已复制" : "复制全部"}
          </button>
          <button
            type="button"
            onClick={onManualCopy}
            disabled={!result}
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            手动复制
          </button>
          <button
            type="button"
            onClick={onExportTxt}
            disabled={!result}
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            TXT
          </button>
          <button
            type="button"
            onClick={onExportMarkdown}
            disabled={!result}
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown size={16} />
            Markdown
          </button>
        </div>
      </div>

      {!result && (
        <div className="flex min-h-[560px] items-center justify-center rounded-md border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-sm text-stone-500">
          输入产品信息或粘贴原始提示词后，点击生成提示词。
        </div>
      )}

      {result?.plainText && result.source === "plain-text-ai" && (
        <pre className="whitespace-pre-wrap rounded-md bg-stone-950 p-4 text-sm leading-6 text-stone-100">
          {result.plainText}
        </pre>
      )}

      {result && !(result.plainText && result.source === "plain-text-ai") && (
        <div className="space-y-4 text-sm leading-6 text-stone-800">
          {result.understanding && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
              <h3 className="mb-2 font-semibold text-emerald-950">模型理解摘要</h3>
              <div className="grid gap-1 text-emerald-950">
                <p>
                  <span className="font-medium">产品：</span>
                  {result.understanding.productName}
                </p>
                <p>
                  <span className="font-medium">行业判断：</span>
                  {result.understanding.industryGuess}
                </p>
                <p>
                  <span className="font-medium">卖点拆分：</span>
                  {result.understanding.sellingPoints.join("、") || "未明确，已按模板补齐"}
                </p>
                <p>
                  <span className="font-medium">场景 / 人群 / 风格：</span>
                  {result.understanding.usageScenario} / {result.understanding.targetAudience} /{" "}
                  {result.understanding.videoStyle}
                </p>
                <p>
                  <span className="font-medium">关键动作：</span>
                  {result.understanding.keyActions.join("、") || "展示、演示、测试、推荐"}
                </p>
                <p>
                  <span className="font-medium">物理细节：</span>
                  {result.understanding.physicalDetails.join("、") || "按行业模板补齐"}
                </p>
                <p>
                  <span className="font-medium">信任证明：</span>
                  {result.understanding.trustSignals.join("、") || "实测、对比、反馈"}
                </p>
                <p>
                  <span className="font-medium">保留创意：</span>
                  {result.understanding.preservedCreative}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-md bg-stone-50 p-3">
            <h3 className="mb-1 font-semibold text-stone-950">视频基础设定</h3>
            <p>{result.basicSetting}</p>
          </div>

          {result.shots.map((shot) => (
            <article key={shot.id} className="rounded-md border border-stone-200 p-3">
              <h3 className="mb-2 font-semibold text-stone-950">
                镜头{["一", "二", "三", "四"][shot.id - 1]}：{formatShotTime(shot.time)}，
                {shot.name}
              </h3>
              <p className="mb-2">
                <span className="font-medium text-stone-950">任务：</span>
                {shot.task}
              </p>
              <div className="grid gap-2">
                {Object.entries(dimensionLabels).map(([key, label]) => (
                  <p key={key}>
                    <span className="font-medium text-stone-950">{label}：</span>
                    {shot.dimensions[key as keyof typeof shot.dimensions]}
                  </p>
                ))}
              </div>
            </article>
          ))}

          <div className="rounded-md bg-red-50 p-3">
            <h3 className="mb-1 font-semibold text-red-950">统一负面约束</h3>
            <p>{result.finalNegativePromptCn}</p>
          </div>
          <div className="rounded-md bg-stone-950 p-3 text-stone-100">
            <h3 className="mb-1 font-semibold">English negative prompt</h3>
            <p>{result.finalNegativePromptEn}</p>
          </div>
        </div>
      )}
    </section>
  );
}
