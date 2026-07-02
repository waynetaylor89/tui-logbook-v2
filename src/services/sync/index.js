import { BackgroundSync } from "./BackgroundSync.js";

let syncInstance;

export function backgroundSync() {
  if (!syncInstance) {
    syncInstance = new BackgroundSync();
  }

  return syncInstance;
}
