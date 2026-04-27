// ─── Customers Screen ─────────────────────────────────────────────────────────
import { useState }  from "react";
import Card          from "../components/Card";
import Avatar        from "../components/Avatar";
import Badge         from "../components/Badge";
import { COLORS }    from "../utils/theme";
import { fmt, dueDate } from "../utils/helpers";

const P = COLORS.primary;

export default function Customers({ customers, setScreen, setSelected }) {
  const [tab,    setTab]    = useState("All");
  const [search, setSearch] = useState("");

  // ── Tab counts ──
  const counts = {
    All:       customers.length,
    Active:    customers.filter((c) => c.status === "Active").length,
    Completed: customers.filter((c) => c.status === "Completed").length,
  };

  // ── Filtered list ──
  const list = customers.filter((c) =>
    (tab === "All" || c.status === tab) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: 0 }}>
          Customers
        </h1>
        <button
          onClick={() => setScreen("addCustomer")}
          style={{ width: 40, height: 40, borderRadius: "50%", background: P, border: "none", color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${P}44`, fontFamily: "inherit" }}
        >
          +
        </button>
      </div>

      {/* ── Search bar ── */}
      <div style={{ background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", padding: "10px 14px", gap: 8, marginBottom: 14, boxShadow: "0 1px 4px #0000000a" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2">
          <circle cx="11" cy="11" r="7"/>
          <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          style={{ background: "none", border: "none", outline: "none", fontSize: 14, flex: 1, color: "#333", fontFamily: "inherit" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{ background: "none", border: "none", color: "#CCC", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", marginBottom: 14, borderBottom: "1px solid #F0F0F0" }}>
        {["All", "Active", "Completed"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ flex: 1, padding: "10px 0", border: "none", background: "none", borderBottom: tab === t ? `2px solid ${P}` : "2px solid transparent", marginBottom: -1, color: tab === t ? P : "#AAA", fontWeight: tab === t ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* ── Customer List ── */}
      {list.map((c) => (
        <Card
          key={c.id}
          onClick={() => { setSelected(c); setScreen("customerDetail"); }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar c={c} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{c.name}</span>
                <Badge status={c.status} />
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                {fmt(c.loanAmount)} • {c.duration} Days
              </div>
              <div style={{ fontSize: 12, color: "#BBB", marginTop: 1 }}>
                Due: {dueDate(c)}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DDD" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </Card>
      ))}

      {/* ── Empty state ── */}
      {list.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#CCC" }}>
            No customers found
          </div>
          <div style={{ fontSize: 13, color: "#DDD", marginTop: 4 }}>
            {search ? "Try a different search" : "Add your first customer"}
          </div>
        </div>
      )}

    </div>
  );
}