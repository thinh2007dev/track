import { EventEmitter } from "node:events";

const globalEvents = globalThis as unknown as { fruitVaultEvents?: EventEmitter };
export const scanEvents = globalEvents.fruitVaultEvents ?? new EventEmitter();
globalEvents.fruitVaultEvents = scanEvents;
scanEvents.setMaxListeners(100);
