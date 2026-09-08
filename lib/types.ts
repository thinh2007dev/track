export type Sea = "Sea 1" | "Sea 2" | "Sea 3";
export type AccountStatus = "Ready" | "Farming" | "Paused";

export interface BloxAccount {
  id: string;
  username: string;
  displayName: string;
  level: number;
  maxLevel: number;
  sea: Sea;
  beli: number;
  fragments: number;
  fruit: string;
  fruitMastery: number;
  fightingStyle: string;
  swords: string[];
  guns: string[];
  accessories: string[];
  materials: Record<string, number>;
  race: string;
  raceVersion: string;
  bountyHonor: number;
  awakenedMoves: number;
  gamepasses: string[];
  legendaryItems: string[];
  status: AccountStatus;
  lastUpdated: string;
  note?: string;
}

export interface AccountDataSource {
  getAccounts(): Promise<BloxAccount[]>;
}
