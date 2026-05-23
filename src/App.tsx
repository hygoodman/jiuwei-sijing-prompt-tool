import { useMemo, useState } from "react";
import ActionBar from "./components/ActionBar";
import GenerationProgress from "./components/GenerationProgress";
import GenerationModePanel from "./components/GenerationModePanel";
import InputPanel from "./components/InputPanel";
import ManualCopyDialog from "./components/ManualCopyDialog";
import ModelConfigPanel from "./components/ModelConfigPanel";
import OutputPanel from "./components/OutputPanel";
import PromptTextarea from "./components/PromptTextarea";
import StatusBanner from "./components/StatusBanner";
import TemplatePreview from "./components/TemplatePreview";
import { defaultFormData } from "./lib/constants";
import { openAICompatibleProvider } from "./lib/aiGenerator";
import { copyText } from "./lib/clipboard";
import { exportMarkdown, exportTxt } from "./lib/exportUtils";
import { generateLocalPrompt } from "./lib/ruleGenerator";
import { loadModelConfig, saveModelConfig } from "./lib/storage";
import { parseAIJsonResult, validateAndCompleteResult } from "./lib/outputValidator";
import type {
  GenerationMode,
  InputMode,
  ModelConfig,
  PromptFormData,
  PromptGenerationRequest,
  PromptResult,
  TestResult,
} from "./types/prompt";

const hasCompleteConfig = (config: ModelConfig) =>
  Boolean(config.apiBaseUrl.trim() && config.apiKey.trim() && config.modelName.trim());

