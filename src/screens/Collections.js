// ─── Collections Screen ───────────────────────────────────────────────────────
import { useState }  from "react";
import Card          from "../components/Card";
import Avatar        from "../components/Avatar";
import Badge         from "../components/Badge";
import { COLORS }    from "../utils/theme";
import { fmt, fmtDate, periodEMI } from "../utils/helpers";

const P = COLORS.primary;

export default function Collections({ customers, history, setScreen, setSelected }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  // ── Build rows — check both _id and id ──
  const rows = customers.map((c) => {
    const cid = c._id || c.id;
    const h   = history[cid] || [];
    const record = h.find((r) => r.date === date);
    return { c, record };
  });

  // ── Totals ──
  const totalCollected = rows
    .filter((r) => r.record?.status === "Paid")
    .reduce((s, r) => s + (r.record?.amount || 0), 0);

  const totalMissed  = rows.filter((r) => r.record?.status === "Missed").length;
  const totalPending = rows.filter((r) => !r.record).length;

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: "0 0 20px" }}>
        Collections
      </h1>

      {/* ── Date Picker ── */}
      <div style={{ background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, marginBottom: 14, boxShadow: "0 1px 4px #0000000a" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
        </svg>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ border: "none", background: "none", fontSize: 14, outline: "none", flex: 1, color: "#333", fontFamily: "inherit" }}
        />
      </div>

      {/* ── Total Banner ── */}
      <div style={{ background: P, borderRadius: 16, padding: "16px 20px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#ffffff99" }}>Total Collected</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginTop: 2 }}>
              {fmt(totalCollected)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#ffffff99" }}>Date</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 2 }}>
              {fmtDate(date)}
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#ffffff15", borderRadius: 10, padding: "10px 0" }}>
          {[
            ["Collected", rows.filter((r) => r.record?.status === "Paid").length,   "#4ADE80"],
            ["Missed",    totalMissed,                                               "#FCA5A5"],
            ["Pending",   totalPending,                                              "#FCD34D"],
          ].map(([l, v, col], i) => (
            <div key={l} style={{ textAlign: "center", borderLeft: i > 0 ? "1px solid #ffffff20" : "none" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: col }}>{v}</div>
              <div style={{ fontSize: 10, color: "#ffffff88", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Customer Rows ── */}
      {rows.map(({ c, record }) => (
        <Card
          key={c._id || c.id}
          onClick={() => { setSelected(c); setScreen("customerDetail"); }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar c={c} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "#AAA", marginTop: 2 }}>
                Daily EMI: {fmt(periodEMI(c))}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {record ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>
                    {fmt(record.amount)}
                  </div>
                  <Badge status={record.status} />
                </>
              ) : (
                <Badge status="Pending" />
              )}
            </div>
          </div>
        </Card>
      ))}

      {rows.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#CCC" }}>No customers yet</div>
        </div>
      )}
    </div>
  );
}