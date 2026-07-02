import { OfflineCache } from "./OfflineCache.js";

let cacheInstance;

export function offlineCache(namespace = "ops-cache") {
  if (!cacheInstance) {
    cacheInstance = new OfflineCache(namespace);
  }

  return cacheInstance;
}
