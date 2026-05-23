export type CopyOutcome =
  | { ok: true; method: "clipboard" | "fallback" }
  | { ok: false; text: string; message: string };

const legacyCopy = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    const ok = document.execCommand("copy");
    return ok;
  } finally {
    document.body.removeChild(textarea);
  }
};

export const copyText = async (text: string): Promise<CopyOutcome> => {
  if (!text.trim()) {
    return { ok: false, text, message: "没有可复制的内容。" };
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: "clipboard" };
    }
  } catch {
    // Fall through to legacy copy.
  }

  try {
    if (legacyCopy(text)) {
      return { ok: true, method: "fallback" };
    }
  } catch {
    // Fall through to manual copy.
  }

  return {
    ok: false,
    text,
    message: "浏览器阻止了自动复制，请在弹窗中手动全选复制。",
  };
};
