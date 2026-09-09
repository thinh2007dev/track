export type TrackedItemKind = "melee" | "sword" | "material" | "accessory" | "gun" | "fruit";

export interface TrackedItem {
  id: string;
  name: string;
  short: string;
  kind: TrackedItemKind;
  color: string;
  icon: string;
}

export const trackedItems: TrackedItem[] = [
  { id: "godhuman", name: "Godhuman", short: "GH", kind: "melee", color: "#e6b84b", icon: "/items/godhuman.webp" },
  { id: "sanguine_art", name: "Sanguine Art", short: "SA", kind: "melee", color: "#c94b5f", icon: "/items/sanguine_art.webp" },
  { id: "cursed_dual_katana", name: "Cursed Dual Katana", short: "CDK", kind: "sword", color: "#7e5ce5", icon: "/items/cursed_dual_katana.webp" },
  { id: "shark_anchor", name: "Shark Anchor", short: "⚓", kind: "sword", color: "#428db5", icon: "/items/shark_anchor.webp" },
  { id: "mirror_fractal", name: "Mirror Fractal", short: "MF", kind: "material", color: "#69b9c8", icon: "/items/mirror_fractal.webp" },
  { id: "dark_fragment", name: "Dark Fragment", short: "DF", kind: "material", color: "#6950a8", icon: "/items/dark_fragment.webp" },
  { id: "valkyrie_helm", name: "Valkyrie Helm", short: "VH", kind: "accessory", color: "#d28a45", icon: "/items/valkyrie_helm.webp" },
  { id: "skull_guitar", name: "Skull Guitar", short: "SG", kind: "gun", color: "#9c62d2", icon: "/items/skull_guitar.webp" },
  { id: "control", name: "Control", short: "C", kind: "fruit", color: "#db5cab", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/1/19/Control_Fruit.png/revision/latest/scale-to-width-down/110?cb=20251223165924" },
  { id: "dough", name: "Dough", short: "D", kind: "fruit", color: "#d7a8b5", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/0/02/Dough_Fruit.png/revision/latest/scale-to-width-down/110?cb=20260806235727" },
  { id: "dragon", name: "Dragon", short: "DR", kind: "fruit", color: "#d74f4b", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/2/29/Dragon_Fruit.png/revision/latest/scale-to-width-down/110?cb=20260806232519" },
  { id: "magnet", name: "Magnet", short: "M", kind: "fruit", color: "#6875d9", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/2/2f/Magnet_Fruit.png/revision/latest/scale-to-width-down/128?cb=20260905110645" },
  { id: "gas", name: "Gas", short: "G", kind: "fruit", color: "#4eae70", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/e/ed/Gas_Fruit.png/revision/latest/scale-to-width-down/110?cb=20241223162315" },
  { id: "gravity", name: "Gravity", short: "GR", kind: "fruit", color: "#7148a8", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/5/5f/Gravity_Fruit.png/revision/latest/scale-to-width-down/110?cb=20250418030958" },
  { id: "kitsune", name: "Kitsune", short: "K", kind: "fruit", color: "#547bd9", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/6/65/Kitsune_Fruit.png/revision/latest/scale-to-width-down/110?cb=20241223162956" },
  { id: "tiger", name: "Tiger", short: "TI", kind: "fruit", color: "#db753c", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/1/14/Tiger_Fruit.png/revision/latest/scale-to-width-down/110?cb=20251101005924" },
  { id: "lightning", name: "Lightning", short: "L", kind: "fruit", color: "#50a6df", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/7/78/Lightning_Fruit.png/revision/latest/scale-to-width-down/110?cb=20260806235926" },
  { id: "yeti", name: "Yeti", short: "Y", kind: "fruit", color: "#80baca", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/2/2f/Yeti_Fruit.png/revision/latest/scale-to-width-down/110?cb=20260806232444" },
  { id: "mammoth", name: "Mammoth", short: "MA", kind: "fruit", color: "#856854", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/9/95/Mammoth_Fruit.png/revision/latest/scale-to-width-down/110?cb=20260806235956" },
  { id: "shadow", name: "Shadow", short: "SH", kind: "fruit", color: "#55436f", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/5/58/Shadow_Fruit.png/revision/latest/scale-to-width-down/110?cb=20241229033053" },
  { id: "spirit", name: "Spirit", short: "SP", kind: "fruit", color: "#e178aa", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/6/66/Spirit_Fruit.png/revision/latest/scale-to-width-down/110?cb=20240304190559" },
  { id: "trex", name: "T-Rex", short: "TR", kind: "fruit", color: "#72914d", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/d/d9/T-Rex_Fruit.png/revision/latest/scale-to-width-down/110?cb=20231226191220" },
  { id: "venom", name: "Venom", short: "V", kind: "fruit", color: "#8b51b9", icon: "https://static.wikia.nocookie.net/roblox-blox-piece/images/d/d2/Venom_Fruit.png/revision/latest/scale-to-width-down/110?cb=20231027120425" },
];

export const ITEM_REGISTRY = Object.fromEntries(trackedItems.map(item => [item.id, item]));
