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
  { id: "control", name: "Control", short: "C", kind: "fruit", color: "#db5cab", icon: "/items/control.webp" },
  { id: "dough", name: "Dough", short: "D", kind: "fruit", color: "#d7a8b5", icon: "/items/dough.webp" },
  { id: "dragon", name: "Dragon", short: "DR", kind: "fruit", color: "#d74f4b", icon: "/items/dragon.webp" },
  { id: "magnet", name: "Magnet", short: "M", kind: "fruit", color: "#6875d9", icon: "/items/magnet.webp" },
  { id: "gas", name: "Gas", short: "G", kind: "fruit", color: "#4eae70", icon: "/items/gas.webp" },
  { id: "gravity", name: "Gravity", short: "GR", kind: "fruit", color: "#7148a8", icon: "/items/gravity.webp" },
  { id: "kitsune", name: "Kitsune", short: "K", kind: "fruit", color: "#547bd9", icon: "/items/kitsune.webp" },
  { id: "tiger", name: "Tiger", short: "TI", kind: "fruit", color: "#db753c", icon: "/items/tiger.webp" },
  { id: "lightning", name: "Lightning", short: "L", kind: "fruit", color: "#50a6df", icon: "/items/lightning.webp" },
  { id: "yeti", name: "Yeti", short: "Y", kind: "fruit", color: "#80baca", icon: "/items/yeti.webp" },
  { id: "mammoth", name: "Mammoth", short: "MA", kind: "fruit", color: "#856854", icon: "/items/mammoth.webp" },
  { id: "shadow", name: "Shadow", short: "SH", kind: "fruit", color: "#55436f", icon: "/items/shadow.webp" },
  { id: "spirit", name: "Spirit", short: "SP", kind: "fruit", color: "#e178aa", icon: "/items/spirit.webp" },
  { id: "trex", name: "T-Rex", short: "TR", kind: "fruit", color: "#72914d", icon: "/items/trex.webp" },
  { id: "venom", name: "Venom", short: "V", kind: "fruit", color: "#8b51b9", icon: "/items/venom.webp" },
];

export const ITEM_REGISTRY = Object.fromEntries(trackedItems.map(item => [item.id, item]));
