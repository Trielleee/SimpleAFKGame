export class GameLoop {
  constructor(eventBus, intervalMs = 1000) {
    this.eventBus = eventBus;
    this.intervalMs = intervalMs;
    this.timerId = null;
  }

  start() {
    if (this.timerId) return;

    this.timerId = window.setInterval(() => {
      this.eventBus.emit("game:tick", { deltaMs: this.intervalMs });
    }, this.intervalMs);
  }

  stop() {
    if (!this.timerId) return;

    window.clearInterval(this.timerId);
    this.timerId = null;
  }
}
