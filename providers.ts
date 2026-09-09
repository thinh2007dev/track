export interface PlayerStats {
  level: number;
  beli: number;
  fragments: number;
  currentFruit: string;
  race: string;
  sea: 1 | 2 | 3;
}

export interface InventoryItem {
  key: string;
  quantity: number;
  owned: boolean;
  permanent?: boolean;
}

export interface BloxFruitsDataProvider {
  getPlayerStats(): Promise<PlayerStats>;
  getInventory(): Promise<InventoryItem[]>;
}

export class MockBloxFruitsProvider implements BloxFruitsDataProvider {
  async getPlayerStats(): Promise<PlayerStats> {
    return { level: 2550, beli: 12500000, fragments: 8200, currentFruit: "Magnet", race: "Human V3", sea: 3 };
  }
  async getInventory(): Promise<InventoryItem[]> {
    return [{ key: "magnet", quantity: 1, owned: true }, { key: "godhuman", quantity: 1, owned: true }];
  }
}

/** Implement only against a data source that Blox Fruits explicitly authorizes. */
export abstract class AuthorizedGameProvider implements BloxFruitsDataProvider {
  abstract getPlayerStats(): Promise<PlayerStats>;
  abstract getInventory(): Promise<InventoryItem[]>;
}

export class RobloxPresenceProvider {
  async getPresence(robloxUserId: string) {
    const response = await fetch("https://presence.roblox.com/v1/presence/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userIds: [Number(robloxUserId)] }),
    });
    if (!response.ok) throw new Error(`Roblox presence request failed: ${response.status}`);
    const data = await response.json();
    const presence = data.userPresences?.[0];
    return { isOnline: Boolean(presence && presence.userPresenceType !== 0), checkedAt: new Date().toISOString() };
  }
}
