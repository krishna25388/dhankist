// ─── Dashboard Screen ─────────────────────────────────────────────────────────

import { PieChart, Pie, Cell } from "recharts";
import Card                     from "../components/Card";
import Avatar                   from "../components/Avatar";
import Badge                    from "../components/Badge";
import { COLORS }               from "../utils/theme";
import { fmt, fullDateLabel, customerStats, periodEMI } from "../utils/helpers";


const P = COLORS.primary;
const G = COLORS.green;
const O = COLORS.orange;

export default function Dashboard({ customers, history, setScreen, setSelected }) {

  // ── Totals ──
  const allStats    = customers.map((c) => customerStats(c, history));
  const totalGiven  = customers.reduce((s, c) => s + c.loanAmount, 0);
  const totalRcv    = allStats.reduce((s, x) => s + x.totalReceived, 0);
  const totalPend   = allStats.reduce((s, x) => s + x.pending, 0);
  const totalProfit = allStats.reduce((s, x) => s + x.profit, 0);

  // ── Today ──
  const today = new Date().toISOString().split("T")[0];

  const collectedToday = customers.reduce((s, c) => {
    const r = (history[c.id] || []).find((r) => r.date === today);
    return s + (r?.status === "Paid" ? r.amount : 0);
  }, 0);

  const pendingTodayAmt = customers.reduce((s, c) => {
    const r = (history[c.id] || []).find((r) => r.date === today);
    return s + (!r || r.status === "Missed" ? periodEMI(c) : 0);
  }, 0);

  const profitToday = Math.round(collectedToday * 20 / 120);

  // ── Donut chart data ──
  const donut = [
    { name: "Received", value: totalRcv,     color: P },
    { name: "Pending",  value: totalPend,    color: O },
    { name: "Profit",   value: totalProfit,  color: G },
  ];

  // ── Recent collections ──
  const recent = [];
  customers.forEach((c) => {
    const paid = [...(history[c.id] || [])]
      .reverse()
      .find((r) => r.status === "Paid");
    if (paid) recent.push({ c, ...paid });
  });
  recent.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: 0, letterSpacing: -0.5 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "#AAA", margin: "3px 0 0" }}>
            {fullDateLabel()}
          </p>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", boxShadow: "0 1px 6px #0000000d", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Total Given",    value: fmt(totalGiven),   color: "#111", bg: "#F0EEFF", ic: P,
            path: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" strokeLinecap="round"/></> },
          { label: "Total Received", value: fmt(totalRcv),     color: G,      bg: "#E8F5E9", ic: G,
            path: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/></> },
          { label: "Total Pending",  value: fmt(totalPend),    color: O,      bg: "#FFF4EC", ic: O,
            path: <><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/></> },
          { label: "Total Profit",   value: fmt(totalProfit),  color: P,      bg: "#EEF0FF", ic: P,
            path: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></> },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "14px 14px 12px", boxShadow: "0 1px 6px #0000000d" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#999", fontWeight: 500 }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={s.ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {s.path}
                </svg>
              </div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: s.color, letterSpacing: -0.3 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Overview Donut ── */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>Overview</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#EEF0FF", padding: "4px 12px", borderRadius: 20 }}>
            <span style={{ fontSize: 12, color: P, fontWeight: 600 }}>This Month</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          {/* Donut */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <PieChart width={130} height={130}>
              <Pie
                data={donut}
                cx={64} cy={64}
                innerRadius={40} outerRadius={58}
                dataKey="value"
                strokeWidth={0}
                startAngle={90} endAngle={-270}
              >
                {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#111", whiteSpace: "nowrap" }}>
                {fmt(totalProfit)}
              </div>
              <div style={{ fontSize: 9, color: "#AAA", marginTop: 1 }}>Total Profit</div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {donut.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }}/>
                <div>
                  <div style={{ fontSize: 11, color: "#AAA", lineHeight: 1 }}>{d.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginTop: 2 }}>{fmt(d.value)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Today Summary ── */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 14 }}>
          Today Summary
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center" }}>
          {[
            { label: "Collected Today", value: collectedToday,  color: G },
            { label: "Pending Today",   value: pendingTodayAmt, color: O },
            { label: "Profit Today",    value: profitToday,     color: P },
          ].map((s, i) => (
            <div key={s.label} style={{ borderLeft: i > 0 ? "1px solid #F3F3F3" : "none", paddingLeft: i > 0 ? 6 : 0 }}>
              <div style={{ fontSize: 10, color: "#AAA", marginBottom: 4, lineHeight: 1.3 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{fmt(s.value)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Recent Collections ── */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>Recent Collections</span>
          <button
            onClick={() => setScreen("collections")}
            style={{ background: "none", border: "none", color: P, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          >
            View All
          </button>
        </div>

        {recent.slice(0, 3).map((r, i) => (
          <div key={i}>
            {i > 0 && <div style={{ height: 1, background: "#F5F5F5", margin: "10px 0" }}/>}
            <div
              onClick={() => { setSelected(r.c); setScreen("customerDetail"); }}
              style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            >
              <Avatar c={r.c} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{r.c.name}</div>
                <div style={{ fontSize: 11, color: "#AAA", marginTop: 1 }}>{r.date}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{fmt(r.amount)}</span>
                <Badge status="Paid" />
              </div>
            </div>
          </div>
        ))}

        {recent.length === 0 && (
          <div style={{ textAlign: "center", color: "#CCC", fontSize: 13, padding: "12px 0" }}>
            No collections yet
          </div>
        )}
      </Card>

    </div>
  );
}