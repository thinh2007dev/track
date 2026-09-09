import { NextRequest, NextResponse } from "next/server";
import { ITEM_REGISTRY } from "../../../lib/item-catalog";
import { findAccount, upsertAccount } from "../../../lib/store";
import { scanEvents } from "../../../lib/scan-events";
import type { BloxAccount, Sea } from "../../../lib/types";

const itemKeys = Object.keys(ITEM_REGISTRY);
type ScanPayload = { robloxUserId: string; username: string; displayName?: string; timestamp: string; stats: { level: number; beli: number; fragments: number; currentFruit: string; race: string; sea: number; melee?: string; sword?: string }; items: { key: string; quantity: number; owned: boolean; permanent?: boolean }[] };
type XeroCheck = { Name?: string; Type?: string; Owned?: boolean; Count?: number; Mastery?: number; Equipped?: boolean };
type XeroReport = { Username?: string; UserId?: number | string; ScannedAt?: number; Stats?: { Level?: number; Beli?: number; Fragment?: number; Fragments?: number; EquippedFruit?: string }; Checks?: XeroCheck[] };

const itemNames = new Map(Object.values(ITEM_REGISTRY).flatMap(item => [
  [normalize(item.id), item.id],
  [normalize(item.name), item.id],
]));

for (const item of Object.values(ITEM_REGISTRY)) {
  const normalizedName = normalize(item.name);
  itemNames.set(normalize(`${item.name} ${item.name}`), item.id);
  itemNames.set(normalize(`${item.id} ${item.id}`), item.id);
  if (item.id === "trex") itemNames.set(normalize("T Rex T Rex"), item.id);
  if (item.id === "sanguine_art") itemNames.set(normalize("Sangunie Art"), item.id);
  if (item.id === "dark_fragment") itemNames.set(normalize("Drak Fragment"), item.id);
  if (normalizedName.endsWith("fruit")) itemNames.set(normalizedName.replace(/fruit$/, ""), item.id);
}

function isValidScan(value: unknown): value is ScanPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ScanPayload>;
  const s = v.stats;
  return typeof v.robloxUserId === "string" && /^\d+$/.test(v.robloxUserId) && typeof v.username === "string" && v.username.length > 0 && v.username.length <= 40 && typeof v.timestamp === "string" && !Number.isNaN(Date.parse(v.timestamp)) && !!s && Number.isInteger(s.level) && s.level >= 0 && s.level <= 10000 && Number.isSafeInteger(s.beli) && s.beli >= 0 && Number.isSafeInteger(s.fragments) && s.fragments >= 0 && Number.isInteger(s.sea) && s.sea >= 1 && s.sea <= 3 && typeof s.currentFruit === "string" && typeof s.race === "string" && Array.isArray(v.items) && v.items.length <= 100 && v.items.every(item => item && itemKeys.includes(item.key) && Number.isInteger(item.quantity) && item.quantity >= 0 && item.quantity <= 9999 && typeof item.owned === "boolean");
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function inferSea(level: number): 1 | 2 | 3 {
  if (level >= 1500) return 3;
  if (level >= 700) return 2;
  return 1;
}

function normalizeXeroReport(value: unknown, existing?: BloxAccount): ScanPayload | null {
  if (!value || typeof value !== "object") return null;
  const report = value as XeroReport;
  const userId = String(report.UserId ?? "");
  const username = String(report.Username ?? "");
  const stats = report.Stats;
  const checks = report.Checks;
  if (!/^\d+$/.test(userId) || !username || !stats || !Array.isArray(checks)) return null;

  const level = Number(stats.Level ?? 0);
  const beli = Number(stats.Beli ?? 0);
  const fragments = Number(stats.Fragments ?? stats.Fragment ?? 0);
  if (!Number.isInteger(level) || !Number.isSafeInteger(beli) || !Number.isSafeInteger(fragments)) return null;

  return {
    robloxUserId: userId,
    username,
    displayName: username,
    timestamp: report.ScannedAt ? new Date(Number(report.ScannedAt) * 1000).toISOString() : new Date().toISOString(),
    stats: {
      level,
      beli,
      fragments,
      currentFruit: String(stats.EquippedFruit ?? existing?.fruit ?? "Unknown"),
      race: existing?.race ?? "Unknown",
      sea: inferSea(level),
      melee: checks.find(item => item.Owned && item.Type === "Melee")?.Name ?? existing?.fightingStyle,
      sword: checks.find(item => item.Owned && item.Type === "Sword")?.Name ?? existing?.swords[0],
    },
    items: checks.map(item => ({
      key: itemNames.get(normalize(String(item.Name ?? ""))) ?? "",
      quantity: item.Owned ? Math.max(1, Number(item.Count ?? 1)) : 0,
      owned: item.Owned === true,
    })).filter(item => item.key && item.quantity <= 9999),
  };
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

  const body = await request.json().catch(() => null);
  const candidateUserId = body && typeof body === "object" ? String((body as Partial<XeroReport>).UserId ?? (body as Partial<ScanPayload>).robloxUserId ?? "") : "";
  const candidateUsername = body && typeof body === "object" ? String((body as Partial<XeroReport>).Username ?? (body as Partial<ScanPayload>).username ?? "") : "";
  const existing = (candidateUserId ? await findAccount(candidateUserId) : undefined) ?? (candidateUsername ? await findAccount(candidateUsername) : undefined);
  const payload = isValidScan(body) ? body : normalizeXeroReport(body, existing);
  if (!payload || !isValidScan(payload)) return NextResponse.json({ error: "Invalid scan payload or item key" }, { status: 400 });
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
    status: existing?.status ?? "Ready", isOnline: true, ownedItems,
    lastUpdated: payload.timestamp, note: existing?.note,
  };
  await upsertAccount(account);
  scanEvents.emit("scan", { accountId: account.id, timestamp: payload.timestamp });
  return NextResponse.json({ data: account, created: !existing }, { status: existing ? 200 : 201 });
}
