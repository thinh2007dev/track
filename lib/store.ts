import { accounts as seedAccounts } from "./mock-data";
import type { BloxAccount } from "./types";

const globalStore = globalThis as unknown as { fruitVaultAccounts?: Map<string, BloxAccount> };
const accountStore = globalStore.fruitVaultAccounts ?? new Map(seedAccounts.map(account => [account.id, account]));
globalStore.fruitVaultAccounts = accountStore;
const ONLINE_WINDOW_MS = 90_000;

type SupabaseAccountRow = {
  id: string;
  username: string;
  data: BloxAccount;
  updated_at?: string;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function supabaseHeaders(key: string) {
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
  };
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseConfig());
}

function dedupeAccounts(accounts: BloxAccount[]) {
  const seenUsernames = new Set<string>();
  return accounts.map(account => ({
    ...account,
    isOnline: Date.now() - new Date(account.lastUpdated).getTime() <= ONLINE_WINDOW_MS,
  })).filter(account => {
    const key = account.username.trim().toLowerCase();
    if (seenUsernames.has(key)) return false;
    seenUsernames.add(key);
    return true;
  });
}

function listMemoryAccounts() {
  return dedupeAccounts([...accountStore.values()]);
}

function upsertMemoryAccount(account: BloxAccount) {
  for (const [id, existing] of accountStore.entries()) {
    if (id !== account.id && existing.username.trim().toLowerCase() === account.username.trim().toLowerCase()) {
      accountStore.delete(id);
    }
  }
  accountStore.set(account.id, account);
  return account;
}

function clearMemoryAccounts() {
  accountStore.clear();
}

export async function listAccounts() {
  const config = getSupabaseConfig();
  if (!config) return listMemoryAccounts();

  const response = await fetch(`${config.url}/rest/v1/blox_accounts?select=data&order=updated_at.desc`, {
    headers: supabaseHeaders(config.key),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase list failed: ${response.status}`);

  const rows = (await response.json()) as Pick<SupabaseAccountRow, "data">[];
  return dedupeAccounts(rows.map(row => row.data));
}

export async function findAccount(idOrUsername: string) {
  const needle = idOrUsername.trim().toLowerCase();
  return (await listAccounts()).find(account => account.id === idOrUsername || account.username.trim().toLowerCase() === needle);
}

export async function upsertAccount(account: BloxAccount) {
  const config = getSupabaseConfig();
  if (!config) return upsertMemoryAccount(account);

  await fetch(`${config.url}/rest/v1/blox_accounts?username=eq.${encodeURIComponent(account.username)}&id=neq.${encodeURIComponent(account.id)}`, {
    method: "DELETE",
    headers: supabaseHeaders(config.key),
  });

  const row: SupabaseAccountRow = {
    id: account.id,
    username: account.username,
    data: account,
    updated_at: account.lastUpdated,
  };
  const response = await fetch(`${config.url}/rest/v1/blox_accounts?on_conflict=id`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(config.key),
      prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) throw new Error(`Supabase upsert failed: ${response.status}`);

  return account;
}

export async function clearAccounts() {
  const config = getSupabaseConfig();
  if (!config) {
    clearMemoryAccounts();
    return;
  }

  const response = await fetch(`${config.url}/rest/v1/blox_accounts?id=not.is.null`, {
    method: "DELETE",
    headers: supabaseHeaders(config.key),
  });
  if (!response.ok) throw new Error(`Supabase clear failed: ${response.status}`);
}
