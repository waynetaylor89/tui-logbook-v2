export class BackgroundSync {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  add(task) {
    if (typeof task !== "function") {
      throw new Error("background sync task must be a function.");
    }

    this.queue.push(task);
  }

  async run() {
    if (this.running) {
      return;
    }

    this.running = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      try {
        await task();
      } catch {
        // Keep sync resilient so one failing task does not block the queue.
      }
    }

    this.running = false;
  }
}
