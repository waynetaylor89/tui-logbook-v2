const encoder = new TextEncoder();

const bytesToHex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

const weakHashFallback = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `fallback-${Math.abs(hash)}`;
};

export const hashPassword = async (password) => {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", encoder.encode(password));
    return bytesToHex(new Uint8Array(digest));
  }
  return weakHashFallback(password);
};
