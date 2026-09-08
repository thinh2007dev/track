import { accounts as seedAccounts } from "./mock-data";
import type { BloxAccount } from "./types";

const globalStore = globalThis as unknown as { fruitVaultAccounts?: Map<string, BloxAccount> };
const accountStore = globalStore.fruitVaultAccounts ?? new Map(seedAccounts.map(account => [account.id, account]));
globalStore.fruitVaultAccounts = accountStore;

export function listAccounts() {
  return [...accountStore.values()];
}

export function upsertAccount(account: BloxAccount) {
  accountStore.set(account.id, account);
  return account;
}
