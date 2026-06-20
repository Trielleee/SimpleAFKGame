import { EventBus } from "./core/EventBus.js";
import { GameLoop } from "./core/GameLoop.js";
import { GameState } from "./core/GameState.js";
import { CharacterSystem } from "./systems/CharacterSystem.js";
import { CombatSystem } from "./systems/CombatSystem.js";
import { EquipmentSystem } from "./systems/EquipmentSystem.js";
import { InventorySystem } from "./systems/InventorySystem.js";
import { MapSystem } from "./systems/MapSystem.js";
import { MonsterSystem } from "./systems/MonsterSystem.js";
import { OfflineRewardSystem } from "./systems/OfflineRewardSystem.js";
import { SaveSystem } from "./systems/SaveSystem.js";
import { AppUI } from "./ui/AppUI.js";

const eventBus = new EventBus();
const gameState = new GameState();

const equipmentSystem = new EquipmentSystem(gameState, eventBus);
const characterSystem = new CharacterSystem(gameState, eventBus, equipmentSystem);
const mapSystem = new MapSystem(gameState, eventBus);
const monsterSystem = new MonsterSystem();
const inventorySystem = new InventorySystem(gameState, eventBus, characterSystem);
const combatSystem = new CombatSystem(
  gameState,
  eventBus,
  mapSystem,
  monsterSystem,
  characterSystem,
  equipmentSystem,
);
const saveSystem = new SaveSystem(gameState, eventBus);
const offlineRewardSystem = new OfflineRewardSystem(
  gameState,
  eventBus,
  mapSystem,
  characterSystem,
  equipmentSystem,
  inventorySystem,
);
const uiController = new AppUI(gameState, eventBus, characterSystem);
const gameLoop = new GameLoop(eventBus, 1000);

saveSystem.init();
equipmentSystem.init();
characterSystem.init();
mapSystem.init();
inventorySystem.init();
combatSystem.init();
uiController.init();
offlineRewardSystem.applyOnLoad();
gameLoop.start();
window.__simpleAfkReady = true;
