import { accounts as seedAccounts } from "./mock-data";
import type { BloxAccount } from "./types";

const globalStore = globalThis as unknown as { fruitVaultAccounts?: Map<string, BloxAccount> };
const accountStore = globalStore.fruitVaultAccounts ?? new Map(seedAccounts.map(account => [account.id, account]));
globalStore.fruitVaultAccounts = accountStore;
const ONLINE_WINDOW_MS = 90_000;

type SupabaseAccountRow = {
  id: string;
  username: string;
  data: unknown;
  updated_at?: string;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (key.startsWith("sb_publishable_")) {
    throw new Error("Supabase server key dang dung publishable key thay vi secret/service-role key");
  }
  return { url: url.replace(/\/$/, ""), key };
}

function supabaseHeaders(key: string) {
  const headers: Record<string, string> = {
    apikey: key,
    "content-type": "application/json",
  };
  // Legacy service_role keys are JWTs and may be sent as Bearer tokens.
  // New sb_secret_* keys must only be sent through the apikey header.
  if (key.startsWith("eyJ")) headers.authorization = `Bearer ${key}`;
  return headers;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeInventory(value: unknown) {
  const source = asRecord(value);
  return Object.fromEntries(Object.entries(source).map(([key, count]): [string, number] => [
    key,
    Math.max(0, Math.trunc(numberValue(count, 0))),
  ]));
}

function normalizeAccount(value: unknown, row?: SupabaseAccountRow): BloxAccount | null {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  const data = asRecord(parsed);
  const id = text(data.id, row?.id ?? "");
  const username = text(data.username, row?.username ?? "");
  if (!id || !username) return null;

  const level = Math.max(0, Math.trunc(numberValue(data.level, 0)));
  const seaValue = text(data.sea, level >= 1500 ? "Sea 3" : level >= 700 ? "Sea 2" : "Sea 1");
  const sea = seaValue === "Sea 1" || seaValue === "Sea 2" || seaValue === "Sea 3" ? seaValue : "Sea 1";
  const status = data.status === "Farming" || data.status === "Paused" || data.status === "Ready" ? data.status : "Ready";
  const lastUpdated = text(data.lastUpdated, row?.updated_at ?? new Date().toISOString());

  return {
    id,
    username,
    displayName: text(data.displayName, username),
    level,
    maxLevel: Math.max(1, Math.trunc(numberValue(data.maxLevel, 2550))),
    sea,
    beli: Math.max(0, Math.trunc(numberValue(data.beli, 0))),
    fragments: Math.max(0, Math.trunc(numberValue(data.fragments, 0))),
    fruit: text(data.fruit, "Unknown"),
    fruitMastery: Math.max(0, Math.trunc(numberValue(data.fruitMastery, 0))),
    fightingStyle: text(data.fightingStyle, "Unknown"),
    swords: stringList(data.swords),
    guns: stringList(data.guns),
    accessories: stringList(data.accessories),
    materials: normalizeInventory(data.materials),
    race: text(data.race, "Unknown"),
    raceVersion: text(data.raceVersion),
    bountyHonor: Math.max(0, Math.trunc(numberValue(data.bountyHonor, 0))),
    awakenedMoves: Math.max(0, Math.trunc(numberValue(data.awakenedMoves, 0))),
    gamepasses: stringList(data.gamepasses),
    legendaryItems: stringList(data.legendaryItems),
    status,
    isOnline: Boolean(data.isOnline),
    ownedItems: normalizeInventory(data.ownedItems),
    lastUpdated,
    note: text(data.note) || undefined,
  };
}

export function isSupabaseConfigured() {
  try {
    return Boolean(getSupabaseConfig());
  } catch {
    return false;
  }
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

  const response = await fetch(`${config.url}/rest/v1/blox_accounts?select=id,username,data,updated_at&order=updated_at.desc`, {
    headers: supabaseHeaders(config.key),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Supabase list failed: ${response.status}${body ? ` ${body.slice(0, 160)}` : ""}`);
  }

  const rows = (await response.json()) as SupabaseAccountRow[];
  return dedupeAccounts(rows.map(row => {
    try {
      return normalizeAccount(row.data, row);
    } catch {
      return null;
    }
  }).filter((account): account is BloxAccount => Boolean(account)));
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
    signal: AbortSignal.timeout(8_000),
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
    signal: AbortSignal.timeout(8_000),
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
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Supabase clear failed: ${response.status}`);
}
