class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, value);
  }

  removeItem(key) {
    this.store.delete(key);
  }
}

export class OfflineCache {
  constructor(namespace = "ops-cache") {
    this.namespace = namespace;
    this.storage = this.resolveStorage();
  }

  resolveStorage() {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }

    return new MemoryCache();
  }

  makeKey(key) {
    return `${this.namespace}:${key}`;
  }

  set(key, value) {
    this.storage.setItem(this.makeKey(key), JSON.stringify(value));
  }

  get(key, fallback = null) {
    const raw = this.storage.getItem(this.makeKey(key));
    if (raw == null) {
      return fallback;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  remove(key) {
    this.storage.removeItem(this.makeKey(key));
  }
}
