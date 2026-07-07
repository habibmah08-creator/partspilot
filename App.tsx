import React, { useState, useMemo, useRef } from "react";
import {
  Search, Plus, Package, Users, LayoutDashboard, Minus, FileText,
  TrendingUp, TrendingDown, X, Phone, Car, User, Wrench, LogOut,
  Printer, Receipt, PieChart, Trash2, Eye, EyeOff, ShoppingCart,
  CheckCircle2, Clock, Wallet, ShieldCheck, KeyRound, UserX, UserCheck,
  CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, ScanLine,
  Camera, Loader2, AlertCircle, BadgePercent, ImageDown,
} from "lucide-react";

/* ============ PALETTE ============
   Oxford Blue #002147 · Tan #D2B48C
   Derived: blue #2E5A8F, bronze #8C6A2F, cream #F5EFE3, red #B3261E
=================================== */
const NAVY = "#002147", BLUE = "#2E5A8F", BRONZE = "#8C6A2F", TAN = "#D2B48C", RED = "#B3261E";

/* ================= USERS (2 owners, 5 counter, 20 staff) ================= */

const STAFF_NAMES = ["Aman Gupta", "Ravi Yadav", "Salman Ansari", "Deepak Rawat", "Nitin Saxena", "Faizan Khan", "Vikas Tiwari", "Mohit Chauhan", "Arif Siddiqui", "Sandeep Kumar", "Rahul Mishra", "Zaid Qureshi", "Pankaj Verma", "Suraj Pal", "Irfan Sheikh", "Ankit Singh", "Naveen Joshi", "Kamal Rathore", "Tariq Naqvi", "Gaurav Dubey"];
const COUNTER_NAMES = ["Rekha Srivastava", "Manoj Bajpai", "Shalini Tripathi", "Dinesh Sonkar", "Pooja Agarwal"];

const SEED_USERS = [
  { id: 1, username: "owner1", password: "owner@123", name: "Arjun Mehrotra", role: "Owner", active: true },
  { id: 2, username: "owner2", password: "owner@123", name: "Rohan Mehrotra", role: "Owner", active: true },
  ...COUNTER_NAMES.map((n, i) => ({ id: 10 + i, username: "counter" + (i + 1), password: "counter@123", name: n, role: "Counter", active: true })),
  ...STAFF_NAMES.map((n, i) => ({ id: 100 + i, username: "staff" + (i + 1), password: "staff@123", name: n, role: "Staff", active: i !== 17 })),
];

const PERMS = {
  Owner: ["Dashboard", "Billing", "Customers", "Inventory", "Attendance", "Reports", "Team"],
  Counter: ["Billing", "Inventory", "Customers", "Attendance"],
  Staff: ["Billing", "Inventory", "Customers"],
};
const ROLE_COLOR = { Owner: NAVY, Counter: BLUE, Staff: BRONZE };
const NAV_LABEL = { Dashboard: "Home", Billing: "Bills", Customers: "Clients", Inventory: "Stock", Attendance: "Hazri", Reports: "Reports", Team: "Team" };

/* ================= BUSINESS DATA ================= */

const SEED_CUSTOMERS = [
  { id: 1, name: "Rakesh Motors", phone: "98390 12345", vehicle: "Tata Ace / Bolero", type: "Wholesale", since: "2023" },
  { id: 2, name: "Imran Auto Care", phone: "94150 88231", vehicle: "Maruti Swift", type: "Retail", since: "2024" },
  { id: 3, name: "Sharma Tyres & Spares", phone: "70070 45120", vehicle: "Multiple", type: "Wholesale", since: "2022" },
  { id: 4, name: "Ali Khan", phone: "82990 11002", vehicle: "Royal Enfield 350", type: "Retail", since: "2025" },
  { id: 5, name: "Verma Garage", phone: "99560 77341", vehicle: "Mahindra Scorpio", type: "Wholesale", since: "2024" },
];

// cost = purchase rate (same every time) · price = default selling rate (editable on every bill)
const SEED_INVENTORY = [
  { id: 1, part: "Brake Pad Set", sku: "BP-2201", category: "Brakes", stock: 42, cost: 640, price: 850, reorder: 15 },
  { id: 2, part: "Oil Filter", sku: "OF-1180", category: "Filters", stock: 8, cost: 150, price: 220, reorder: 20 },
  { id: 3, part: "Headlight Assembly", sku: "HL-5540", category: "Lighting", stock: 5, cost: 2500, price: 3200, reorder: 6 },
  { id: 4, part: "Clutch Plate", sku: "CP-3390", category: "Transmission", stock: 27, cost: 1100, price: 1450, reorder: 10 },
  { id: 5, part: "Air Filter", sku: "AF-1090", category: "Filters", stock: 12, cost: 230, price: 340, reorder: 15 },
  { id: 6, part: "Wiper Blade (Pair)", sku: "WB-0770", category: "Accessories", stock: 55, cost: 320, price: 480, reorder: 20 },
  { id: 7, part: "Engine Oil 5W-30 (1L)", sku: "EO-0530", category: "Lubricants", stock: 64, cost: 400, price: 520, reorder: 25 },
  { id: 8, part: "Battery 35Ah", sku: "BT-3500", category: "Electrical", stock: 9, cost: 3350, price: 4100, reorder: 5 },
];

const COST_MAP = { "Brake Pad Set": 640, "Oil Filter": 150, "Headlight Assembly": 2500, "Clutch Plate": 1100, "Air Filter": 230, "Wiper Blade (Pair)": 320, "Engine Oil 5W-30 (1L)": 400, "Battery 35Ah": 3350 };

const mkBill = (num, cust, items, y, m, d, status) => {
  const withCost = items.map((i) => ({ ...i, cost: COST_MAP[i.part] ?? Math.round(i.price * 0.78) }));
  const subtotal = withCost.reduce((s, i) => s + i.qty * i.price, 0);
  const gst = Math.round(subtotal * 0.18);
  return { id: "INV-" + num, customer: cust, items: withCost, subtotal, gst, total: subtotal + gst, date: new Date(y, m, d).toISOString(), status, createdBy: "owner1" };
};
const SEED_BILLS = [
  mkBill(1029, "Sharma Tyres & Spares", [{ part: "Brake Pad Set", qty: 6, price: 850 }, { part: "Clutch Plate", qty: 2, price: 1450 }], 2026, 1, 12, "Paid"),
  mkBill(1030, "Rakesh Motors", [{ part: "Engine Oil 5W-30 (1L)", qty: 10, price: 500 }], 2026, 1, 24, "Paid"),
  mkBill(1031, "Verma Garage", [{ part: "Battery 35Ah", qty: 1, price: 4100 }, { part: "Wiper Blade (Pair)", qty: 2, price: 480 }], 2026, 2, 5, "Paid"),
  mkBill(1032, "Imran Auto Care", [{ part: "Oil Filter", qty: 3, price: 220 }, { part: "Air Filter", qty: 2, price: 340 }], 2026, 2, 18, "Paid"),
  mkBill(1033, "Sharma Tyres & Spares", [{ part: "Headlight Assembly", qty: 2, price: 3050 }], 2026, 3, 3, "Paid"),
  mkBill(1034, "Ali Khan", [{ part: "Engine Oil 5W-30 (1L)", qty: 2, price: 520 }, { part: "Oil Filter", qty: 1, price: 220 }], 2026, 3, 21, "Paid"),
  mkBill(1035, "Rakesh Motors", [{ part: "Brake Pad Set", qty: 4, price: 820 }, { part: "Wiper Blade (Pair)", qty: 4, price: 480 }], 2026, 4, 9, "Paid"),
  mkBill(1036, "Verma Garage", [{ part: "Clutch Plate", qty: 3, price: 1400 }], 2026, 4, 27, "Pending"),
  mkBill(1037, "Sharma Tyres & Spares", [{ part: "Battery 35Ah", qty: 2, price: 3950 }], 2026, 5, 8, "Paid"),
  mkBill(1038, "Imran Auto Care", [{ part: "Wiper Blade (Pair)", qty: 1, price: 480 }, { part: "Air Filter", qty: 1, price: 340 }], 2026, 5, 19, "Paid"),
  mkBill(1039, "Verma Garage", [{ part: "Engine Oil 5W-30 (1L)", qty: 12, price: 505 }, { part: "Oil Filter", qty: 6, price: 210 }], 2026, 5, 30, "Pending"),
  mkBill(1040, "Ali Khan", [{ part: "Brake Pad Set", qty: 1, price: 850 }], 2026, 6, 1, "Paid"),
  mkBill(1041, "Rakesh Motors", [{ part: "Headlight Assembly", qty: 1, price: 3200 }, { part: "Engine Oil 5W-30 (1L)", qty: 4, price: 520 }], 2026, 6, 1, "Pending"),
];

