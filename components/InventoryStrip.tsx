import { trackedItems } from "../lib/item-catalog";

const groupLabels: Record<string, string> = {
  melee: "Melee",
  sword: "Sword",
  mixed: "Items",
  fruit: "Fruits",
};

const groups = [
  { key: "melee", items: trackedItems.filter(item => item.kind === "melee") },
  { key: "sword", items: trackedItems.filter(item => item.kind === "sword") },
  { key: "mixed", items: trackedItems.filter(item => ["material", "accessory", "gun"].includes(item.kind)) },
  { key: "fruit", items: trackedItems.filter(item => item.kind === "fruit") },
];

export function InventoryStrip({ inventory, selected, onSelect, showGroupNames = false }: {
  inventory: Record<string, number>;
  selected?: string | null;
  onSelect?: (key: string) => void;
  showGroupNames?: boolean;
}) {
  function iconSrc(icon: string) {
    return icon.startsWith("http") ? `/api/icon?src=${encodeURIComponent(icon)}` : icon;
  }

  return <div className="compact-inventory">{groups.map(group => <div className="inventory-group" key={group.key}>
    {showGroupNames && <small>{groupLabels[group.key]}</small>}
    <div>{group.items.map(item => {
      const count = inventory[item.id] ?? 0;
      const hasImageIcon = item.icon.startsWith("http") || item.icon.startsWith("/");
      return <button type="button" key={item.id} className={`${count > 0 ? "owned" : "unowned"}${selected === item.id ? " active" : ""}`} onClick={event => { event.stopPropagation(); onSelect?.(item.id); }} title={`${item.name}: ${count}`} aria-label={`${item.name}: ${count}`}>
        <i className={hasImageIcon ? "image-icon" : undefined} style={{"--item-color": item.color} as React.CSSProperties}>
          {hasImageIcon ? <>
            <img src={iconSrc(item.icon)} alt="" loading="lazy" onError={event => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement?.classList.add("icon-fallback"); }} />
            <b>{item.short}</b>
          </> : item.short}
        </i><span>{count}</span>
      </button>;
    })}</div>
  </div>)}</div>;
}
