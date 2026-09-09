"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiAccountSource } from "../lib/account-source";
import type { BloxAccount, Sea } from "../lib/types";
import { trackedItems } from "../lib/item-catalog";
import { InventoryStrip } from "../components/InventoryStrip";
import {
  BarChart3, Boxes, ChevronDown, Coins, Database, Filter, Gem, Menu,
  PackageSearch, RefreshCw, Search, ShieldCheck, Sparkles, Swords, Trash2, Users, X
} from "lucide-react";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("en-US");
const trackedFruits = trackedItems.filter(item => item.kind === "fruit");

function StatCard({ icon, label, value, hint, tone, action }: { icon: React.ReactNode; label: string; value: string; hint: string; tone: string; action?: React.ReactNode }) {
  return <article className="stat-card">
    <div className={`stat-icon ${tone}`}>{icon}</div>
    <div><p>{label}</p><strong>{value}</strong><small>{hint}</small></div>
    {action}
  </article>;
}

function Pills({ items, limit = 2 }: { items: string[]; limit?: number }) {
  if (!items.length) return <span className="muted">—</span>;
  return <div className="pills">{items.slice(0, limit).map(x => <span key={x}>{x}</span>)}{items.length > limit && <b>+{items.length - limit}</b>}</div>;
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<BloxAccount[]>([]);
  const [query, setQuery] = useState("");
  const [sea, setSea] = useState<"All" | Sea>("All");
  const [fruit, setFruit] = useState("All");
  const [ownedFruit, setOwnedFruit] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("updated");
  const [itemFilter, setItemFilter] = useState<string | null>(null);
  const [presence, setPresence] = useState("All");
  const [minLevel, setMinLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [selected, setSelected] = useState<BloxAccount | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  function mergeUniqueAccounts(remote: BloxAccount[], local: BloxAccount[]) {
    const merged = new Map<string, BloxAccount>();
    [...remote, ...local].forEach(account => {
      const key = account.username.trim().toLowerCase() || account.id;
      const current = merged.get(key);
      if (!current || +new Date(account.lastUpdated) >= +new Date(current.lastUpdated)) {
        merged.set(key, account);
      }
    });
    return [...merged.values()];
  }

  async function load() {
    setLoading(true);
    try {
      const remote = await new ApiAccountSource().getAccounts();
      const local = JSON.parse(localStorage.getItem("fruitvault.localAccounts") ?? "[]") as BloxAccount[];
      setAccounts(mergeUniqueAccounts(remote, local));
    } finally { setLoading(false); }
  }

  async function clearAllAccounts() {
    if (!accounts.length || clearing) return;
    const ok = confirm("Bạn muốn xóa tất cả tài khoản không? Khi xóa thì toàn bộ dữ liệu account trong tracker sẽ mất đi.");
    if (!ok) return;
    const key = prompt("Nhập SCANNER_API_KEY để xác nhận xóa tất cả tài khoản:");
    if (!key) return;
    setClearing(true);
    try {
      const response = await fetch("/api/accounts", { method: "DELETE", headers: { "X-Admin-Key": key } });
      if (!response.ok) {
        alert("Không xóa được. Key sai hoặc server chưa cập nhật.");
        return;
      }
      localStorage.removeItem("fruitvault.localAccounts");
      setAccounts([]);
      setSelected(null);
    } finally {
      setClearing(false);
    }
  }
  useEffect(() => {
    const token = location.hash.startsWith("#scan=") ? location.hash.slice(6) : "";
    if (token) {
      try {
        const base64 = token.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(token.length / 4) * 4, "=");
        const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
        const account = JSON.parse(new TextDecoder().decode(bytes)) as BloxAccount;
        const validKeys = new Set(trackedItems.map(item => item.id));
        account.ownedItems = Object.fromEntries(Object.entries(account.ownedItems ?? {}).filter(([key, count]) => validKeys.has(key) && Number.isInteger(count) && count >= 0));
        if (!account.id || !account.username || !Number.isFinite(account.level)) throw new Error("Invalid local scan");
        const stored = JSON.parse(localStorage.getItem("fruitvault.localAccounts") ?? "[]") as BloxAccount[];
        const next = mergeUniqueAccounts(stored.filter(item => item.id !== account.id), [account]);
        localStorage.setItem("fruitvault.localAccounts", JSON.stringify(next));
        history.replaceState(null, "", location.pathname);
      } catch { /* Ignore malformed local imports. */ }
    }
    load();
  }, []);
  useEffect(() => {
    const events = new EventSource("/api/events");
    events.addEventListener("scan", load);
    return () => events.close();
  }, []);
  useEffect(() => {
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, []);

  const fruits = useMemo(() => [...new Set(accounts.map(a => a.fruit))].sort(), [accounts]);
  const filtered = useMemo(() => accounts.filter(a => {
    const haystack = [a.username, a.displayName, a.fruit, a.fightingStyle, a.race, ...a.swords, ...a.guns, ...a.accessories].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase()) && a.level >= minLevel && (sea === "All" || a.sea === sea) && (fruit === "All" || a.fruit === fruit) && (ownedFruit === "All" || (a.ownedItems[ownedFruit] ?? 0) > 0) && (status === "All" || a.status === status) && (presence === "All" || a.isOnline === (presence === "Online")) && (!itemFilter || (a.ownedItems[itemFilter] ?? 0) > 0);
  }).sort((a,b) => sort === "level" ? b.level-a.level : sort === "beli" ? b.beli-a.beli : sort === "fragments" ? b.fragments-a.fragments : sort === "valuable" ? Object.values(b.ownedItems).filter(Boolean).length-Object.values(a.ownedItems).filter(Boolean).length : sort === "bounty" ? b.bountyHonor-a.bountyHonor : +new Date(b.lastUpdated)-+new Date(a.lastUpdated)), [accounts, query, sea, fruit, ownedFruit, status, presence, minLevel, sort, itemFilter]);

  const totalBeli = accounts.reduce((n,a)=>n+a.beli,0);
  const totalFragments = accounts.reduce((n,a)=>n+a.fragments,0);
  const maxed = accounts.filter(a=>a.level===a.maxLevel).length;
  const aggregateInventory = useMemo(() => Object.fromEntries(trackedItems.map(item => [item.id, accounts.reduce((sum, account) => sum + (account.ownedItems[item.id] ?? 0), 0)])), [accounts]);

  return <div className="app-shell">
    <aside className={navOpen ? "sidebar open" : "sidebar"}>
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><div><strong>FruitVault</strong><span>BLOX TRACKER</span></div><button onClick={()=>setNavOpen(false)}><X/></button></div>
      <nav>
        <span className="nav-label">WORKSPACE</span>
        <a className="active"><BarChart3/> Tổng quan</a>
        <a><Users/> Tài khoản <b>{accounts.length}</b></a>
        <a><Boxes/> Kho vật phẩm</a>
        <span className="nav-label second">TRACKING</span>
        <a><Swords/> Trang bị</a>
        <a><PackageSearch/> Vật liệu</a>
      </nav>
      <div className="safety"><ShieldCheck/><div><strong>Dữ liệu riêng tư</strong><span>Chỉ kết nối nguồn dữ liệu bạn được phép sử dụng.</span></div></div>
      <div className="profile"><div className="avatar">FV</div><div><strong>My Workspace</strong><span>Personal tracker</span></div><ChevronDown/></div>
    </aside>

    <main>
      <header><button className="menu" onClick={()=>setNavOpen(true)}><Menu/></button><div><span className="eyebrow">BLOX FRUITS / DASHBOARD</span><h1>Account overview</h1><p>Theo dõi tiến độ, tiền tệ và kho vật phẩm trong một nơi.</p></div><button className="refresh" onClick={load}><RefreshCw className={loading ? "spin" : ""}/> Làm mới</button></header>

      <section className="stats five">
        <StatCard icon={<Users/>} label="Tổng tài khoản" value={String(accounts.length)} hint={`${accounts.filter(a=>a.status==="Farming").length} đang farm`} tone="purple" action={<button className="danger-icon" onClick={clearAllAccounts} title="Xóa tất cả tài khoản" disabled={!accounts.length || clearing}><Trash2/></button>}/>
        <StatCard icon={<ShieldCheck/>} label="Online" value={String(accounts.filter(a=>a.isOnline).length)} hint="Đang hoạt động" tone="green"/>
        <StatCard icon={<Users/>} label="Offline" value={String(accounts.filter(a=>!a.isOnline).length)} hint="Không hoạt động" tone="purple"/>
        <StatCard icon={<Coins/>} label="Tổng Beli" value={compact.format(totalBeli)} hint={full.format(totalBeli)} tone="yellow"/>
        <StatCard icon={<Gem/>} label="Fragments" value={compact.format(totalFragments)} hint={full.format(totalFragments)} tone="cyan"/>
      </section>

      <section className="inventory-quick">
        <div className="quick-head"><div><span>QUICK INVENTORY</span><h2>Item &amp; Devil Fruit</h2></div>{itemFilter && <button onClick={()=>setItemFilter(null)}><X/> Xóa lọc</button>}</div>
        <InventoryStrip inventory={aggregateInventory} selected={itemFilter} showGroupNames onSelect={key=>setItemFilter(itemFilter === key ? null : key)}/>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Danh sách tài khoản</h2><p>{filtered.length} trong {accounts.length} tài khoản</p></div><div className="view-note"><Database/> Supabase/API connected</div></div>
        <div className="toolbar">
          <label className="search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm username, fruit, sword..."/></label>
          <div className="filters"><Filter/>
            <select value={sea} onChange={e=>setSea(e.target.value as "All"|Sea)}><option>All</option><option>Sea 1</option><option>Sea 2</option><option>Sea 3</option></select>
            <select value={fruit} onChange={e=>setFruit(e.target.value)}><option>All</option>{fruits.map(x=><option key={x}>{x}</option>)}</select>
            <select value={ownedFruit} onChange={e=>setOwnedFruit(e.target.value)}><option value="All">Fruit trong kho</option>{trackedFruits.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
            <select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Ready</option><option>Farming</option><option>Paused</option></select>
            <select value={presence} onChange={e=>setPresence(e.target.value)}><option>All</option><option>Online</option><option>Offline</option></select>
            <input className="level-filter" type="number" min="0" max="2550" value={minLevel || ""} onChange={e=>setMinLevel(Number(e.target.value))} placeholder="Min level"/>
            <select value={sort} onChange={e=>setSort(e.target.value)}><option value="updated">Mới cập nhật</option><option value="level">Level cao nhất</option><option value="beli">Beli nhiều nhất</option><option value="fragments">Fragments nhiều nhất</option><option value="valuable">Nhiều item nhất</option><option value="bounty">Bounty cao nhất</option></select>
          </div>
        </div>

        <div className="table-wrap"><table>
          <thead><tr><th>Tài khoản</th><th>Tiến độ</th><th>Tiền tệ</th><th>Devil Fruit</th><th>Race / Combat</th><th>Kho nổi bật</th><th>Trạng thái</th></tr></thead>
          <tbody>{filtered.map(a=><tr key={a.id} onClick={()=>setSelected(a)}>
            <td><div className="account"><div className="avatar fruit">{a.displayName.slice(0,1)}<i className={a.isOnline ? "presence on" : "presence"}/></div><div><strong>{a.displayName}</strong><span>@{a.username}</span><small className={a.isOnline ? "online-text" : "offline-text"}>{a.isOnline ? "● Online" : "● Offline"}</small></div></div></td>
            <td><strong>Lv. {full.format(a.level)}</strong><span>{a.sea} · {Math.round(a.level/a.maxLevel*100)}%</span><div className="progress"><i style={{width:`${a.level/a.maxLevel*100}%`}}/></div></td>
            <td><strong className="money">$ {compact.format(a.beli)}</strong><span className="gems">◈ {compact.format(a.fragments)} fragments</span></td>
            <td><strong>{a.fruit}</strong><span>Mastery {a.fruitMastery} · {a.awakenedMoves} awakened</span></td>
            <td><strong>{a.race} {a.raceVersion}</strong><span>{a.fightingStyle}</span></td>
            <td><div className="row-inventory"><InventoryStrip inventory={a.ownedItems}/></div></td>
            <td><span className={`status ${a.status.toLowerCase()}`}>{a.status}</span><span>{new Date(a.lastUpdated).toLocaleDateString("vi-VN")}</span></td>
          </tr>)}</tbody>
        </table>{!loading && !filtered.length && <div className="empty"><PackageSearch/><strong>Không tìm thấy tài khoản</strong><span>Thử thay đổi từ khóa hoặc bộ lọc.</span></div>}</div>
      </section>
    </main>

    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><section className="drawer" onClick={e=>e.stopPropagation()}>
      <button className="close" onClick={()=>setSelected(null)}><X/></button>
      <div className="drawer-title"><div className="avatar fruit large">{selected.displayName[0]}</div><div><span>{selected.status} · {selected.sea}</span><h2>{selected.displayName}</h2><p>@{selected.username}</p></div></div>
      <div className="detail-grid"><div><span>Level</span><strong>{full.format(selected.level)}</strong></div><div><span>Beli</span><strong>${full.format(selected.beli)}</strong></div><div><span>Fragments</span><strong>{full.format(selected.fragments)}</strong></div><div><span>Bounty / Honor</span><strong>{full.format(selected.bountyHonor)}</strong></div></div>
      <h3>Build hiện tại</h3><div className="build"><p><span>Devil Fruit</span><b>{selected.fruit} · Mastery {selected.fruitMastery}</b></p><p><span>Fighting Style</span><b>{selected.fightingStyle}</b></p><p><span>Race</span><b>{selected.race} {selected.raceVersion}</b></p></div>
      {[['Swords',selected.swords],['Guns',selected.guns],['Accessories',selected.accessories],['Gamepasses',selected.gamepasses],['Legendary / Quest items',selected.legendaryItems]].map(([title,items])=><div className="detail-section" key={title as string}><h3>{title as string}</h3><Pills items={items as string[]} limit={99}/></div>)}
      <div className="detail-section"><h3>Tracked inventory</h3><div className="owned-grid">{trackedItems.filter(item => (selected.ownedItems[item.id] ?? 0) > 0).map(item=><span key={item.id}><i style={{"--item-color": item.color} as React.CSSProperties}>{item.short}</i><b>{item.name}</b><em>x{selected.ownedItems[item.id]}</em></span>)}</div></div>
      <div className="detail-section"><h3>Materials</h3><div className="materials">{Object.entries(selected.materials).map(([k,v])=><span key={k}><b>{k}</b><em>x{v}</em></span>)}</div></div>
      {selected.note && <div className="note">“{selected.note}”</div>}
    </section></div>}
  </div>;
}
