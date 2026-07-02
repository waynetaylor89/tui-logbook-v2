const CACHE_NAMESPACE = "ops-live-flights";
const DEFAULT_TTL_MS = 30 * 60 * 1000;

function hasLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function cacheKey(key) {
  return `${CACHE_NAMESPACE}:${key}`;
}

export function setCache(key, data, ttlMs = DEFAULT_TTL_MS) {
  if (!hasLocalStorage()) return;

  const payload = {
    cachedAt: Date.now(),
    expiresAt: Date.now() + Number(ttlMs || DEFAULT_TTL_MS),
    data,
  };

  window.localStorage.setItem(cacheKey(key), JSON.stringify(payload));
}

export function getCache(key) {
  if (!hasLocalStorage()) return null;

  const raw = window.localStorage.getItem(cacheKey(key));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getValidCache(key) {
  const cached = getCache(key);
  if (!cached) return null;

  if (!cached.expiresAt || Date.now() > Number(cached.expiresAt)) {
    return null;
  }

  return cached;
}

export function isOffline() {
  if (typeof navigator === "undefined") return false;
  return !navigator.onLine;
}

export function getDefaultCacheTtlMs() {
  return DEFAULT_TTL_MS;
}
