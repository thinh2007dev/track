import type { BloxAccount } from "./types";

// Production starts empty. Accounts arrive from an authorized scanner payload
// or from the browser-local PowerShell test importer.
export const accounts: BloxAccount[] = [];
