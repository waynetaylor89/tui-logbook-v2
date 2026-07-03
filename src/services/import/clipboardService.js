export async function readClipboardText() {
  if (typeof navigator === "undefined") {
    return { ok: false, code: "unavailable", error: "Clipboard is not available in this environment." };
  }

  if (!navigator.clipboard?.readText) {
    return { ok: false, code: "unsupported", error: "Clipboard API is not supported in this browser." };
  }

  try {
    if (navigator.permissions?.query) {
      try {
        const result = await navigator.permissions.query({ name: "clipboard-read" });
        if (result?.state === "denied") {
          return { ok: false, code: "denied", error: "Clipboard permission denied." };
        }
      } catch {
        // Permission checks are not supported in all browsers.
      }
    }

    const text = await navigator.clipboard.readText();
    return { ok: true, text: String(text || "") };
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("denied") || message.includes("permission")) {
      return { ok: false, code: "denied", error: "Clipboard permission denied." };
    }

    return { ok: false, code: "failed", error: "Could not read clipboard." };
  }
}
