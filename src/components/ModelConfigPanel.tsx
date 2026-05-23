import { PlugZap, Save } from "lucide-react";
import type { ModelConfig, TestResult } from "../types/prompt";

interface ModelConfigPanelProps {
  config: ModelConfig;
  testResult: TestResult | null;
  isTesting: boolean;
  onChange: (config: ModelConfig) => void;
  onSave: () => void;
  onTest: () => void;
}

const fieldClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function ModelConfigPanel({
  config,
  testResult,
  isTesting,
  onChange,
  onSave,
  onTest,
}: ModelConfigPanelProps) {
  const update = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-stone-900">模型配置</h2>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={config.enableAI}
            onChange={(event) => update("enableAI", event.target.checked)}
          />
          启用 AI
        </label>
      </div>

      <div className="grid gap-3">
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>API Base URL</span>
          <input
            className={fieldClass}
            value={config.apiBaseUrl}
            onChange={(event) => update("apiBaseUrl", event.target.value)}
            placeholder="例如：https://api.example.com/v1"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>API Key</span>
          <input
            className={fieldClass}
            type="password"
            value={config.apiKey}
            onChange={(event) => update("apiKey", event.target.value)}
            placeholder="不会写入源码，仅保存到本机浏览器"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-stone-700">
          <span>Model Name</span>
          <input
            className={fieldClass}
            value={config.modelName}
            onChange={(event) => update("modelName", event.target.value)}
            placeholder="例如：mimo-v2.5-pro / mimo-v2.5 / deepseek-chat / qwen-plus"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onTest}
          disabled={isTesting}
          className="inline-flex items-center gap-2 rounded-md border border-emerald-600 bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PlugZap size={16} />
          {isTesting ? "测试中" : "测试连接"}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-400"
        >
          <Save size={16} />
          保存配置
        </button>
      </div>

      {testResult && (
        <p className={`mt-3 text-sm ${testResult.ok ? "text-emerald-700" : "text-red-700"}`}>
          {testResult.message}
        </p>
      )}
      <p className="mt-3 text-xs leading-5 text-stone-500">
        MiMo 建议使用小写模型 ID，例如 mimo-v2.5-pro 或 mimo-v2.5。API Key
        仅临时保存在浏览器 localStorage，适合本地个人使用；如果接口遇到 CORS，可改填兼容代理地址。
      </p>
    </section>
  );
}
