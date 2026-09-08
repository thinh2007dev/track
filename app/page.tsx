"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiAccountSource } from "../lib/account-source";
import type { BloxAccount, Sea } from "../lib/types";
import {
  BarChart3, Boxes, ChevronDown, Coins, Database, Filter, Gem, Menu,
  PackageSearch, RefreshCw, Search, ShieldCheck, Sparkles, Swords, Users, X
} from "lucide-react";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("en-US");

function StatCard({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: string; hint: string; tone: string }) {
  return <article className="stat-card">
    <div className={`stat-icon ${tone}`}>{icon}</div>
    <div><p>{label}</p><strong>{value}</strong><small>{hint}</small></div>
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
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("updated");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BloxAccount | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  async function load() {
    setLoading(true);
    try { setAccounts(await new ApiAccountSource().getAccounts()); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const fruits = useMemo(() => [...new Set(accounts.map(a => a.fruit))].sort(), [accounts]);
  const filtered = useMemo(() => accounts.filter(a => {
    const haystack = [a.username, a.displayName, a.fruit, a.fightingStyle, a.race, ...a.swords, ...a.guns, ...a.accessories].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase()) && (sea === "All" || a.sea === sea) && (fruit === "All" || a.fruit === fruit) && (status === "All" || a.status === status);
  }).sort((a,b) => sort === "level" ? b.level-a.level : sort === "beli" ? b.beli-a.beli : sort === "bounty" ? b.bountyHonor-a.bountyHonor : +new Date(b.lastUpdated)-+new Date(a.lastUpdated)), [accounts, query, sea, fruit, status, sort]);

  const totalBeli = accounts.reduce((n,a)=>n+a.beli,0);
  const totalFragments = accounts.reduce((n,a)=>n+a.fragments,0);
  const maxed = accounts.filter(a=>a.level===a.maxLevel).length;

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

      <section className="stats">
        <StatCard icon={<Users/>} label="Tổng tài khoản" value={String(accounts.length)} hint={`${accounts.filter(a=>a.status==="Farming").length} đang farm`} tone="purple"/>
        <StatCard icon={<Coins/>} label="Tổng Beli" value={compact.format(totalBeli)} hint={full.format(totalBeli)} tone="yellow"/>
        <StatCard icon={<Gem/>} label="Fragments" value={compact.format(totalFragments)} hint={full.format(totalFragments)} tone="cyan"/>
        <StatCard icon={<Sparkles/>} label="Max level" value={`${maxed}/${accounts.length}`} hint={`${Math.round((maxed/(accounts.length||1))*100)}% đội hình`} tone="green"/>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Danh sách tài khoản</h2><p>{filtered.length} trong {accounts.length} tài khoản</p></div><div className="view-note"><Database/> Mock API connected</div></div>
        <div className="toolbar">
          <label className="search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm username, fruit, sword..."/></label>
          <div className="filters"><Filter/>
            <select value={sea} onChange={e=>setSea(e.target.value as "All"|Sea)}><option>All</option><option>Sea 1</option><option>Sea 2</option><option>Sea 3</option></select>
            <select value={fruit} onChange={e=>setFruit(e.target.value)}><option>All</option>{fruits.map(x=><option key={x}>{x}</option>)}</select>
            <select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Ready</option><option>Farming</option><option>Paused</option></select>
            <select value={sort} onChange={e=>setSort(e.target.value)}><option value="updated">Mới cập nhật</option><option value="level">Level cao nhất</option><option value="beli">Beli nhiều nhất</option><option value="bounty">Bounty cao nhất</option></select>
          </div>
        </div>

        <div className="table-wrap"><table>
          <thead><tr><th>Tài khoản</th><th>Tiến độ</th><th>Tiền tệ</th><th>Devil Fruit</th><th>Race / Combat</th><th>Kho nổi bật</th><th>Trạng thái</th></tr></thead>
          <tbody>{filtered.map(a=><tr key={a.id} onClick={()=>setSelected(a)}>
            <td><div className="account"><div className="avatar fruit">{a.displayName.slice(0,1)}</div><div><strong>{a.displayName}</strong><span>@{a.username}</span></div></div></td>
            <td><strong>Lv. {full.format(a.level)}</strong><span>{a.sea} · {Math.round(a.level/a.maxLevel*100)}%</span><div className="progress"><i style={{width:`${a.level/a.maxLevel*100}%`}}/></div></td>
            <td><strong className="money">$ {compact.format(a.beli)}</strong><span className="gems">◈ {compact.format(a.fragments)} fragments</span></td>
            <td><strong>{a.fruit}</strong><span>Mastery {a.fruitMastery} · {a.awakenedMoves} awakened</span></td>
            <td><strong>{a.race} {a.raceVersion}</strong><span>{a.fightingStyle}</span></td>
            <td><Pills items={[...a.swords,...a.guns,...a.accessories]}/></td>
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
      <div className="detail-section"><h3>Materials</h3><div className="materials">{Object.entries(selected.materials).map(([k,v])=><span key={k}><b>{k}</b><em>x{v}</em></span>)}</div></div>
      {selected.note && <div className="note">“{selected.note}”</div>}
    </section></div>}
  </div>;
}
