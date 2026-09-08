import { NextRequest, NextResponse } from "next/server";
import { ITEM_REGISTRY } from "../../../lib/item-catalog";
import { listAccounts, upsertAccount } from "../../../lib/store";
import { scanEvents } from "../../../lib/scan-events";
import type { BloxAccount, Sea } from "../../../lib/types";

const itemKeys = Object.keys(ITEM_REGISTRY);
type ScanPayload = { robloxUserId: string; username: string; displayName?: string; timestamp: string; stats: { level: number; beli: number; fragments: number; currentFruit: string; race: string; sea: number; melee?: string; sword?: string }; items: { key: string; quantity: number; owned: boolean; permanent?: boolean }[] };

function isValidScan(value: unknown): value is ScanPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ScanPayload>;
  const s = v.stats;
  return typeof v.robloxUserId === "string" && /^\d+$/.test(v.robloxUserId) && typeof v.username === "string" && v.username.length > 0 && v.username.length <= 40 && typeof v.timestamp === "string" && !Number.isNaN(Date.parse(v.timestamp)) && !!s && Number.isInteger(s.level) && s.level >= 0 && s.level <= 10000 && Number.isSafeInteger(s.beli) && s.beli >= 0 && Number.isSafeInteger(s.fragments) && s.fragments >= 0 && Number.isInteger(s.sea) && s.sea >= 1 && s.sea <= 3 && typeof s.currentFruit === "string" && typeof s.race === "string" && Array.isArray(v.items) && v.items.length <= 100 && v.items.every(item => item && itemKeys.includes(item.key) && Number.isInteger(item.quantity) && item.quantity >= 0 && item.quantity <= 9999 && typeof item.owned === "boolean");
}

const rateLimits = new Map<string, number[]>();

export async function POST(request: NextRequest) {
  const secret = process.env.SCANNER_API_KEY ?? (process.env.NODE_ENV !== "production" ? "dev-scanner-key" : undefined);
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized scanner" }, { status: 401 });
  }
  const scannerId = request.headers.get("x-scanner-id") ?? "default";
  const now = Date.now();
  const recent = (rateLimits.get(scannerId) ?? []).filter(time => now - time < 60_000);
  if (recent.length >= 30) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  recent.push(now); rateLimits.set(scannerId, recent);

  const payload = await request.json().catch(() => null);
  if (!isValidScan(payload)) return NextResponse.json({ error: "Invalid scan payload or item key" }, { status: 400 });
  const existing = listAccounts().find(account => account.id === payload.robloxUserId);
  const ownedItems = Object.fromEntries(payload.items.map(item => [item.key, item.owned ? item.quantity : 0]));
  const account: BloxAccount = {
    id: payload.robloxUserId,
    username: payload.username,
    displayName: payload.displayName ?? payload.username,
    level: payload.stats.level,
    maxLevel: existing?.maxLevel ?? 2550,
    sea: `Sea ${payload.stats.sea}` as Sea,
    beli: payload.stats.beli,
    fragments: payload.stats.fragments,
    fruit: payload.stats.currentFruit,
    fruitMastery: existing?.fruitMastery ?? 0,
    fightingStyle: payload.stats.melee ?? existing?.fightingStyle ?? "Unknown",
    swords: payload.stats.sword ? [payload.stats.sword] : existing?.swords ?? [],
    guns: existing?.guns ?? [], accessories: existing?.accessories ?? [], materials: existing?.materials ?? {},
    race: payload.stats.race, raceVersion: existing?.raceVersion ?? "", bountyHonor: existing?.bountyHonor ?? 0,
    awakenedMoves: existing?.awakenedMoves ?? 0, gamepasses: existing?.gamepasses ?? [], legendaryItems: existing?.legendaryItems ?? [],
    status: existing?.status ?? "Ready", isOnline: existing?.isOnline ?? false, ownedItems,
    lastUpdated: payload.timestamp, note: existing?.note,
  };
  upsertAccount(account);
  scanEvents.emit("scan", { accountId: account.id, timestamp: payload.timestamp });
  return NextResponse.json({ data: account, created: !existing }, { status: existing ? 200 : 201 });
}
