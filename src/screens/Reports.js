// ─── Reports Screen ───────────────────────────────────────────────────────────

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import Card       from "../components/Card";
import Avatar     from "../components/Avatar";
import { COLORS } from "../utils/theme";
import { fmt, customerStats } from "../utils/helpers";

const P = COLORS.primary;
const G = COLORS.green;
const O = COLORS.orange;

export default function Reports({ customers, history }) {
  const today = new Date().toISOString().split("T")[0];

  // ── All customer stats ──
  const allStats = customers.map((c) => ({
    c,
    ...customerStats(c, history),
  }));

  // ── Totals ──
  const totalGiven  = customers.reduce((s, c) => s + c.loanAmount, 0);
  const totalRcv    = allStats.reduce((s, x) => s + x.totalReceived, 0);
  const totalPend   = allStats.reduce((s, x) => s + x.pending, 0);
  const totalProfit = allStats.reduce((s, x) => s + x.profit, 0);

  // ── Chart data — last 16 days ──
  const chartData = [];
  for (let i = 15; i >= 0; i--) {
    const d  = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    let total = 0;
    customers.forEach((c) => {
      const r = (history[c.id] || []).find((x) => x.date === ds);
      if (r) total += r.amount;
    });
    chartData.push({
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      total,
    });
  }

  // ── Top customers by collection ──
  const top = [...allStats].sort((a, b) => b.totalReceived - a.totalReceived);

  // ── Custom tooltip ──
 function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", boxShadow: "0 2px 8px #00000020", fontSize: 12 }}>
      <div style={{ color: "#AAA", marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, color: P }}>{fmt(payload[0].value)}</div>
    </div>
  );
}

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: 0 }}>
          Reports
        </h1>
        <div style={{ background: "#EEF0FF", padding: "4px 14px", borderRadius: 20, fontSize: 12, color: P, fontWeight: 600 }}>
          This Month
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Total Given",    value: fmt(totalGiven),  color: "#111", bg: "#F0EEFF" },
          { label: "Total Received", value: fmt(totalRcv),    color: G,      bg: "#E8F5E9" },
          { label: "Total Pending",  value: fmt(totalPend),   color: O,      bg: "#FFF4EC" },
          { label: "Total Profit",   value: fmt(totalProfit), color: P,      bg: "#EEF0FF" },
        ].map((s) => (
          <div
            key={s.label}
            style={{ background: s.bg, borderRadius: 14, padding: "14px 14px 12px" }}
          >
            <div style={{ fontSize: 11, color: "#999", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Collection Overview Chart ── */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 14 }}>
          Collection Overview
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#CCC" }}
              interval={3}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <RechartsTooltip content={<CustomTooltip />} />
          
          
            <Line
              type="monotone"
              dataKey="total"
              stroke={P}
              strokeWidth={2.5}
              dot={{ r: 3, fill: P, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: P }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Top Customers ── */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>
            Top Customers
          </span>
          <span style={{ fontSize: 12, color: P, fontWeight: 600 }}>
            By Collection
          </span>
        </div>
        {top.slice(0, 4).map((x, i) => (
          <div
            key={x.c.id}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 3 ? 14 : 0 }}
          >
            <span style={{ fontSize: 12, color: "#DDD", width: 16, fontWeight: 700 }}>
              {i + 1}
            </span>
            <Avatar c={x.c} size={36} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#111" }}>
              {x.c.name}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: P }}>
              {fmt(x.totalReceived)}
            </span>
          </div>
        ))}
      </Card>

      {/* ── Loan Summary ── */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 12 }}>
          Loan Summary
        </div>
        {[
          ["Active Loans",    customers.filter((c) => c.status === "Active").length],
          ["Completed Loans", customers.filter((c) => c.status === "Completed").length],
          ["Total Customers", customers.length],
          ["Total Given",     fmt(totalGiven)],
          ["Total Profit",    fmt(totalProfit)],
        ].map(([l, v], i, arr) => (
          <div
            key={l}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < arr.length - 1 ? 10 : 0, marginBottom: i < arr.length - 1 ? 10 : 0, borderBottom: i < arr.length - 1 ? "1px solid #F5F5F5" : "none" }}
          >
            <span style={{ fontSize: 14, color: "#888" }}>{l}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#111" }}>{v}</span>
          </div>
        ))}
      </Card>

    </div>
  );
}