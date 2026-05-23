import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface StatusBannerProps {
  type: "info" | "success" | "warning" | "error";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function StatusBanner({ type, message, actionLabel, onAction }: StatusBannerProps) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-900",
  };
  const Icon = type === "success" ? CheckCircle2 : type === "info" ? Info : AlertTriangle;

  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-sm ${styles[type]}`}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 shrink-0" size={16} />
        <span>{message}</span>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-md border border-current px-2 py-1 text-xs font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
