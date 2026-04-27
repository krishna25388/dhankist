// ─── Customer Detail Screen ───────────────────────────────────────────────────
import Card       from "../components/Card";
import Avatar     from "../components/Avatar";
import Badge      from "../components/Badge";
import { COLORS } from "../utils/theme";
import { exportCustomerExcel } from "../utils/exportExcel";
import {
  fmt,
  fmtDate,
  totalAmount,
  dailyEMI,
  dueDate,
  customerStats,
} from "../utils/helpers";

const P = COLORS.primary;
const G = COLORS.green;
const O = COLORS.orange;

export default function CustomerDetail({ customer, history, setScreen }) {
  if (!customer) return null;

  const st  = customerStats(customer, history);
  const pct = Math.min(100, Math.round((st.paidDays / customer.duration) * 100));

  function handleDownload() {
  exportCustomerExcel(customer, history);
}

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setScreen("customers")}
            style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px #0000000d", cursor: "pointer" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}>
            Customer Details
          </h1>
        </div>

        {/* Edit button */}
        <div  onClick={() => setScreen("editCustomer")} style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px #0000000d", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* ── Profile Card ── */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar c={customer} size={54} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#111" }}>
              {customer.name}
            </div>
            <div style={{ fontSize: 13, color: "#AAA", marginTop: 2 }}>
              {customer.phone}
            </div>
          </div>
          <Badge status={customer.status} />
        </div>
      </Card>

      {/* ── Loan Info Grid ── */}
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {[
            ["Loan Amount",  fmt(customer.loanAmount)],
            ["Interest",     customer.interest + "%"],
            ["Total Amount", fmt(totalAmount(customer))],
            ["Start Date",   fmtDate(customer.startDate)],
            ["Duration",     customer.duration + " Days"],
            ["Daily EMI",    fmt(dailyEMI(customer))],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: "#AAA", marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── EMI Progress ── */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
            EMI Progress
          </span>
          <span style={{ fontSize: 12, color: "#888" }}>
            Paid {st.paidDays}/{customer.duration} Days
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ background: "#F0F0F0", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 6 }}>
          <div
            style={{ width: pct + "%", height: "100%", background: `linear-gradient(90deg, ${P}, ${G})`, borderRadius: 99, transition: "width 0.5s ease" }}
          />
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: P, fontWeight: 700 }}>
          {pct}%
        </div>

        {/* Due date */}
        <div style={{ marginTop: 10, fontSize: 12, color: "#AAA" }}>
          Due Date: <span style={{ color: "#111", fontWeight: 600 }}>{dueDate(customer)}</span>
        </div>
      </Card>

      {/* ── Summary ── */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>
          Summary
        </div>
        {[
          ["Total Received", fmt(st.totalReceived), G],
          ["Pending Amount", fmt(st.pending),       O],
          ["Total Profit",   fmt(st.profit),        P],
        ].map(([l, v, col]) => (
          <div
            key={l}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}
          >
            <span style={{ fontSize: 14, color: "#888" }}>{l}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: col }}>{v}</span>
          </div>
        ))}
      </Card>

      {/* ── Action Buttons ── */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => setScreen("addCollection")}
          style={{ flex: 1, padding: 14, background: P, color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          Add Collection
        </button>
        <button
          onClick={() => setScreen("collectionHistory")}
          style={{ flex: 1, padding: 14, background: "#fff", color: P, border: `1.5px solid ${P}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          View History
        </button>
      </div>
        <button
          onClick={() => exportCustomerExcel(customer, history)}
          style={{ width: "100%", padding: 14, marginTop:15, background: "#1E8A4C", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Excel Report
        </button>
    </div>
  );
}