export default function App() {
  const initialConfig = useMemo(() => loadModelConfig(), []);
  const [inputMode, setInputMode] = useState<InputMode>("hybrid");
  const [generationMode, setGenerationMode] = useState<GenerationMode>(
    hasCompleteConfig(initialConfig) && initialConfig.enableAI ? "ai" : "local",
  );
  const [formData, setFormData] = useState<PromptFormData>({
    ...defaultFormData,
  });
  const [rawPrompt, setRawPrompt] = useState("");
  const [modelConfig, setModelConfig] = useState<ModelConfig>(initialConfig);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [status, setStatus] = useState<{
    type: "info" | "success" | "warning" | "error";
    message: string;
    actionLabel?: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualCopyText, setManualCopyText] = useState("");
  const [progress, setProgress] = useState({ percent: 0, label: "" });

  const request = useMemo<PromptGenerationRequest>(
    () => ({
      inputMode,
      generationMode,
      formData,
      rawPrompt,
    }),
    [inputMode, generationMode, formData, rawPrompt],
  );

  const normalizeRequestForMode = (
    baseRequest: PromptGenerationRequest,
    mode: GenerationMode = generationMode,
  ): PromptGenerationRequest => {
    if (baseRequest.inputMode === "form") {
      return { ...baseRequest, generationMode: mode, rawPrompt: "" };
    }

    if (baseRequest.inputMode === "raw") {
      return {
        ...baseRequest,
        generationMode: mode,
        formData: {
          ...defaultFormData,
          industry: "general",
          ctaType: baseRequest.formData.ctaType,
          outputLanguage: baseRequest.formData.outputLanguage,
          enablePromotion: baseRequest.formData.enablePromotion,
          enableCartGuide: baseRequest.formData.enableCartGuide,
          enableBilingualNegative: baseRequest.formData.enableBilingualNegative,
        },
      };
    }

    return { ...baseRequest, generationMode: mode };
  };

  const createLocalResult = (mode: GenerationMode = generationMode) =>
    generateLocalPrompt(normalizeRequestForMode(request, mode));

  const runLocalFallback = () => {
    const local = createLocalResult("local");
    setGenerationMode("local");
    setResult(local);
    setStatus({
      type: "warning",
      message: "已切换为本地规则补全，结果保持完整四镜九维结构。",
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCopied(false);
    setStatus(null);
    setProgress({
      percent: generationMode === "ai" ? 12 : 0,
      label: generationMode === "ai" ? "正在理解输入内容..." : "",
    });

    const localFallback = createLocalResult(generationMode);

    if (generationMode === "local") {
      setResult(localFallback);
      setStatus({ type: "success", message: "已使用本地规则生成完整提示词。" });
      setIsGenerating(false);
      setProgress({ percent: 0, label: "" });
      return;
    }

    if (!modelConfig.enableAI || !hasCompleteConfig(modelConfig)) {
      const local = {
        ...localFallback,
        warnings: ["AI 未启用或配置缺失，已自动使用本地规则补全。"],
      };
      setResult(local);
      setGenerationMode("local");
      setStatus({
        type: "warning",
        message: "AI 未启用或配置缺失，已自动使用本地规则补全。",
      });
      setIsGenerating(false);
      setProgress({ percent: 0, label: "" });
      return;
    }

    try {
      const aiRequest = normalizeRequestForMode(request, "ai");
      setProgress({ percent: 32, label: "正在调用模型理解并重写提示词..." });
      const aiResponse = await openAICompatibleProvider.generatePrompt(modelConfig, aiRequest);
      setProgress({ percent: 72, label: "正在解析 AI 返回结构..." });
      try {
        const parsed = parseAIJsonResult(aiResponse.content);
        setProgress({ percent: 88, label: "正在校验四镜九维并补齐缺失字段..." });
        const completed = validateAndCompleteResult(parsed, localFallback, "ai");
        const source: PromptResult["source"] = completed.warnings?.length
          ? "ai-with-local-fallback"
          : "ai";
        const finalResult = { ...completed, source };
        setResult(finalResult);
        setProgress({ percent: 100, label: "完成，已生成结构化提示词。" });
        setStatus({
          type: source === "ai" ? "success" : "warning",
          message:
            source === "ai"
              ? "AI 已返回标准结构化结果。"
              : "AI 结果存在缺失字段，已用本地规则补齐。",
        });
      } catch {
        setResult({
          ...localFallback,
          source: "ai-with-local-fallback",
          warnings: [
            "AI 返回格式不标准，已自动使用本地结构化结果兜底。原因通常是模型输出了 Markdown、解释文字、尾随逗号、中文字段名或多段文本，导致浏览器无法直接解析为 JSON。",
          ],
        });
        setProgress({ percent: 100, label: "AI 格式异常，已切换结构化兜底结果。" });
        setStatus({
          type: "warning",
          message: "AI 返回格式不标准，已自动切换为本地结构化兜底结果。",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: `AI 调用失败：${error instanceof Error ? error.message : "未知错误"}`,
        actionLabel: "切换本地规则补全",
      });
      setResult({
        ...localFallback,
        source: "ai-with-local-fallback",
        warnings: ["AI 调用失败，当前展示本地规则兜底结果。"],
      });
      setProgress({ percent: 100, label: "AI 调用失败，已展示兜底结果。" });
    } finally {
      setIsGenerating(false);
      window.setTimeout(() => setProgress({ percent: 0, label: "" }), 1200);
    }
  };

  const handleClear = () => {
    setFormData({ ...defaultFormData });
    setRawPrompt("");
    setResult(null);
    setStatus(null);
    setCopied(false);
    setInputMode("hybrid");
  };

  const handleCopy = async () => {
    if (!result) return;
    const outcome = await copyText(result.copyReadyPrompt);
    if (outcome.ok) {
      setCopied(true);
      setStatus({
        type: "success",
        message: outcome.method === "clipboard" ? "已复制到剪贴板。" : "已通过兼容方式复制到剪贴板。",
      });
      window.setTimeout(() => setCopied(false), 1600);
      return;
    }

    setManualCopyText(outcome.text);
    setStatus({ type: "warning", message: outcome.message });
  };

  const handleSaveConfig = () => {
    saveModelConfig(modelConfig);
    if (hasCompleteConfig(modelConfig) && modelConfig.enableAI) {
      setGenerationMode("ai");
    }
    setStatus({ type: "success", message: "模型配置已保存到本机浏览器。" });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    const outcome = await openAICompatibleProvider.testConnection(modelConfig);
    setTestResult(outcome);
    setIsTesting(false);
  };

  const handleSwitchMode = (mode: GenerationMode) => {
    setGenerationMode(mode);
    setStatus({
      type: "info",
      message: mode === "ai" ? "已切换为 AI 智能补全。" : "已切换为本地规则补全。",
    });
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-6 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        {manualCopyText && (
          <ManualCopyDialog text={manualCopyText} onClose={() => setManualCopyText("")} />
        )}

        <header className="mb-6 border-b border-stone-200 pb-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-stone-950">
                九维四镜提示词补全工具
              </h1>
              <p className="mt-2 text-base text-stone-600">
                输入产品信息或粘贴原始提示词，一键生成15秒电商带货视频提示词
              </p>
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
              本地规则 + OpenAI 兼容 AI Provider
            </div>
          </div>
        </header>

        {status && (
          <div className="mb-4">
            <StatusBanner
              type={status.type}
              message={status.message}
              actionLabel={status.actionLabel}
              onAction={status.actionLabel ? runLocalFallback : undefined}
            />
          </div>
        )}

        <GenerationProgress
          active={isGenerating || progress.percent > 0}
          percent={progress.percent}
          label={progress.label}
        />

        {result?.warnings?.length ? (
          <div className="mb-4 grid gap-2">
            {result.warnings.map((warning) => (
              <StatusBanner key={warning} type="warning" message={warning} />
            ))}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(420px,0.92fr)_minmax(560px,1.08fr)]">
          <div className="space-y-4">
            <InputPanel
              inputMode={inputMode}
              formData={formData}
              onInputModeChange={setInputMode}
              onFormChange={setFormData}
            />
            <PromptTextarea value={rawPrompt} onChange={setRawPrompt} />
            <TemplatePreview industry={formData.industry} />
            <ModelConfigPanel
              config={modelConfig}
              testResult={testResult}
              isTesting={isTesting}
              onChange={setModelConfig}
              onSave={handleSaveConfig}
              onTest={handleTestConnection}
            />
            <GenerationModePanel
              generationMode={generationMode}
              hasConfig={hasCompleteConfig(modelConfig)}
              onChange={handleSwitchMode}
            />
            <ActionBar
              generationMode={generationMode}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
              onClear={handleClear}
              onRegenerate={handleGenerate}
              onSwitchMode={handleSwitchMode}
            />
          </div>

          <OutputPanel
            result={result}
            copied={copied}
            onCopy={handleCopy}
            onExportTxt={() => result && exportTxt(result)}
            onExportMarkdown={() => result && exportMarkdown(result)}
          />
        </div>
      </div>
    </main>
  );
}
