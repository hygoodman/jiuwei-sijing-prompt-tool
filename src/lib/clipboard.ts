export type CopyOutcome =
  | { ok: true; method: "clipboard" | "fallback" }
  | { ok: false; text: string; message: string };

const legacyCopy = async (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "0";
  textarea.style.top = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0.01";
  textarea.style.zIndex = "-1";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    const ok = document.execCommand("copy");
    await new Promise((resolve) => window.setTimeout(resolve, 80));
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
    if (await legacyCopy(text)) {
      return { ok: true, method: "fallback" };
    }
  } catch {
    // Fall through to modern clipboard copy.
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: "clipboard" };
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
