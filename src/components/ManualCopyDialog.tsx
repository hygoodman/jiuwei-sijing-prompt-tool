import { X } from "lucide-react";

interface ManualCopyDialogProps {
  text: string;
  onClose: () => void;
}

export default function ManualCopyDialog({ text, onClose }: ManualCopyDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">手动复制</h2>
            <p className="text-sm text-stone-500">浏览器阻止了自动复制，可以在这里全选文本后复制。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-300 p-2 text-stone-600 hover:border-emerald-400"
            aria-label="关闭手动复制弹窗"
          >
            <X size={18} />
          </button>
        </div>
        <textarea
          className="h-[54vh] w-full rounded-md border border-stone-300 bg-stone-50 p-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          value={text}
          readOnly
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
        />
      </div>
    </div>
  );
}