const SEED_EXPENSES = [
  ...[1, 2, 3, 4, 5, 6].map((m, i) => ({ id: i + 1, label: "Shop Rent", category: "Rent", amount: 18000, date: new Date(2026, m, 1).toISOString() })),
  { id: 7, label: "Electricity Bill", category: "Utilities", amount: 3400, date: new Date(2026, 5, 12).toISOString() },
  { id: 8, label: "Tea & Refreshments", category: "Misc", amount: 900, date: new Date(2026, 5, 25).toISOString() },
  { id: 9, label: "Delivery Scooter Fuel", category: "Transport", amount: 1600, date: new Date(2026, 6, 1).toISOString() },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ymd = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const buildSeedAttendance = () => {
  const rec = {};
  const employees = SEED_USERS.filter((u) => u.role !== "Owner");
  employees.forEach((u, idx) => {
    for (let d = 1; d <= 30; d++) {
      const dow = new Date(2026, 5, d).getDay();
      if (dow === 0) continue;
      let status = "P";
      if ((d + idx) % 11 === 0) status = "A";
      else if ((d + idx) % 7 === 0) status = "H";
      rec[`${u.id}_${ymd(2026, 5, d)}`] = status;
    }
  });
  return rec;
};
const SEED_ATTENDANCE = buildSeedAttendance();

const money = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");
const fmtDate = (iso) => { try { const d = new Date(iso); return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); } catch { return "—"; } };
const initials = (name) => (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const billProfit = (b) => (b.items || []).reduce((s, l) => s + (l.price - (l.cost || 0)) * l.qty, 0);

/* ================= APP ================= */

export default function App() {
  const [users, setUsers] = useState(SEED_USERS);
  const [session, setSession] = useState(null);
  return session
    ? <Shell user={session} users={users} setUsers={setUsers} onLogout={() => setSession(null)} />
    : <Login users={users} onLogin={setSession} />;
}

/* ---------- LOGIN ---------- */
function Login({ users, onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const submit = () => {
    const found = users.find((x) => x.username === u.trim().toLowerCase() && x.password === p);
    if (!found) return setErr("Invalid username or password.");
    if (!found.active) return setErr("This account is deactivated. Contact the owner.");
    onLogin(found);
  };

  const demos = [users.find((x) => x.username === "owner1"), users.find((x) => x.username === "counter1"), users.find((x) => x.username === "staff1")].filter(Boolean);

  return (
    <div className="login-wrap">
      <style>{CSS}</style>
      <div className="login-card glass">
        <div className="login-brand">
          <div className="brand-icon"><Wrench size={20} color="#fff" /></div>
          <div>
            <div className="brand-name">PartsPilot</div>
            <div className="brand-sub">Auto Parts CRM · Lucknow</div>
          </div>
        </div>

        <label className="field-label">Username</label>
        <input className="input" value={u} onChange={(e) => { setU(e.target.value); setErr(""); }}
          placeholder="e.g. owner1" autoCapitalize="none" autoCorrect="off" />

        <label className="field-label" style={{ marginTop: 14 }}>Password</label>
        <div className="pw-wrap">
          <input className="input" type={show ? "text" : "password"} value={p}
            onChange={(e) => { setP(e.target.value); setErr(""); }} placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          <button className="pw-eye" onClick={() => setShow(!show)} aria-label="toggle password">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {err && <div className="login-err">{err}</div>}

        <button className="btn-primary glassbtn" style={{ width: "100%", marginTop: 18, justifyContent: "center" }}
          disabled={!u || !p} onClick={submit}>Sign in</button>

        <div className="demo-box">
          <div className="demo-title">Demo accounts — tap to autofill</div>
          {demos.map((d) => (
            <button key={d.username} className="demo-row" onClick={() => { setU(d.username); setP(d.password); setErr(""); }}>
              <span className="role-dot" style={{ background: ROLE_COLOR[d.role] }} />
              <span className="demo-role">{d.role}</span>
              <span className="demo-cred">{d.username} / {d.password}</span>
            </button>
          ))}
          <div className="demo-hint">27 accounts: owner1–2 · counter1–5 · staff1–20</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- SHELL ---------- */
function Shell({ user, users, setUsers, onLogout }) {
  const perms = PERMS[user.role] || [];
  const [tab, setTab] = useState(perms[0]);
  const [customers, setCustomers] = useState(SEED_CUSTOMERS);
  const [inventory, setInventory] = useState(SEED_INVENTORY);
  const [bills, setBills] = useState(SEED_BILLS);
  const [expenses, setExpenses] = useState(SEED_EXPENSES);
  const [attendance, setAttendance] = useState(SEED_ATTENDANCE);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const activeTab = perms.includes(tab) ? tab : perms[0];
  const pop = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };

  const saveBill = (bill) => {
    setBills((b) => [bill, ...b]);
    setInventory((inv) => inv.map((it) => {
      const line = bill.items.find((l) => l.partId === it.id);
      return line ? { ...it, stock: Math.max(0, it.stock - line.qty) } : it;
    }));
    setModal({ type: "viewBill", payload: bill });
    pop("Bill " + bill.id + " saved");
  };

  const markPaid = (id) => {
    setBills((b) => b.map((x) => (x.id === id ? { ...x, status: "Paid" } : x)));
    setModal((m) => m && m.type === "viewBill" ? { ...m, payload: { ...m.payload, status: "Paid" } } : m);
    pop("Marked as paid");
  };

  const adjustStock = (id, delta) => {
    setInventory((inv) => inv.map((it) => it.id === id ? { ...it, stock: Math.max(0, it.stock + delta) } : it));
  };

  const setMark = (userId, dateKey, status) => {
    const key = `${userId}_${dateKey}`;
    setAttendance((a) => {
      const next = { ...a };
      if (a[key] === status) delete next[key];
      else next[key] = status;
      return next;
    });
  };

  const importScanned = (rows) => {
    if (!rows.length) return;
    setInventory((inv) => {
      const next = [...inv];
      rows.forEach((r) => {
        const ix = next.findIndex((i) => i.part.trim().toLowerCase() === r.name.trim().toLowerCase());
        if (ix >= 0) {
          next[ix] = { ...next[ix], stock: next[ix].stock + r.qty, cost: r.cost, price: r.sell > 0 ? r.sell : next[ix].price };
        } else {
          next.push({
            id: Date.now() + Math.floor(Math.random() * 1000), part: r.name,
            sku: "SKU-" + Math.floor(1000 + Math.random() * 9000), category: "Other",
            stock: r.qty, cost: r.cost, price: r.sell > 0 ? r.sell : Math.round(r.cost * 1.25), reorder: 5,
          });
        }
      });
      return next;
    });
    setModal(null);
    pop(rows.length + " item" + (rows.length > 1 ? "s" : "") + " added to stock");
  };

  const NAV_ICON = { Dashboard: LayoutDashboard, Billing: Receipt, Customers: Users, Inventory: Package, Attendance: CalendarCheck, Reports: PieChart, Team: ShieldCheck };

  return (
    <div className="app">
      <style>{CSS}</style>
      <div className="bg-blobs no-print" aria-hidden="true"><span className="blob b1" /><span className="blob b2" /><span className="blob b3" /></div>

      {/* Desktop sidebar */}
      <aside className="sidebar no-print">
        <div className="login-brand" style={{ paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
          <div className="brand-icon tanbg"><Wrench size={18} color={NAVY} /></div>
          <div>
            <div className="brand-name" style={{ color: "#fff" }}>PartsPilot</div>
            <div className="brand-sub" style={{ color: "rgba(255,255,255,0.55)" }}>Auto Parts CRM</div>
          </div>
        </div>
        <nav style={{ marginTop: 10, flex: 1 }}>
          {perms.map((k) => {
            const Icon = NAV_ICON[k];
            return (
              <button key={k} className={"nav-btn" + (activeTab === k ? " nav-active" : "")} onClick={() => setTab(k)}>
                <Icon size={18} /><span>{k}</span>
              </button>
            );
          })}
        </nav>
        <div className="user-chip">
          <div className="avatar txt" style={{ background: "rgba(210,180,140,0.22)", color: TAN }}>{initials(user.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ color: "#fff" }}>{user.name}</div>
            <div className="user-role" style={{ color: TAN }}>{user.role} · {user.username}</div>
          </div>
          <button className="icon-btn onnavy" onClick={onLogout} aria-label="Log out"><LogOut size={16} /></button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar glass no-print">
          <div className="topbar-mobile-brand">
            <div className="brand-icon sm"><Wrench size={15} color="#fff" /></div>
            <span className="brand-name">PartsPilot</span>
            <span className="role-pill" style={{ background: ROLE_COLOR[user.role] + "1A", color: ROLE_COLOR[user.role], marginLeft: "auto" }}>{user.name.split(" ")[0]} · {user.role}</span>
            <button className="icon-btn" onClick={onLogout} aria-label="Log out"><LogOut size={16} /></button>
          </div>
          <h1 className="page-title">{activeTab}</h1>
          <div className="topbar-right desktop-only">
            <span className="role-pill" style={{ background: ROLE_COLOR[user.role] + "14", color: ROLE_COLOR[user.role] }}>{user.role}</span>
          </div>
        </header>

        <div className="content">
          {activeTab === "Dashboard" && <Dashboard bills={bills} expenses={expenses} inventory={inventory} customers={customers} user={user} />}
          {activeTab === "Billing" && <Billing bills={bills} onNew={() => setModal({ type: "newBill" })} onView={(b) => setModal({ type: "viewBill", payload: b })} />}
          {activeTab === "Customers" && <Customers customers={customers} onAdd={() => setModal({ type: "addCustomer" })} />}
          {activeTab === "Inventory" && <Inventory inventory={inventory} role={user.role} onAdd={() => setModal({ type: "addPart" })} onScan={() => setModal({ type: "scanBill" })} onAdjust={adjustStock} />}
          {activeTab === "Attendance" && <Attendance users={users} attendance={attendance} onMark={setMark} />}
          {activeTab === "Reports" && <Reports bills={bills} expenses={expenses} onAddExpense={() => setModal({ type: "addExpense" })} onDeleteExpense={(id) => setExpenses((e) => e.filter((x) => x.id !== id))} />}
          {activeTab === "Team" && <Team users={users} setUsers={setUsers} me={user} onAdd={() => setModal({ type: "addUser" })} pop={pop} />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav glass no-print">
        {perms.map((k) => {
          const Icon = NAV_ICON[k];
          return (
            <button key={k} className={"bnav-btn" + (activeTab === k ? " bnav-active" : "")} onClick={() => setTab(k)}>
              <Icon size={19} />
              <span>{NAV_LABEL[k]}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      {modal?.type === "newBill" && (
        <NewBill customers={customers} inventory={inventory} bills={bills} user={user}
          onClose={() => setModal(null)} onSave={saveBill} />
      )}
      {modal?.type === "viewBill" && (
        <BillView bill={modal.payload} onClose={() => setModal(null)} onMarkPaid={markPaid} canMarkPaid={user.role !== "Staff"} />
      )}
      {modal?.type === "addCustomer" && (
        <AddCustomer onClose={() => setModal(null)}
          onAdd={(c) => { setCustomers((cs) => [{ ...c, id: Date.now(), since: "2026" }, ...cs]); setModal(null); pop("Customer added"); }} />
      )}
      {modal?.type === "addPart" && (
        <AddPart onClose={() => setModal(null)}
          onAdd={(p) => { setInventory((inv) => [{ ...p, id: Date.now() }, ...inv]); setModal(null); pop("Part added to inventory"); }} />
      )}
      {modal?.type === "scanBill" && (
        <ScanBill inventory={inventory} onClose={() => setModal(null)} onImport={importScanned} />
      )}
      {modal?.type === "addExpense" && (
        <AddExpense onClose={() => setModal(null)}
          onAdd={(x) => { setExpenses((e) => [{ ...x, id: Date.now(), date: new Date().toISOString() }, ...e]); setModal(null); pop("Expense recorded"); }} />
      )}
      {modal?.type === "addUser" && (
        <AddUser users={users} onClose={() => setModal(null)}
          onAdd={(nu) => { setUsers((us) => [...us, nu]); setModal(null); pop(nu.username + " created · temp password: " + nu.password); }} />
      )}

      {toast && <div className="toast no-print"><CheckCircle2 size={16} /> {toast}</div>}
    </div>
  );
}

/* ---------- DASHBOARD ---------- */
function Dashboard({ bills, expenses, inventory, customers, user }) {
  const now = new Date();
  const thisMonth = (iso) => { const d = new Date(iso); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); };
  const revenue = bills.filter((b) => thisMonth(b.date)).reduce((s, b) => s + b.total, 0);
  const profit = bills.filter((b) => thisMonth(b.date)).reduce((s, b) => s + billProfit(b), 0);
  const pending = bills.filter((b) => b.status === "Pending").reduce((s, b) => s + b.total, 0);
  const low = inventory.filter((i) => i.stock <= i.reorder);

  const cards = [
    { label: "Revenue (this month)", value: money(revenue), icon: TrendingUp, tint: NAVY },
    { label: "Margin earned (this month)", value: money(profit), icon: BadgePercent, tint: BRONZE },
    { label: "Pending Dues", value: money(pending), icon: Clock, tint: BLUE },
    { label: "Customers", value: customers.length, icon: Users, tint: BRONZE },
  ];

  return (
    <div>
      <div className="greeting">Namaste, {user.name.split(" ")[0]} 👋</div>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="card glass stat-card">
            <div className="stat-icon" style={{ background: c.tint + "16" }}><c.icon size={19} color={c.tint} /></div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card glass panel">
          <div className="panel-title">Recent Bills</div>
          {bills.slice(0, 5).map((b) => (
            <div key={b.id} className="list-row">
              <div>
                <div className="row-main">{b.id}</div>
                <div className="row-sub">{b.customer} · {fmtDate(b.date)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="row-main">{money(b.total)}</div>
                <StatusPill status={b.status} />
              </div>
            </div>
          ))}
        </div>

        <div className="card glass panel">
          <div className="panel-title">Reorder Alerts</div>
          {low.length === 0 && <div className="empty">All parts stocked up.</div>}
          {low.map((i) => (
            <div key={i.id} className="list-row">
              <div>
                <div className="row-main">{i.part}</div>
                <div className="row-sub">{i.sku} · {i.category}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="row-main" style={{ color: RED }}>{i.stock} left</div>
                <div className="row-sub">reorder at {i.reorder}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- BILLING ---------- */
function Billing({ bills, onNew, onView }) {
  const [q, setQ] = useState("");
  const filtered = bills.filter((b) =>
    b.id.toLowerCase().includes(q.toLowerCase()) || b.customer.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="toolbar">
        <SearchBox q={q} setQ={setQ} placeholder="Search bill no. or customer" />
        <button className="btn-primary glassbtn" onClick={onNew}><Plus size={16} /> New Bill</button>
      </div>
      <div className="card glass">
        {filtered.length === 0 && <div className="empty" style={{ padding: 20 }}>No bills found.</div>}
        {filtered.map((b) => (
          <button key={b.id} className="list-row tappable" onClick={() => onView(b)}>
            <div className="cell-name">
              <div className="avatar" style={{ background: "rgba(0,33,71,0.08)" }}><FileText size={14} color={NAVY} /></div>
              <div>
                <div className="row-main">{b.id}</div>
                <div className="row-sub">{b.customer} · {fmtDate(b.date)}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="row-main">{money(b.total)}</div>
              <StatusPill status={b.status} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- NEW BILL (custom selling price per line) ---------- */
function NewBill({ customers, inventory, bills, user, onClose, onSave }) {
  const [custMode, setCustMode] = useState("existing");
  const [custId, setCustId] = useState(customers[0]?.id ?? "");
  const [walkIn, setWalkIn] = useState("");
  const [walkPhone, setWalkPhone] = useState("");
  const [walkAddr, setWalkAddr] = useState("");
  const [q, setQ] = useState("");
  const [lines, setLines] = useState([]);
  const [gstOn, setGstOn] = useState(true);
  const [status, setStatus] = useState("Paid");

  const results = q ? inventory.filter((i) =>
    i.part.toLowerCase().includes(q.toLowerCase()) || i.sku.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [];

  const addLine = (item) => {
    if (item.stock <= 0) return;
    setLines((ls) => {
      const ex = ls.find((l) => l.partId === item.id);
      if (ex) return ls.map((l) => l.partId === item.id ? { ...l, qty: Math.min(l.qty + 1, item.stock) } : l);
      return [...ls, { partId: item.id, part: item.part, price: item.price, listPrice: item.price, cost: item.cost ?? 0, qty: 1, max: item.stock }];
    });
    setQ("");
  };
  const bump = (id, d) => setLines((ls) => ls
    .map((l) => l.partId === id ? { ...l, qty: Math.max(0, Math.min(l.qty + d, l.max)) } : l)
    .filter((l) => l.qty > 0));
  const setPrice = (id, v) => {
    const n = Math.max(0, Math.round(Number(String(v).replace(/[^\d]/g, "")) || 0));
    setLines((ls) => ls.map((l) => l.partId === id ? { ...l, price: n } : l));
  };

  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const gst = gstOn ? Math.round(subtotal * 0.18) : 0;
  const total = subtotal + gst;
  const existingCust = customers.find((c) => c.id === Number(custId));
  const custName = custMode === "existing" ? (existingCust?.name || "") : walkIn.trim();
  const custPhone = custMode === "existing" ? (existingCust?.phone || "") : walkPhone.trim();
  const custVehicle = custMode === "existing" ? (existingCust?.vehicle || "") : walkAddr.trim();
  const nextNum = 1 + bills.reduce((mx, b) => Math.max(mx, parseInt(String(b.id).replace(/\D/g, ""), 10) || 0), 1000);
  const valid = lines.length > 0 && custName && lines.every((l) => l.price > 0);

  const save = () => valid && onSave({
    id: "INV-" + nextNum, customer: custName, customerPhone: custPhone, customerVehicle: custVehicle,
    items: lines, subtotal, gst, total, date: new Date().toISOString(), status, createdBy: user.username,
  });

  return (
    <Modal title="New Bill" onClose={onClose} wide>
      <div className="form-grid">
        <div>
          <label className="field-label">Customer</label>
          <div className="seg">
            <button className={"seg-btn" + (custMode === "existing" ? " seg-on" : "")} onClick={() => setCustMode("existing")}>Existing</button>
            <button className={"seg-btn" + (custMode === "walkin" ? " seg-on" : "")} onClick={() => setCustMode("walkin")}>Walk-in</button>
          </div>
          {custMode === "existing" ? (
            <>
              <select className="input" value={custId} onChange={(e) => setCustId(e.target.value)}>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {existingCust && (
                <div className="cust-meta">{existingCust.phone}{existingCust.vehicle ? " · " + existingCust.vehicle : ""}</div>
              )}
            </>
          ) : (
            <div className="walkin-fields">
              <input className="input" value={walkIn} onChange={(e) => setWalkIn(e.target.value)} placeholder="Customer name" />
              <input className="input" inputMode="tel" value={walkPhone} onChange={(e) => setWalkPhone(e.target.value)} placeholder="Phone number" />
              <input className="input" value={walkAddr} onChange={(e) => setWalkAddr(e.target.value)} placeholder="Vehicle (optional)" />
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <label className="field-label">Add parts</label>
          <div className="search-box" style={{ width: "100%" }}>
            <Search size={15} color="#8A8F87" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search part name or SKU" />
          </div>
          {results.length > 0 && (
            <div className="dropdown glass">
              {results.map((r) => (
                <button key={r.id} className="dd-row" onClick={() => addLine(r)} disabled={r.stock <= 0}>
                  <span className="row-main" style={{ fontSize: 14 }}>{r.part}</span>
                  <span className="row-sub">{money(r.price)} · {r.stock > 0 ? r.stock + " in stock" : "out of stock"}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lines">
        {lines.length === 0 && <div className="empty" style={{ padding: "16px 0" }}><ShoppingCart size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />Search above to add parts to this bill.</div>}
        {lines.map((l) => (
          <div key={l.partId} className="bill-line">
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="row-main">{l.part}</div>
              <div className="row-sub">list {money(inventoryPrice(l))} · qty × price below</div>
            </div>
            <div className="line-ctrls">
              <div className="qty-ctrl">
                <button className="qty-btn" onClick={() => bump(l.partId, -1)} aria-label="decrease"><Minus size={14} /></button>
                <span className="qty-num">{l.qty}</span>
                <button className="qty-btn" onClick={() => bump(l.partId, 1)} aria-label="increase" disabled={l.qty >= l.max}><Plus size={14} /></button>
              </div>
              <div className="price-edit">
                <span className="rupee">₹</span>
                <input className="price-in" inputMode="numeric" value={l.price} onChange={(e) => setPrice(l.partId, e.target.value)} />
              </div>
              <span className="line-total">{money(l.qty * l.price)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bill-foot">
        <div className="bill-opts">
          <label className="check"><input type="checkbox" checked={gstOn} onChange={(e) => setGstOn(e.target.checked)} /> GST 18%</label>
          <div className="seg">
            <button className={"seg-btn" + (status === "Paid" ? " seg-on" : "")} onClick={() => setStatus("Paid")}>Paid</button>
            <button className={"seg-btn" + (status === "Pending" ? " seg-on" : "")} onClick={() => setStatus("Pending")}>Pending</button>
          </div>
        </div>
        <div className="totals">
          <div className="tot-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          {gstOn && <div className="tot-row"><span>GST (18%)</span><span>{money(gst)}</span></div>}
          <div className="tot-row grand"><span>Total</span><span>{money(total)}</span></div>
        </div>
      </div>

      <button className="btn-primary glassbtn" style={{ width: "100%", justifyContent: "center", marginTop: 14 }}
        disabled={!valid} onClick={save}>Save Bill · {money(total)}</button>
    </Modal>
  );
}
// helper: show the default list price stored on the line's origin item (falls back to line price)
function inventoryPrice(line) { return line.listPrice ?? line.price; }

/* ---------- SCAN SUPPLIER BILL (AI reads the photo) ---------- */
function ScanBill({ inventory, onClose, onImport }) {
  const [stage, setStage] = useState("pick"); // pick | reading | review | error
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setStage("reading"); setErr("");
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(",")[1]);
        r.onerror = () => rej(new Error("read failed"));
        r.readAsDataURL(file);
      });
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user", content: [
              { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: b64 } },
              { type: "text", text: "This is a photo of a supplier invoice/purchase bill for an automotive parts shop in India (may be printed, semi-printed, or partly handwritten, in English or Hindi). Extract every purchased product line. Respond with ONLY valid JSON, no markdown fences, no explanation, exactly this shape: {\"items\":[{\"name\":\"part name\",\"qty\":1,\"unit_cost\":0}]} where qty is quantity purchased (number) and unit_cost is per-unit purchase price in rupees (number). Translate Hindi part names to simple English. Ignore taxes, discounts, freight, totals and non-product rows. If this is not a purchase bill, return {\"items\":[]}." }
            ]
          }]
        })
      });
      const data = await resp.json();
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      if (items.length === 0) { setErr("Couldn't find any product lines in this photo. Try a clearer, straighter shot of the bill."); setStage("error"); return; }
      setRows(items.slice(0, 40).map((it, i) => {
        const cost = Math.max(0, Math.round(Number(it.unit_cost) || 0));
        return {
          key: i, name: String(it.name || "Unknown item").slice(0, 60),
          qty: Math.max(1, Math.round(Number(it.qty) || 1)),
          cost, sell: cost > 0 ? Math.round(cost * 1.25) : 0,
        };
      }));
      setStage("review");
    } catch (ex) {
      setErr("Could not read the bill photo. Check your connection and try again.");
      setStage("error");
    }
  };

  const edit = (key, field, v) => setRows((rs) => rs.map((r) => {
    if (r.key !== key) return r;
    if (field === "name") return { ...r, name: v };
    const n = Math.max(0, Math.round(Number(String(v).replace(/[^\d]/g, "")) || 0));
    return { ...r, [field]: n };
  }));
  const remove = (key) => setRows((rs) => rs.filter((r) => r.key !== key));
  const existing = (name) => inventory.some((i) => i.part.trim().toLowerCase() === name.trim().toLowerCase());
  const valid = rows.length > 0 && rows.every((r) => r.name.trim() && r.qty > 0);

  return (
    <Modal title="Scan Supplier Bill" onClose={onClose} wide>
      {stage === "pick" && (
        <div className="scan-pick">
          <div className="scan-hero"><ScanLine size={34} color={NAVY} /></div>
          <p className="scan-copy">Take a photo of the supplier's bill (or choose one from the gallery). The AI reads the items, quantities, and purchase rates — you review, set selling prices, and everything lands in stock in one go.</p>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          <button className="btn-primary glassbtn" style={{ justifyContent: "center", width: "100%" }} onClick={() => fileRef.current && fileRef.current.click()}>
            <Camera size={16} /> Choose / Take Photo
          </button>
          <p className="scan-note">Works with printed, semi-printed, and most handwritten bills, in English or Hindi.</p>
        </div>
      )}

      {stage === "reading" && (
        <div className="scan-pick">
          <div className="scan-hero spin"><Loader2 size={34} color={NAVY} /></div>
          <p className="scan-copy">Reading the bill… extracting items, quantities, and rates.</p>
        </div>
      )}

      {stage === "error" && (
        <div className="scan-pick">
          <div className="scan-hero" style={{ background: "rgba(179,38,30,0.1)" }}><AlertCircle size={34} color={RED} /></div>
          <p className="scan-copy">{err}</p>
          <button className="btn-primary glassbtn" style={{ justifyContent: "center", width: "100%" }} onClick={() => setStage("pick")}>Try Again</button>
        </div>
      )}

      {stage === "review" && (
        <div>
          <p className="scan-copy" style={{ textAlign: "left", marginTop: 0 }}>Found <b>{rows.length}</b> item{rows.length > 1 ? "s" : ""}. Check the details, set your selling price, then import.</p>
          <div className="scan-head"><span>Item</span><span>Qty</span><span>Cost ₹</span><span>Sell ₹</span><span /></div>
          <div className="scan-rows">
            {rows.map((r) => (
              <div key={r.key} className="scan-row">
                <div className="scan-name">
                  <input className="input slim" value={r.name} onChange={(e) => edit(r.key, "name", e.target.value)} />
                  {existing(r.name) ? <span className="match-badge">adds to existing</span> : <span className="new-badge">new item</span>}
                </div>
                <input className="input slim num" inputMode="numeric" value={r.qty} onChange={(e) => edit(r.key, "qty", e.target.value)} />
                <input className="input slim num" inputMode="numeric" value={r.cost} onChange={(e) => edit(r.key, "cost", e.target.value)} />
                <input className="input slim num" inputMode="numeric" value={r.sell} onChange={(e) => edit(r.key, "sell", e.target.value)} />
                <button className="icon-btn danger" onClick={() => remove(r.key)} aria-label="remove"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="scan-actions">
            <button className="btn-ghost" onClick={() => setStage("pick")}><Camera size={15} /> Rescan</button>
            <button className="btn-primary glassbtn" disabled={!valid} onClick={() => onImport(rows)}>
              Import {rows.length} to Stock
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ---------- BILL VIEW (printable) ---------- */
function BillView({ bill, onClose, onMarkPaid, canMarkPaid }) {
  const invRef = useRef(null);
  const [saving, setSaving] = useState(false);
  if (!bill) return null;

  const downloadImage = async () => {
    const node = invRef.current;
    if (!node) return;
    setSaving(true);
    try {
      const lib = await loadHtmlToImage();
      const dataUrl = await lib.toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const a = document.createElement("a");
      a.download = bill.id + "-" + bill.customer.replace(/[^\w]+/g, "-") + ".png";
      a.href = dataUrl;
      a.click();
    } catch (e) {
      // Fallback: trigger the print dialog (user can "Save as PDF")
      window.print();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal glassmodal print-invoice" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head no-print">
          <h3>Bill {bill.id}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="invoice" ref={invRef}>
          <div className="inv-head">
            <div>
              <div className="inv-shop">PartsPilot Auto Parts</div>
              <div className="row-sub">Aminabad, Lucknow · GSTIN 09XXXXX0000X1Z5</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="row-main">{bill.id}</div>
              <div className="row-sub">{fmtDate(bill.date)}</div>
            </div>
          </div>
          <div className="inv-cust">
            <span className="row-sub">Billed to</span>
            <div className="row-main">{bill.customer}</div>
            {(bill.customerPhone || bill.customerVehicle) && (
              <div className="row-sub" style={{ marginTop: 2 }}>
                {bill.customerPhone}{bill.customerPhone && bill.customerVehicle ? " · " : ""}{bill.customerVehicle}
              </div>
            )}
          </div>
          <table className="inv-table">
            <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
            <tbody>
              {bill.items.map((l, i) => (
                <tr key={i}>
                  <td>{l.part}</td><td>{l.qty}</td><td>{money(l.price)}</td>
                  <td style={{ textAlign: "right" }}>{money(l.qty * l.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="inv-totals">
            <div className="tot-row"><span>Subtotal</span><span>{money(bill.subtotal)}</span></div>
            {bill.gst > 0 && <div className="tot-row"><span>GST (18%)</span><span>{money(bill.gst)}</span></div>}
            <div className="tot-row grand"><span>Total</span><span>{money(bill.total)}</span></div>
          </div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <StatusPill status={bill.status} />
            <span className="row-sub">Billed by: {bill.createdBy}</span>
          </div>
        </div>

        <div className="modal-actions no-print">
          {bill.status === "Pending" && canMarkPaid && (
            <button className="btn-ghost" onClick={() => onMarkPaid(bill.id)}><CheckCircle2 size={16} /> Mark Paid</button>
          )}
          <button className="btn-ghost" onClick={downloadImage} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin-inline" /> : <ImageDown size={16} />} {saving ? "Saving…" : "Download Image"}
          </button>
          <button className="btn-primary glassbtn" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
        </div>
      </div>
    </div>
  );
}

// Lazy-load html-to-image from CDN once, so we can rasterize the invoice to PNG.
let _h2iPromise = null;
function loadHtmlToImage() {
  if (window.htmlToImage) return Promise.resolve(window.htmlToImage);
  if (_h2iPromise) return _h2iPromise;
  _h2iPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js";
    s.onload = () => window.htmlToImage ? resolve(window.htmlToImage) : reject(new Error("lib missing"));
    s.onerror = () => reject(new Error("cdn failed"));
    document.head.appendChild(s);
  });
  return _h2iPromise;
}

/* ---------- CUSTOMERS ---------- */
function Customers({ customers, onAdd }) {
  const [q, setQ] = useState("");
  const filtered = customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || (c.phone || "").includes(q));
  return (
    <div>
      <div className="toolbar">
        <SearchBox q={q} setQ={setQ} placeholder="Search name or phone" />
        <button className="btn-primary glassbtn" onClick={onAdd}><Plus size={16} /> New Customer</button>
      </div>
      <div className="card glass">
        {filtered.length === 0 && <div className="empty" style={{ padding: 20 }}>No customers found.</div>}
        {filtered.map((c) => (
          <div key={c.id} className="list-row">
            <div className="cell-name">
              <div className="avatar txt" style={{ background: "rgba(46,90,143,0.1)", color: BLUE }}>{initials(c.name)}</div>
              <div style={{ minWidth: 0 }}>
                <div className="row-main">{c.name}</div>
                <div className="row-sub"><Phone size={11} style={{ verticalAlign: "-1px" }} /> {c.phone} · <Car size={11} style={{ verticalAlign: "-1px" }} /> {c.vehicle}</div>
              </div>
            </div>
            <span className="tag" style={{ background: c.type === "Wholesale" ? "rgba(46,90,143,0.12)" : "rgba(140,106,47,0.12)", color: c.type === "Wholesale" ? BLUE : BRONZE }}>{c.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- INVENTORY (role-aware + scan) ---------- */
function Inventory({ inventory, role, onAdd, onScan, onAdjust }) {
  const [q, setQ] = useState("");
  const canAddPart = role === "Owner";
  const canAddStock = role !== "Staff";
  const canScan = role !== "Staff";
  const filtered = inventory.filter((i) => i.part.toLowerCase().includes(q.toLowerCase()) || i.sku.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="toolbar">
        <SearchBox q={q} setQ={setQ} placeholder="Search part or SKU" />
        {canScan && <button className="btn-tan glassbtn" onClick={onScan}><ScanLine size={16} /> Scan Bill</button>}
        {canAddPart && <button className="btn-primary glassbtn" onClick={onAdd}><Plus size={16} /> Add Part</button>}
      </div>

      {role === "Staff" && (
        <div className="notice">You can view stock and record stock-outs. Only owners can add new products.</div>
      )}

      <div className="card glass">
        {filtered.length === 0 && <div className="empty" style={{ padding: 20 }}>No parts found.</div>}
        {filtered.map((i) => {
          const low = i.stock <= i.reorder;
          return (
            <div key={i.id} className="list-row">
              <div style={{ minWidth: 0 }}>
                <div className="row-main">{i.part} {low && <span className="low-badge">LOW</span>}</div>
                <div className="row-sub">{i.sku} · {i.category} · cost {money(i.cost || 0)} · sells {money(i.price)}</div>
              </div>
              <div className="qty-ctrl">
                <button className="qty-btn" onClick={() => onAdjust(i.id, -1)} disabled={i.stock <= 0} aria-label="stock out"><Minus size={14} /></button>
                <span className="qty-num" style={{ minWidth: 34, color: low ? RED : undefined }}>{i.stock}</span>
                {canAddStock
                  ? <button className="qty-btn" onClick={() => onAdjust(i.id, 1)} aria-label="stock in"><Plus size={14} /></button>
                  : <span className="qty-btn ghost" title="Only owner/counter can add stock"><Plus size={14} /></span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- ATTENDANCE (Owner + Counter) ---------- */
function Attendance({ users, attendance, onMark }) {
  const employees = users.filter((u) => u.role !== "Owner");
  const [month, setMonth] = useState(5);
  const [year] = useState(2026);
  const [mode, setMode] = useState("today");
  const [q, setQ] = useState("");

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const dateKey = isCurrentMonth ? ymd(year, month, today.getDate()) : ymd(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const stat = (u, key) => attendance[`${u.id}_${key}`];
  const filteredEmployees = employees.filter((u) =>
    u.name.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase()));

  const monthTotals = (u) => {
    let P = 0, A = 0, H = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const s = attendance[`${u.id}_${ymd(year, month, d)}`];
      if (s === "P") P++; else if (s === "A") A++; else if (s === "H") H++;
    }
    return { P, A, H, payable: P + H * 0.5 };
  };

  const changeMonth = (dir) => setMonth((m) => Math.min(11, Math.max(0, m + dir)));

  return (
    <div>
      <div className="seg" style={{ marginBottom: 14 }}>
        <button className={"seg-btn" + (mode === "today" ? " seg-on" : "")} onClick={() => setMode("today")}>Mark Attendance</button>
        <button className={"seg-btn" + (mode === "report" ? " seg-on" : "")} onClick={() => setMode("report")}>Monthly Report</button>
      </div>

      {mode === "today" ? (
        <>
          <div className="att-daybar glass">
            <CalendarDays size={16} color={NAVY} />
            <span className="row-main">{isCurrentMonth ? "Today · " + fmtDate(new Date().toISOString()) : "1 " + MONTHS[month] + " " + year}</span>
            <span className="row-sub" style={{ marginLeft: "auto" }}>Tap a status. Tap again to clear.</span>
          </div>
          <div className="toolbar"><SearchBox q={q} setQ={setQ} placeholder="Search employee" /></div>
          <div className="card glass">
            {filteredEmployees.length === 0 && <div className="empty" style={{ padding: 20 }}>No employees found.</div>}
            {filteredEmployees.map((u) => {
              const s = stat(u, dateKey);
              return (
                <div key={u.id} className={"list-row" + (u.active ? "" : " inactive-row")}>
                  <div className="cell-name">
                    <div className="avatar txt" style={{ background: ROLE_COLOR[u.role] + "14", color: ROLE_COLOR[u.role] }}>{initials(u.name)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="row-main">{u.name}</div>
                      <div className="row-sub">{u.username} · <span style={{ color: ROLE_COLOR[u.role], fontWeight: 600 }}>{u.role}</span></div>
                    </div>
                  </div>
                  <div className="att-marks">
                    <button className={"mk mk-p" + (s === "P" ? " on" : "")} onClick={() => onMark(u.id, dateKey, "P")}>P</button>
                    <button className={"mk mk-h" + (s === "H" ? " on" : "")} onClick={() => onMark(u.id, dateKey, "H")}>H</button>
                    <button className={"mk mk-a" + (s === "A" ? " on" : "")} onClick={() => onMark(u.id, dateKey, "A")}>A</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="att-legend">
            <span><span className="dot p" /> Present</span>
            <span><span className="dot h" /> Half-day</span>
            <span><span className="dot a" /> Absent</span>
          </div>
        </>
      ) : (
        <>
          <div className="att-monthnav">
            <button className="icon-btn" onClick={() => changeMonth(-1)} disabled={month === 0}><ChevronLeft size={16} /></button>
            <span className="row-main">{MONTHS[month]} {year}</span>
            <button className="icon-btn" onClick={() => changeMonth(1)} disabled={month === 11}><ChevronRight size={16} /></button>
          </div>
          <div className="card glass">
            <div className="att-report-head">
              <span>Employee</span>
              <span className="ar-nums"><span>P</span><span>H</span><span>A</span><span>Payable</span></span>
            </div>
            {employees.map((u) => {
              const t = monthTotals(u);
              const marked = t.P + t.A + t.H;
              return (
                <div key={u.id} className="list-row">
                  <div className="cell-name">
                    <div className="avatar txt" style={{ background: ROLE_COLOR[u.role] + "14", color: ROLE_COLOR[u.role] }}>{initials(u.name)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="row-main">{u.name}</div>
                      <div className="row-sub">{marked === 0 ? "Not marked" : marked + " days marked"}</div>
                    </div>
                  </div>
                  <span className="ar-nums">
                    <span className="ar-p">{t.P}</span>
                    <span className="ar-h">{t.H}</span>
                    <span className="ar-a">{t.A}</span>
                    <span className="ar-pay">{t.payable}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="att-legend">
            <span><span className="dot p" /> Present days</span>
            <span><span className="dot h" /> Half-days</span>
            <span><span className="dot a" /> Absent</span>
            <span style={{ color: "#6B7075" }}>Payable = present + ½ × half-days</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- TEAM (Owner only) ---------- */
function Team({ users, setUsers, me, onAdd, pop }) {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const counts = useMemo(() => ({
    Owner: users.filter((u) => u.role === "Owner").length,
    Counter: users.filter((u) => u.role === "Counter").length,
    Staff: users.filter((u) => u.role === "Staff").length,
  }), [users]);

  const filtered = users.filter((u) =>
    (roleFilter === "All" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase())));

  const toggleActive = (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    if (target.role === "Owner" && target.active && users.filter((u) => u.role === "Owner" && u.active).length <= 1) {
      pop("At least one owner must stay active"); return;
    }
    if (target.id === me.id) { pop("You can't deactivate your own account"); return; }
    setUsers((us) => us.map((u) => u.id === id ? { ...u, active: !u.active } : u));
    pop(target.active ? target.username + " deactivated" : target.username + " reactivated");
  };

  const resetPassword = (id) => {
    const temp = "temp@" + Math.floor(1000 + Math.random() * 9000);
    setUsers((us) => us.map((u) => u.id === id ? { ...u, password: temp } : u));
    const t = users.find((u) => u.id === id);
    pop("New password for " + (t?.username || "user") + ": " + temp);
  };

  return (
    <div>
      <div className="stat-grid three">
        {["Owner", "Counter", "Staff"].map((r) => (
          <div key={r} className="card glass stat-card">
            <div className="stat-icon" style={{ background: ROLE_COLOR[r] + "16" }}><ShieldCheck size={19} color={ROLE_COLOR[r]} /></div>
            <div className="stat-value">{counts[r]}</div>
            <div className="stat-label">{r} account{counts[r] !== 1 ? "s" : ""}</div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <SearchBox q={q} setQ={setQ} placeholder="Search name or username" />
        <button className="btn-primary glassbtn" onClick={onAdd}><Plus size={16} /> Add User</button>
      </div>

      <div className="seg" style={{ marginBottom: 12 }}>
        {["All", "Owner", "Counter", "Staff"].map((r) => (
          <button key={r} className={"seg-btn" + (roleFilter === r ? " seg-on" : "")} onClick={() => setRoleFilter(r)}>{r}</button>
        ))}
      </div>

      <div className="card glass">
        {filtered.length === 0 && <div className="empty" style={{ padding: 20 }}>No users found.</div>}
        {filtered.map((u) => (
          <div key={u.id} className={"list-row" + (u.active ? "" : " inactive-row")}>
            <div className="cell-name">
              <div className="avatar txt" style={{ background: ROLE_COLOR[u.role] + "14", color: ROLE_COLOR[u.role] }}>{initials(u.name)}</div>
              <div style={{ minWidth: 0 }}>
                <div className="row-main">{u.name} {u.id === me.id && <span className="you-badge">you</span>}{!u.active && <span className="off-badge">inactive</span>}</div>
                <div className="row-sub">{u.username} · <span style={{ color: ROLE_COLOR[u.role], fontWeight: 600 }}>{u.role}</span></div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
              <button className="icon-btn" title="Reset password" onClick={() => resetPassword(u.id)}><KeyRound size={15} /></button>
              <button className={"icon-btn" + (u.active ? " danger" : "")} title={u.active ? "Deactivate" : "Reactivate"} onClick={() => toggleActive(u.id)}>
                {u.active ? <UserX size={15} /> : <UserCheck size={15} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- REPORTS (P&L + margin + expenses) ---------- */
function Reports({ bills, expenses, onAddExpense, onDeleteExpense }) {
  const [view, setView] = useState("Monthly");
  const year = 2026;

  const monthly = useMemo(() => {
    const rows = MONTHS.map((m, idx) => ({ m, idx, revenue: 0, expense: 0, margin: 0 }));
    bills.forEach((b) => { const d = new Date(b.date); if (d.getFullYear() === year) { rows[d.getMonth()].revenue += b.total; rows[d.getMonth()].margin += billProfit(b); } });
    expenses.forEach((e) => { const d = new Date(e.date); if (d.getFullYear() === year) rows[d.getMonth()].expense += e.amount; });
    return rows.filter((r) => r.revenue > 0 || r.expense > 0);
  }, [bills, expenses]);

  const annual = useMemo(() => {
    const rev = monthly.reduce((s, r) => s + r.revenue, 0);
    const exp = monthly.reduce((s, r) => s + r.expense, 0);
    const margin = monthly.reduce((s, r) => s + r.margin, 0);
    return { rev, exp, margin, net: margin - exp };
  }, [monthly]);

  const maxVal = Math.max(...monthly.map((r) => Math.max(r.revenue, r.expense)), 1);

  return (
    <div>
      <div className="stat-grid">
        <div className="card glass stat-card"><div className="stat-icon" style={{ background: "rgba(0,33,71,0.09)" }}><TrendingUp size={19} color={NAVY} /></div>
          <div className="stat-value">{money(annual.rev)}</div><div className="stat-label">Revenue · {year}</div></div>
        <div className="card glass stat-card"><div className="stat-icon" style={{ background: "rgba(140,106,47,0.12)" }}><BadgePercent size={19} color={BRONZE} /></div>
          <div className="stat-value">{money(annual.margin)}</div><div className="stat-label">Margin (sell − cost) · {year}</div></div>
        <div className="card glass stat-card"><div className="stat-icon" style={{ background: "rgba(179,38,30,0.1)" }}><TrendingDown size={19} color={RED} /></div>
          <div className="stat-value">{money(annual.exp)}</div><div className="stat-label">Expenses · {year}</div></div>
        <div className="card glass stat-card"><div className="stat-icon" style={{ background: "rgba(46,90,143,0.11)" }}><Wallet size={19} color={BLUE} /></div>
          <div className="stat-value" style={{ color: annual.net >= 0 ? NAVY : RED }}>{money(annual.net)}</div>
          <div className="stat-label">Net Profit (margin − expenses)</div></div>
      </div>

      <div className="card glass panel">
        <div className="panel-title-row">
          <div className="panel-title">Profit &amp; Loss</div>
          <div className="seg">
            <button className={"seg-btn" + (view === "Monthly" ? " seg-on" : "")} onClick={() => setView("Monthly")}>Monthly</button>
            <button className={"seg-btn" + (view === "Annual" ? " seg-on" : "")} onClick={() => setView("Annual")}>Annual</button>
          </div>
        </div>

        {view === "Monthly" ? (
          <div className="pnl-list">
            {monthly.map((r) => {
              const net = r.margin - r.expense;
              return (
                <div key={r.m} className="pnl-row">
                  <div className="pnl-month">{r.m}</div>
                  <div className="pnl-bars">
                    <div className="bar rev" style={{ width: Math.max(2, (r.revenue / maxVal) * 100) + "%" }} />
                    <div className="bar exp" style={{ width: Math.max(2, (r.expense / maxVal) * 100) + "%" }} />
                  </div>
                  <div className="pnl-nums">
                    <span className="row-sub">{money(r.revenue)} sales · {money(r.margin)} margin · {money(r.expense)} out</span>
                    <span className="row-main" style={{ color: net >= 0 ? NAVY : RED }}>{net >= 0 ? "+" : ""}{money(net)}</span>
                  </div>
                </div>
              );
            })}
            <div className="legend"><span className="lg rev" />Revenue<span className="lg exp" style={{ marginLeft: 14 }} />Expenses<span style={{ marginLeft: 14 }}>Net = margin − expenses</span></div>
          </div>
        ) : (
          <div className="annual-box">
            <div className="tot-row"><span>Total Sales (with GST)</span><span style={{ fontWeight: 700 }}>{money(annual.rev)}</span></div>
            <div className="tot-row"><span>Margin earned (sell − cost)</span><span style={{ color: BRONZE, fontWeight: 700 }}>{money(annual.margin)}</span></div>
            <div className="tot-row"><span>Total Expenses</span><span style={{ color: RED, fontWeight: 700 }}>− {money(annual.exp)}</span></div>
            <div className="tot-row grand"><span>Net Profit ({year})</span><span style={{ color: annual.net >= 0 ? NAVY : RED }}>{money(annual.net)}</span></div>
          </div>
        )}
      </div>

      <div className="card glass panel" style={{ marginTop: 16 }}>
        <div className="panel-title-row">
          <div className="panel-title">Expenses</div>
          <button className="btn-primary glassbtn sm" onClick={onAddExpense}><Plus size={15} /> Add Expense</button>
        </div>
        {expenses.length === 0 && <div className="empty">No expenses recorded yet.</div>}
        {expenses.map((e) => (
          <div key={e.id} className="list-row">
            <div>
              <div className="row-main">{e.label}</div>
              <div className="row-sub">{e.category} · {fmtDate(e.date)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="row-main" style={{ color: RED }}>− {money(e.amount)}</span>
              <button className="icon-btn danger" onClick={() => onDeleteExpense(e.id)} aria-label="delete expense"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- SMALL PARTS ---------- */
function SearchBox({ q, setQ, placeholder }) {
  return (
    <div className="search-box glass">
      <Search size={15} color="#8A8F87" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
      {q && <button className="icon-btn xs" onClick={() => setQ("")}><X size={13} /></button>}
    </div>
  );
}
function StatusPill({ status }) {
  const map = { Paid: [NAVY, "rgba(0,33,71,0.1)"], Pending: [BRONZE, "rgba(140,106,47,0.14)"] };
  const [c, bg] = map[status] || ["#666", "#eee"];
  return <span className="pill" style={{ color: c, background: bg }}>{status}</span>;
}
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="overlay no-print" onClick={onClose}>
      <div className={"modal glassmodal" + (wide ? " wide" : "")} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}
function AddCustomer({ onClose, onAdd }) {
  const [f, setF] = useState({ name: "", phone: "", vehicle: "", type: "Retail" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title="New Customer" onClose={onClose}>
      <div className="form-stack">
        <div><label className="field-label">Business / Name</label><input className="input" value={f.name} onChange={set("name")} placeholder="e.g. Gupta Motors" /></div>
        <div><label className="field-label">Phone</label><input className="input" inputMode="tel" value={f.phone} onChange={set("phone")} placeholder="98xxx xxxxx" /></div>
        <div><label className="field-label">Vehicle(s)</label><input className="input" value={f.vehicle} onChange={set("vehicle")} placeholder="e.g. Maruti Swift" /></div>
        <div><label className="field-label">Type</label>
          <select className="input" value={f.type} onChange={set("type")}><option>Retail</option><option>Wholesale</option></select></div>
      </div>
      <button className="btn-primary glassbtn" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
        disabled={!f.name.trim()} onClick={() => onAdd(f)}>Add Customer</button>
    </Modal>
  );
}
function AddPart({ onClose, onAdd }) {
  const [f, setF] = useState({ part: "", sku: "", category: "Accessories", stock: "", cost: "", price: "", reorder: "5" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.part.trim() && Number(f.price) > 0 && Number(f.stock) >= 0;
  return (
    <Modal title="Add Part" onClose={onClose}>
      <div className="form-stack">
        <div><label className="field-label">Part name</label><input className="input" value={f.part} onChange={set("part")} placeholder="e.g. Spark Plug" /></div>
        <div className="form-grid">
          <div><label className="field-label">SKU</label><input className="input" value={f.sku} onChange={set("sku")} placeholder="SP-1100" /></div>
          <div><label className="field-label">Category</label>
            <select className="input" value={f.category} onChange={set("category")}>
              {["Brakes", "Filters", "Lighting", "Transmission", "Accessories", "Lubricants", "Electrical", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select></div>
        </div>
        <div className="form-grid">
          <div><label className="field-label">Purchase rate (₹)</label><input className="input" inputMode="numeric" value={f.cost} onChange={set("cost")} placeholder="0" /></div>
          <div><label className="field-label">Selling price (₹)</label><input className="input" inputMode="numeric" value={f.price} onChange={set("price")} placeholder="0" /></div>
        </div>
        <div className="form-grid">
          <div><label className="field-label">Stock qty</label><input className="input" inputMode="numeric" value={f.stock} onChange={set("stock")} placeholder="0" /></div>
          <div><label className="field-label">Reorder alert at</label><input className="input" inputMode="numeric" value={f.reorder} onChange={set("reorder")} /></div>
        </div>
      </div>
      <button className="btn-primary glassbtn" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} disabled={!valid}
        onClick={() => onAdd({ part: f.part.trim(), sku: f.sku.trim() || "SKU-" + Date.now() % 10000, category: f.category, stock: Number(f.stock) || 0, cost: Number(f.cost) || 0, price: Number(f.price) || 0, reorder: Number(f.reorder) || 5 })}>
        Add to Inventory</button>
    </Modal>
  );
}
function AddExpense({ onClose, onAdd }) {
  const [f, setF] = useState({ label: "", category: "Rent", amount: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.label.trim() && Number(f.amount) > 0;
  return (
    <Modal title="Add Expense" onClose={onClose}>
      <div className="form-stack">
        <div><label className="field-label">Description</label><input className="input" value={f.label} onChange={set("label")} placeholder="e.g. Shop Rent — July" /></div>
        <div className="form-grid">
          <div><label className="field-label">Category</label>
            <select className="input" value={f.category} onChange={set("category")}>
              {["Rent", "Utilities", "Salaries", "Transport", "Misc"].map((c) => <option key={c}>{c}</option>)}
            </select></div>
          <div><label className="field-label">Amount (₹)</label><input className="input" inputMode="numeric" value={f.amount} onChange={set("amount")} placeholder="0" /></div>
        </div>
      </div>
      <button className="btn-primary glassbtn" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} disabled={!valid}
        onClick={() => onAdd({ label: f.label.trim(), category: f.category, amount: Number(f.amount) })}>Record Expense</button>
    </Modal>
  );
}
function AddUser({ users, onClose, onAdd }) {
  const [f, setF] = useState({ name: "", role: "Staff" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const nextUsername = (role) => {
    const prefix = role.toLowerCase();
    let n = 1;
    while (users.some((u) => u.username === prefix + n)) n++;
    return prefix + n;
  };
  const username = nextUsername(f.role);
  const tempPass = f.role.toLowerCase() + "@123";
  const valid = f.name.trim().length >= 2;
  return (
    <Modal title="Add User" onClose={onClose}>
      <div className="form-stack">
        <div><label className="field-label">Full name</label><input className="input" value={f.name} onChange={set("name")} placeholder="e.g. Suresh Kumar" /></div>
        <div><label className="field-label">Role</label>
          <select className="input" value={f.role} onChange={set("role")}>
            <option>Staff</option><option>Counter</option><option>Owner</option>
          </select></div>
        <div className="cred-preview">
          <div className="row-sub">Auto-generated credentials</div>
          <div className="row-main" style={{ marginTop: 3 }}>{username} <span style={{ color: "#8A8F87", fontWeight: 400 }}>/</span> {tempPass}</div>
          <div className="row-sub" style={{ marginTop: 3 }}>Share these with the employee. They should be changed after first login (needs backend).</div>
        </div>
      </div>
      <button className="btn-primary glassbtn" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} disabled={!valid}
        onClick={() => onAdd({ id: Date.now(), username, password: tempPass, name: f.name.trim(), role: f.role, active: true })}>
        Create {f.role} Account</button>
    </Modal>
  );
}

/* ================= STYLES (Oxford Blue × Tan glassmorphism) ================= */
const CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  .app { display:flex; min-height:100vh; background:#F1E9D8; font-family:'Inter',system-ui,-apple-system,sans-serif; color:#14212F; position:relative; }
  button { font-family:inherit; cursor:pointer; }
  input, select { font-family:inherit; font-size:15px; }

  /* ambient blobs the glass blurs over */
  .bg-blobs { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
  .blob { position:absolute; border-radius:50%; filter:blur(70px); opacity:0.5; }
  .b1 { width:480px; height:480px; background:#D2B48C; top:-140px; right:-120px; }
  .b2 { width:420px; height:420px; background:rgba(0,33,71,0.35); bottom:-160px; left:22%; }
  .b3 { width:300px; height:300px; background:#E8D3AC; top:38%; left:-120px; }

  /* glass primitives */
  .glass { background:rgba(255,255,255,0.55); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.65); box-shadow:0 8px 32px rgba(0,33,71,0.08); }
  .glassbtn { backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.35) !important; box-shadow:0 4px 18px rgba(0,33,71,0.22), inset 0 1px 0 rgba(255,255,255,0.28); }
  .glassmodal { background:rgba(255,255,255,0.82); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.7); }

  /* Login */
  .login-wrap { min-height:100vh; display:grid; place-items:center; padding:20px; font-family:'Inter',system-ui,sans-serif; color:#14212F;
    background:linear-gradient(126deg, #002147 0%, #002147 46%, #14355C 50%, #D2B48C 54%, #D2B48C 100%); }
  .login-card { border-radius:20px; padding:28px; width:100%; max-width:400px; }
  .login-brand { display:flex; gap:11px; align-items:center; margin-bottom:22px; }
  .brand-icon { width:38px; height:38px; border-radius:11px; background:#002147; display:grid; place-items:center; flex-shrink:0; box-shadow:0 4px 14px rgba(0,33,71,0.3); }
  .brand-icon.tanbg { background:#D2B48C; box-shadow:0 4px 14px rgba(0,0,0,0.25); }
  .brand-icon.sm { width:30px; height:30px; border-radius:9px; }
  .brand-name { font-weight:700; font-size:16px; letter-spacing:-0.01em; }
  .brand-sub { font-size:11.5px; color:#6B7075; }
  .pw-wrap { position:relative; }
  .pw-eye { position:absolute; right:8px; top:50%; transform:translateY(-50%); border:none; background:none; color:#8A8F87; padding:6px; }
  .login-err { margin-top:12px; font-size:13px; color:#B3261E; background:rgba(179,38,30,0.09); border-radius:9px; padding:9px 12px; }
  .demo-box { margin-top:22px; border-top:1px solid rgba(0,33,71,0.12); padding-top:16px; }
  .demo-title { font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:#6B7075; margin-bottom:10px; font-weight:600; }
  .demo-row { display:flex; align-items:center; gap:9px; width:100%; padding:10px 12px; border:1px solid rgba(0,33,71,0.12); background:rgba(255,255,255,0.5); border-radius:10px; margin-bottom:7px; font-size:13px; }
  .demo-row:hover { border-color:#002147; }
  .role-dot { width:9px; height:9px; border-radius:3px; flex-shrink:0; }
  .demo-role { font-weight:600; width:64px; text-align:left; }
  .demo-cred { color:#6B7075; font-size:12.5px; margin-left:auto; }
  .demo-hint { font-size:11.5px; color:#6B7075; text-align:center; margin-top:8px; }

  /* Sidebar — deep navy glass */
  .sidebar { width:236px; background:rgba(0,26,56,0.94); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border-right:1px solid rgba(255,255,255,0.08); padding:20px 16px; display:flex; flex-direction:column; position:sticky; top:0; height:100vh; z-index:5; }
  .nav-btn { display:flex; align-items:center; gap:11px; width:100%; padding:11px 13px; border:none; background:transparent; border-radius:11px; color:rgba(255,255,255,0.62); font-size:14px; font-weight:500; margin-bottom:3px; }
  .nav-btn:hover { background:rgba(255,255,255,0.07); color:#fff; }
  .nav-active { background:rgba(210,180,140,0.18); color:#EBD9BC; font-weight:600; border:1px solid rgba(210,180,140,0.25); }
  .user-chip { display:flex; align-items:center; gap:10px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.1); }
  .user-name { font-size:13.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .user-role { font-size:11.5px; font-weight:600; }

  .main { flex:1; display:flex; flex-direction:column; min-width:0; z-index:1; }
  .topbar { display:flex; align-items:center; gap:12px; padding:15px 26px; position:sticky; top:0; z-index:20; border-radius:0; border-left:none; border-right:none; border-top:none; }
  .topbar-mobile-brand { display:none; align-items:center; gap:8px; }
  .page-title { margin:0; font-size:20px; font-weight:700; letter-spacing:-0.02em; flex:1; color:#0E2036; }
  .topbar-right { display:flex; align-items:center; gap:8px; }
  .role-pill { font-size:12px; font-weight:600; padding:5px 11px; border-radius:20px; }
  .content { padding:24px 26px 90px; flex:1; max-width:1060px; width:100%; margin:0 auto; }
  .greeting { font-size:15px; color:#43506B; margin-bottom:14px; font-weight:500; }

  .bottom-nav { display:none; position:fixed; bottom:0; left:0; right:0; padding:6px 6px calc(6px + env(safe-area-inset-bottom)); z-index:40; border-radius:18px 18px 0 0; border-bottom:none; background:rgba(255,255,255,0.72); }
  .bnav-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; border:none; background:none; color:#7C8291; font-size:10px; font-weight:600; padding:7px 1px; border-radius:10px; min-width:0; }
  .bnav-active { color:#002147; }

  .card { border-radius:16px; overflow:hidden; }
  .panel { padding:18px; overflow:visible; }
  .panel-title { font-size:14px; font-weight:700; letter-spacing:-0.01em; }
  .panel-title-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:10px; flex-wrap:wrap; }
  .panel > .panel-title { margin-bottom:10px; }
  .list-row { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:13px 16px; border-bottom:1px solid rgba(0,33,71,0.07); width:100%; background:none; border-left:none; border-right:none; border-top:none; text-align:left; }
  .panel .list-row { padding:11px 0; }
  .list-row:last-child { border-bottom:none; }
  .tappable:hover { background:rgba(255,255,255,0.5); }
  .inactive-row { opacity:0.55; }
  .row-main { font-size:14.5px; font-weight:600; }
  .row-sub { font-size:12.5px; color:#6B7075; margin-top:2px; }
  .cell-name { display:flex; align-items:center; gap:11px; min-width:0; }
  .avatar { width:34px; height:34px; border-radius:10px; display:grid; place-items:center; flex-shrink:0; }
  .avatar.txt { font-size:12px; font-weight:700; }
  .empty { color:#6B7075; font-size:14px; }
  .tag { font-size:12px; font-weight:600; padding:4px 10px; border-radius:20px; flex-shrink:0; }
  .pill { font-size:11.5px; font-weight:600; padding:3px 9px; border-radius:20px; display:inline-block; margin-top:3px; }
  .low-badge { font-size:9.5px; font-weight:700; color:#B3261E; background:rgba(179,38,30,0.12); padding:2px 6px; border-radius:5px; margin-left:7px; vertical-align:2px; }
  .you-badge { font-size:9.5px; font-weight:700; color:#002147; background:rgba(0,33,71,0.1); padding:2px 6px; border-radius:5px; margin-left:6px; vertical-align:2px; }
  .off-badge { font-size:9.5px; font-weight:700; color:#6B7075; background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:5px; margin-left:6px; vertical-align:2px; }
  .notice { background:rgba(210,180,140,0.24); border:1px solid rgba(140,106,47,0.3); color:#6B4F1D; font-size:13px; border-radius:12px; padding:11px 14px; margin-bottom:13px; backdrop-filter:blur(8px); }

  .stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:13px; margin-bottom:18px; }
  .stat-grid.three { grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); }
  .stat-card { padding:16px; }
  .stat-icon { width:38px; height:38px; border-radius:11px; display:grid; place-items:center; margin-bottom:11px; }
  .stat-value { font-size:21px; font-weight:700; letter-spacing:-0.02em; }
  .stat-label { font-size:12.5px; color:#6B7075; margin-top:2px; }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:15px; }

  .toolbar { display:flex; gap:10px; margin-bottom:14px; align-items:center; flex-wrap:wrap; }
  .search-box { display:flex; align-items:center; gap:8px; border-radius:12px; padding:10px 13px; flex:1; min-width:0; }
  .search-box input { border:none; outline:none; background:none; width:100%; font-size:14.5px; color:#14212F; }
  .btn-primary { display:inline-flex; align-items:center; gap:7px; background:rgba(0,33,71,0.92); color:#fff; border:none; border-radius:12px; padding:11px 16px; font-size:14px; font-weight:600; flex-shrink:0; transition:transform 0.08s ease, background 0.15s ease; }
  .btn-primary:hover { background:rgba(0,33,71,1); transform:translateY(-1px); }
  .btn-primary:active { transform:translateY(0); }
  .btn-primary:disabled { opacity:0.45; cursor:not-allowed; transform:none; }
  .btn-primary.sm { padding:8px 13px; font-size:13px; }
  .btn-tan { display:inline-flex; align-items:center; gap:7px; background:rgba(210,180,140,0.85); color:#3E2F12; border:none; border-radius:12px; padding:11px 16px; font-size:14px; font-weight:700; flex-shrink:0; transition:transform 0.08s ease; }
  .btn-tan:hover { background:rgba(210,180,140,1); transform:translateY(-1px); }
  .btn-ghost { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,0.55); color:#002147; border:1px solid rgba(0,33,71,0.25); border-radius:12px; padding:10px 15px; font-size:14px; font-weight:600; backdrop-filter:blur(8px); }
  .icon-btn { border:1px solid rgba(0,33,71,0.08); background:rgba(255,255,255,0.55); border-radius:9px; width:32px; height:32px; display:grid; place-items:center; color:#43506B; flex-shrink:0; backdrop-filter:blur(6px); }
  .icon-btn:hover { background:rgba(255,255,255,0.85); }
  .icon-btn.onnavy { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.15); color:rgba(255,255,255,0.8); }
  .icon-btn.onnavy:hover { background:rgba(255,255,255,0.2); }
  .icon-btn.xs { width:24px; height:24px; background:none; border:none; }
  .icon-btn.danger:hover { background:rgba(179,38,30,0.12); color:#B3261E; }

  .overlay { position:fixed; inset:0; background:rgba(0,20,44,0.45); backdrop-filter:blur(3px); display:grid; place-items:center; padding:16px; z-index:60; overflow-y:auto; }
  .modal { border-radius:20px; padding:22px; width:100%; max-width:430px; box-shadow:0 24px 70px rgba(0,20,44,0.35); max-height:92vh; overflow-y:auto; }
  .modal.wide { max-width:600px; }
  .modal-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .modal-head h3 { margin:0; font-size:17px; letter-spacing:-0.01em; }
  .modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:16px; flex-wrap:wrap; }
  .form-stack { display:grid; gap:13px; }
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
  .field-label { font-size:13px; font-weight:600; color:#43506B; display:block; margin-bottom:6px; }
  .input { width:100%; padding:11px 13px; border:1px solid rgba(0,33,71,0.16); border-radius:11px; outline:none; background:rgba(255,255,255,0.75); }
  .input:focus { border-color:#002147; background:#fff; }
  .input.slim { padding:8px 10px; font-size:13.5px; border-radius:9px; }
  .input.num { text-align:center; }
  .cred-preview { background:rgba(210,180,140,0.16); border:1px dashed rgba(140,106,47,0.4); border-radius:12px; padding:13px 15px; }
  .walkin-fields { display:grid; gap:8px; }
  .cust-meta { font-size:12.5px; color:#6B7075; margin-top:6px; padding-left:2px; }
  .spin-inline { animation:spin 1s linear infinite; }

  .seg { display:inline-flex; background:rgba(0,33,71,0.07); border-radius:11px; padding:3px; margin-bottom:8px; backdrop-filter:blur(6px); }
  .seg-btn { border:none; background:none; padding:7px 13px; border-radius:8px; font-size:13px; font-weight:600; color:#43506B; }
  .seg-on { background:rgba(255,255,255,0.9); color:#002147; box-shadow:0 1px 4px rgba(0,33,71,0.15); }
  .dropdown { position:absolute; top:100%; left:0; right:0; border-radius:13px; box-shadow:0 12px 34px rgba(0,20,44,0.2); z-index:10; overflow:hidden; }
  .dd-row { display:flex; flex-direction:column; align-items:flex-start; width:100%; padding:11px 14px; border:none; background:none; border-bottom:1px solid rgba(0,33,71,0.06); gap:1px; }
  .dd-row:hover { background:rgba(255,255,255,0.7); }
  .dd-row:disabled { opacity:0.5; }
  .lines { margin-top:14px; border-top:1px solid rgba(0,33,71,0.08); }
  .bill-line { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid rgba(0,33,71,0.07); flex-wrap:wrap; }
  .line-ctrls { display:flex; align-items:center; gap:10px; flex-shrink:0; flex-wrap:wrap; }
  .qty-ctrl { display:flex; align-items:center; gap:9px; flex-shrink:0; }
  .qty-btn { width:30px; height:30px; border-radius:9px; border:1px solid rgba(0,33,71,0.18); background:rgba(255,255,255,0.7); display:grid; place-items:center; color:#14212F; backdrop-filter:blur(4px); }
  .qty-btn:disabled { opacity:0.35; }
  .qty-btn.ghost { opacity:0.25; cursor:not-allowed; }
  .qty-num { min-width:22px; text-align:center; font-weight:700; font-size:14.5px; }
  .price-edit { display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.75); border:1px solid rgba(0,33,71,0.18); border-radius:9px; padding:0 8px; }
  .price-edit:focus-within { border-color:#002147; }
  .rupee { color:#6B7075; font-size:13px; font-weight:600; }
  .price-in { border:none; outline:none; background:none; width:64px; padding:7px 2px; font-size:14px; font-weight:600; color:#14212F; }
  .line-total { font-weight:700; font-size:14px; min-width:76px; text-align:right; }
  .bill-foot { display:flex; justify-content:space-between; gap:16px; margin-top:14px; padding-top:14px; border-top:1px solid rgba(0,33,71,0.08); flex-wrap:wrap; }
  .bill-opts { display:flex; flex-direction:column; gap:9px; }
  .check { display:flex; align-items:center; gap:8px; font-size:13.5px; font-weight:600; color:#43506B; }
  .totals { min-width:200px; flex:1; }
  .tot-row { display:flex; justify-content:space-between; font-size:14px; color:#43506B; padding:4px 0; }
  .tot-row.grand { font-size:17px; font-weight:700; color:#14212F; border-top:1px solid rgba(0,33,71,0.14); margin-top:5px; padding-top:9px; }

  .invoice { border:1px solid rgba(0,33,71,0.12); border-radius:14px; padding:18px; background:rgba(255,255,255,0.7); }
  .inv-head { display:flex; justify-content:space-between; gap:12px; padding-bottom:13px; border-bottom:1px solid rgba(0,33,71,0.08); }
  .inv-shop { font-weight:700; font-size:15.5px; color:#002147; }
  .inv-cust { padding:12px 0; border-bottom:1px solid rgba(0,33,71,0.08); }
  .inv-table { width:100%; border-collapse:collapse; margin-top:6px; }
  .inv-table th { text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.04em; color:#6B7075; padding:9px 4px; border-bottom:1px solid rgba(0,33,71,0.12); font-weight:600; }
  .inv-table td { padding:9px 4px; font-size:14px; border-bottom:1px solid rgba(0,33,71,0.05); }
  .inv-totals { margin-top:11px; margin-left:auto; max-width:240px; }

  .pnl-list { display:grid; gap:13px; }
  .pnl-row { display:grid; grid-template-columns:38px 1fr auto; gap:12px; align-items:center; }
  .pnl-month { font-size:13px; font-weight:700; color:#43506B; }
  .pnl-bars { display:grid; gap:4px; }
  .bar { height:9px; border-radius:5px; min-width:2px; transition:width 0.4s ease; }
  .bar.rev { background:#002147; }
  .bar.exp { background:#D2A08C; }
  .pnl-nums { display:flex; flex-direction:column; align-items:flex-end; gap:1px; }
  .legend { display:flex; align-items:center; gap:7px; font-size:12px; color:#6B7075; margin-top:4px; flex-wrap:wrap; }
  .lg { width:11px; height:11px; border-radius:4px; display:inline-block; }
  .lg.rev { background:#002147; } .lg.exp { background:#D2A08C; }
  .annual-box { max-width:400px; }

  /* Attendance */
  .att-daybar { display:flex; align-items:center; gap:9px; border-radius:13px; padding:11px 14px; margin-bottom:13px; flex-wrap:wrap; }
  .att-marks { display:flex; gap:6px; flex-shrink:0; }
  .mk { width:36px; height:34px; border-radius:10px; border:1px solid rgba(0,33,71,0.16); background:rgba(255,255,255,0.6); font-weight:700; font-size:13px; color:#8A8F87; backdrop-filter:blur(4px); }
  .mk-p.on { background:#002147; border-color:#002147; color:#fff; }
  .mk-h.on { background:#8C6A2F; border-color:#8C6A2F; color:#fff; }
  .mk-a.on { background:#B3261E; border-color:#B3261E; color:#fff; }
  .mk:hover { border-color:#43506B; }
  .att-legend { display:flex; gap:16px; flex-wrap:wrap; font-size:12.5px; color:#6B7075; margin-top:12px; padding:0 2px; }
  .att-legend span { display:inline-flex; align-items:center; gap:6px; }
  .dot { width:10px; height:10px; border-radius:50%; display:inline-block; }
  .dot.p { background:#002147; } .dot.h { background:#8C6A2F; } .dot.a { background:#B3261E; }
  .att-monthnav { display:flex; align-items:center; justify-content:center; gap:16px; margin-bottom:14px; }
  .att-report-head { display:flex; justify-content:space-between; align-items:center; padding:11px 16px; background:rgba(0,33,71,0.04); border-bottom:1px solid rgba(0,33,71,0.08); font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#6B7075; }
  .ar-nums { display:inline-flex; align-items:center; flex-shrink:0; }
  .ar-nums > span { width:42px; text-align:center; font-weight:700; font-size:14px; }
  .att-report-head .ar-nums > span { font-size:11px; font-weight:600; }
  .ar-p { color:#002147; } .ar-h { color:#8C6A2F; } .ar-a { color:#B3261E; } .ar-pay { color:#14212F; }

  /* Scan bill */
  .scan-pick { text-align:center; padding:8px 4px 4px; }
  .scan-hero { width:76px; height:76px; border-radius:22px; background:rgba(0,33,71,0.08); display:grid; place-items:center; margin:6px auto 14px; }
  .scan-hero.spin svg { animation:spin 1s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .scan-copy { font-size:14px; color:#43506B; line-height:1.55; margin:0 0 16px; }
  .scan-note { font-size:12px; color:#6B7075; margin-top:12px; }
  .scan-head { display:grid; grid-template-columns:1fr 58px 74px 74px 34px; gap:8px; font-size:10.5px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#6B7075; padding:0 2px 7px; }
  .scan-rows { display:grid; gap:8px; max-height:44vh; overflow-y:auto; padding-bottom:4px; }
  .scan-row { display:grid; grid-template-columns:1fr 58px 74px 74px 34px; gap:8px; align-items:center; }
  .scan-name { display:flex; flex-direction:column; gap:3px; min-width:0; }
  .match-badge { font-size:10px; font-weight:700; color:#002147; background:rgba(0,33,71,0.08); padding:2px 7px; border-radius:6px; width:fit-content; }
  .new-badge { font-size:10px; font-weight:700; color:#8C6A2F; background:rgba(140,106,47,0.13); padding:2px 7px; border-radius:6px; width:fit-content; }
  .scan-actions { display:flex; gap:10px; justify-content:space-between; margin-top:16px; flex-wrap:wrap; }

  .toast { position:fixed; bottom:86px; left:50%; transform:translateX(-50%); background:rgba(0,26,56,0.95); backdrop-filter:blur(10px); color:#fff; padding:11px 18px; border-radius:13px; font-size:13.5px; font-weight:500; display:flex; align-items:center; gap:8px; z-index:80; box-shadow:0 8px 30px rgba(0,20,44,0.35); animation:pop 0.25s ease; max-width:92vw; border:1px solid rgba(255,255,255,0.15); }
  @keyframes pop { from { opacity:0; transform:translateX(-50%) translateY(8px);} to { opacity:1; transform:translateX(-50%) translateY(0);} }

  @media print {
    .no-print, .sidebar, .bottom-nav, .topbar, .bg-blobs { display:none !important; }
    .overlay { position:static !important; background:#fff !important; padding:0 !important; display:block !important; backdrop-filter:none !important; }
    .modal { box-shadow:none !important; max-width:100% !important; max-height:none !important; padding:0 !important; border-radius:0 !important; background:#fff !important; backdrop-filter:none !important; border:none !important; }
    .invoice { border:none !important; background:#fff !important; }
    .app { background:#fff; }
  }

  .desktop-only { display:flex; }
  @media (max-width: 760px) {
    .sidebar { display:none; }
    .desktop-only { display:none; }
    .bottom-nav { display:flex; }
    .topbar { padding:12px 16px; flex-wrap:wrap; }
    .topbar-mobile-brand { display:flex; width:100%; margin-bottom:4px; }
    .page-title { font-size:18px; }
    .content { padding:16px 14px 96px; }
    .two-col { grid-template-columns:1fr; }
    .toolbar .btn-primary, .toolbar .btn-tan { flex:1; justify-content:center; }
    .search-box { min-width:100%; order:-1; }
    .stat-grid { grid-template-columns:1fr 1fr; }
    .form-grid { grid-template-columns:1fr; }
    .bill-foot { flex-direction:column; }
    .bill-line { flex-direction:column; align-items:stretch; }
    .line-ctrls { justify-content:space-between; }
    .pnl-row { grid-template-columns:34px 1fr; }
    .pnl-nums { grid-column:2; flex-direction:row; justify-content:space-between; width:100%; flex-wrap:wrap; }
    .ar-nums > span { width:34px; font-size:13px; }
    .att-daybar .row-sub { width:100%; margin-left:0 !important; }
    .scan-head { display:none; }
    .scan-row { grid-template-columns:1fr; gap:6px; padding:10px; border:1px solid rgba(0,33,71,0.1); border-radius:12px; background:rgba(255,255,255,0.5); }
    .scan-row .icon-btn { justify-self:end; }
  }
`;
