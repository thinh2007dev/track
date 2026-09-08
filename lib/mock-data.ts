import type { BloxAccount } from "./types";

export const accounts: BloxAccount[] = [
  {
    id: "acc-001", username: "DragonKeeper_01", displayName: "Kai", level: 2550, maxLevel: 2550, sea: "Sea 3",
    beli: 128400000, fragments: 86450, fruit: "Kitsune", fruitMastery: 435, fightingStyle: "Godhuman",
    swords: ["Cursed Dual Katana", "Dark Blade", "Hallow Scythe"], guns: ["Soul Guitar", "Serpent Bow"],
    accessories: ["Kitsune Ribbon", "Pale Scarf"], materials: { "Dragon Scale": 42, "Mystic Droplet": 118, "Demonic Wisp": 16 },
    race: "Ghoul", raceVersion: "V4", bountyHonor: 8950000, awakenedMoves: 5,
    gamepasses: ["2x Mastery", "2x Money", "Fruit Notifier"], legendaryItems: ["Dark Fragment", "Mirror Fractal"],
    status: "Ready", lastUpdated: "2026-09-08T05:18:00Z", note: "Main PvP account"
  },
  {
    id: "acc-002", username: "MoonFarm_22", displayName: "Luna", level: 2478, maxLevel: 2550, sea: "Sea 3",
    beli: 45600000, fragments: 32100, fruit: "Dough", fruitMastery: 387, fightingStyle: "Sanguine Art",
    swords: ["Yama", "Tushita", "Spikey Trident"], guns: ["Kabucha"], accessories: ["Hunter Cape", "Valkyrie Helm"],
    materials: { "Conjured Cocoa": 27, "Dragon Scale": 19, "Leather": 246 }, race: "Human", raceVersion: "V3",
    bountyHonor: 3410000, awakenedMoves: 6, gamepasses: ["2x Mastery"], legendaryItems: ["God's Chalice"],
    status: "Farming", lastUpdated: "2026-09-08T03:42:00Z", note: "Dough fully awakened"
  },
  {
    id: "acc-003", username: "FruitStore_X", displayName: "Vault", level: 2550, maxLevel: 2550, sea: "Sea 3",
    beli: 87300000, fragments: 64220, fruit: "Leopard", fruitMastery: 312, fightingStyle: "Sharkman Karate",
    swords: ["Shark Anchor", "Buddy Sword"], guns: ["Acidum Rifle", "Soul Guitar"], accessories: ["Leviathan Shield"],
    materials: { "Leviathan Scale": 31, "Electric Wing": 54, "Fool's Gold": 96 }, race: "Shark", raceVersion: "V4",
    bountyHonor: 1210000, awakenedMoves: 0, gamepasses: ["Fruit Storage", "Fast Boats"], legendaryItems: ["Leviathan Heart"],
    status: "Ready", lastUpdated: "2026-09-07T19:15:00Z", note: "Rare fruit storage"
  },
  {
    id: "acc-004", username: "SeaTwoGrind", displayName: "Mochi", level: 1384, maxLevel: 2550, sea: "Sea 2",
    beli: 8900000, fragments: 7100, fruit: "Buddha", fruitMastery: 244, fightingStyle: "Superhuman",
    swords: ["Rengoku", "Midnight Blade"], guns: ["Bizarre Rifle"], accessories: ["Swan Glasses"],
    materials: { "Ectoplasm": 74, "Vampire Fang": 12, "Magma Ore": 55 }, race: "Angel", raceVersion: "V2",
    bountyHonor: 485000, awakenedMoves: 1, gamepasses: [], legendaryItems: ["Fist of Darkness"],
    status: "Farming", lastUpdated: "2026-09-08T04:56:00Z"
  },
  {
    id: "acc-005", username: "StarterFruit_5", displayName: "Nova", level: 684, maxLevel: 2550, sea: "Sea 1",
    beli: 2100000, fragments: 0, fruit: "Light", fruitMastery: 168, fightingStyle: "Electric",
    swords: ["Saber", "Trident"], guns: ["Cannon"], accessories: ["Black Cape"],
    materials: { "Angel Wings": 18, "Scrap Metal": 83, "Fish Tail": 26 }, race: "Rabbit", raceVersion: "V1",
    bountyHonor: 182000, awakenedMoves: 0, gamepasses: [], legendaryItems: [],
    status: "Paused", lastUpdated: "2026-09-05T11:20:00Z", note: "Leveling next"
  }
];
