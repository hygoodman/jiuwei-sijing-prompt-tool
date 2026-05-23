interface PromptTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PromptTextarea({ value, onChange }: PromptTextareaProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <label className="space-y-2 text-sm font-medium text-stone-700">
        <span>原始提示词</span>
        <textarea
          className="min-h-40 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="粘贴你的初始提示词，工具会自动提取产品、卖点、场景、风格和限制条件，并按九维四镜补全。"
        />
      </label>
    </section>
  );
}
