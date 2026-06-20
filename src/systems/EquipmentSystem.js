import { EQUIPMENT_SLOTS, QUALITIES, SLOT_STAT_POOLS } from "../data/equipment.js";
import { createId } from "../utils/id.js";
import { pickOne, pickWeighted, randomInt } from "../utils/random.js";

export class EquipmentSystem {
  constructor(gameState, eventBus) {
    this.gameState = gameState;
    this.eventBus = eventBus;
  }

  init() {
    this.eventBus.on("inventory:equipRequested", ({ itemId }) => {
      this.equipFromInventory(itemId);
    });
  }

  createDrop(level) {
    const slot = pickOne(Object.keys(EQUIPMENT_SLOTS));
    const quality = pickWeighted(Object.values(QUALITIES));
    const stats = this.rollStats(slot, quality, level);

    return {
      id: createId("item"),
      name: `${quality.name}${EQUIPMENT_SLOTS[slot]}`,
      slot,
      quality: quality.id,
      level,
      stats,
      sellValue: this.calculateSellValue(level, quality, stats),
    };
  }

  rollStats(slot, quality, level) {
    const statPool = SLOT_STAT_POOLS[slot];
    if (!statPool?.length) return {};

    const statCount = Math.min(randomInt(quality.statCount[0], quality.statCount[1]), statPool.length);
    const selectedStats = this.pickUniqueWeighted(statPool, statCount);
    const stats = {};

    for (const statConfig of selectedStats) {
      const levelScale = 1 + level * 0.18;
      const qualityScale = this.randomFloat(quality.multiplierRange[0], quality.multiplierRange[1]);
      const variance = this.randomFloat(quality.variance[0], quality.variance[1]);
      const rawValue = statConfig.base * levelScale * qualityScale * variance;
      stats[statConfig.stat] = this.formatStatValue(statConfig.stat, rawValue);
    }

    return stats;
  }

  pickUniqueWeighted(statPool, count) {
    const remaining = [...statPool];
    const selected = [];

    while (selected.length < count && remaining.length > 0) {
      const picked = pickWeighted(remaining);
      selected.push(picked);
      remaining.splice(remaining.indexOf(picked), 1);
    }

    return selected;
  }

  calculateSellValue(level, quality, stats) {
    const statScore = Object.entries(stats).reduce((score, [stat, value]) => {
      const normalizedValue = stat === "attackSpeed" ? value * 100 : value;
      return score + normalizedValue;
    }, 0);

    const baseValue = level * 5 + statScore * 2.2;
    const marketVariance = this.randomFloat(0.9, 1.15);
    return Math.max(1, Math.round(baseValue * quality.sellMultiplier * marketVariance));
  }

  randomFloat(min, max) {
    return min + Math.random() * (max - min);
  }

  formatStatValue(stat, value) {
    if (stat === "attackSpeed") {
      return Number(value.toFixed(3));
    }

    return Math.max(1, Math.round(value));
  }

  equipFromInventory(itemId) {
    const state = this.gameState.getMutableState();
    const player = state.player;
    if (!player) return;

    const itemIndex = state.inventory.items.findIndex((item) => item.id === itemId);
    if (itemIndex < 0) return;

    const [item] = state.inventory.items.splice(itemIndex, 1);
    const previous = player.equipment[item.slot];
    player.equipment[item.slot] = item;

    if (previous) {
      state.inventory.items.push(previous);
    }

    this.eventBus.emit("equipment:changed", { slot: item.slot, item });
    this.eventBus.emit("combat:log", { message: `\u88c5\u5907\u4e86 ${item.name}` });
    this.eventBus.emit("ui:refreshRequested");
  }

  getEquipmentStats(equipment) {
    const stats = {
      attack: 0,
      defense: 0,
      maxHp: 0,
      attackSpeed: 0,
    };

    for (const item of Object.values(equipment)) {
      if (!item) continue;
      for (const [key, value] of Object.entries(item.stats)) {
        stats[key] = (stats[key] ?? 0) + value;
      }
    }

    return stats;
  }
}
