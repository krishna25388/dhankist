// ─── Add Collection Screen ────────────────────────────────────────────────────
import { useState }  from "react";
import Card          from "../components/Card";
import Avatar        from "../components/Avatar";
import { COLORS }    from "../utils/theme";
import {
  fmt,
  periodEMI,
  periodInterest,
  dueDate,
  frequencyLabel,
  paymentTypeLabel,
  calcReducingBalance,
} from "../utils/helpers";

const P  = COLORS.primary;
const PL = COLORS.primaryLight;
const G  = COLORS.green;

export default function AddCollection({ customer, setScreen, onAdd }) {
  const today = new Date().toISOString().split("T")[0];

  // ── Hooks first ──
  const [date,    setDate]    = useState(today);
  const [emis,    setEmis]    = useState(1);
  const [amount,  setAmount]  = useState("");
  const [mode,    setMode]    = useState("Cash");
  const [notes,   setNotes]   = useState("");
  const [amtErr,  setAmtErr]  = useState("");
  const [saving,  setSaving]  = useState(false);

  if (!customer) return null;

  // ── Get payment type ──
  const payType    = customer.paymentType  || "fixed_emi";
  const freq       = customer.frequency    || "daily";
  const minDue     = periodEMI(customer);
  const intDue     = periodInterest(customer);
  const amountNum  = Number(amount) || 0;

  // ── Reducing balance breakdown ──
  const rb = payType === "reducing_balance" && amountNum > 0
    ? calcReducingBalance(customer, amountNum)
    : null;

  // ── Quick amount suggestions ──
  const suggestions = payType === "reducing_balance"
    ? [intDue, intDue + 5000, intDue + 10000, intDue + 25000].filter(v => v > 0)
    : [minDue, minDue * 2, Math.round(minDue * 0.5)].filter(v => v > 0);

  // ── Handle emis change ──
  function handleEmisChange(val) {
    const n = Math.max(0, val);
    setEmis(n);
    if (payType !== "reducing_balance") {
      setAmount(n === 0 ? "0" : String(minDue * n));
    }
  }

  // ── Save ──
  async function handleSave() {
    const finalAmount = Number(amount);
    if (!amount || isNaN(finalAmount) || finalAmount < 0) {
      setAmtErr("Please enter a valid amount");
      return;
    }

    try {
      setSaving(true);

      // Build record based on payment type
      let record = {
        date,
        emis,
        amount:      finalAmount,
        status:      finalAmount > 0 ? "Paid" : "Missed",
        paymentMode: mode,
        notes,
        interestPaid:   0,
        principalPaid:  0,
        remainingPrincipal: customer.remainingPrincipal || customer.loanAmount,
      };

      if (payType === "reducing_balance" && rb) {
        record.interestPaid        = rb.interestPaid;
        record.principalPaid       = rb.principalPaid;
        record.remainingPrincipal  = rb.newPrincipal;
      } else if (payType === "interest_only") {
        record.interestPaid  = finalAmount;
        record.principalPaid = 0;
      } else {
        // Fixed EMI — split interest and principal
        const totalAmt  = Math.round(customer.loanAmount * (1 + customer.interest / 100));
        const totalInt  = totalAmt - customer.loanAmount;
        const intPerEmi = Math.round(totalInt / customer.duration);
        record.interestPaid  = Math.min(finalAmount, intPerEmi * emis);
        record.principalPaid = Math.max(0, finalAmount - record.interestPaid);
      }

      await onAdd(customer._id || customer.id, record);
      setScreen("customerDetail");
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => setScreen("customerDetail")}
          style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px #0000000d", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}>Add Collection</h1>
      </div>

      <Card>
        {/* ── Customer mini info ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: "1px solid #F3F3F3", marginBottom: 16 }}>
          <Avatar c={customer} size={46} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{customer.name}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
              {fmt(customer.loanAmount)} • {customer.duration} {frequencyLabel(freq)}s
            </div>
            <div style={{ fontSize: 11, color: "#BBB", marginTop: 1 }}>Due: {dueDate(customer)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#AAA" }}>Type</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: P }}>{paymentTypeLabel(payType)}</div>
          </div>
        </div>

        {/* ── Loan info for reducing balance ── */}
        {payType === "reducing_balance" && (
          <div style={{ background: "#F0FFF4", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center" }}>
              {[
                ["Remaining Loan",  fmt(customer.remainingPrincipal || customer.loanAmount), "#111"],
                ["Interest Due",    fmt(intDue),                                             P    ],
                ["Min. Payment",    fmt(intDue),                                             G    ],
              ].map(([l, v, col], i) => (
                <div key={l} style={{ borderLeft: i > 0 ? "1px solid #BBF7D0" : "none" }}>
                  <div style={{ fontSize: 10, color: "#666" }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: col, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Collection Date ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Collection Date
          </label>
          <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", border: "1.5px solid #F0F0F0", borderRadius: 12, background: "#FAFAFA", gap: 8 }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              style={{ border: "none", background: "none", fontSize: 14, outline: "none", flex: 1, color: "#111", fontFamily: "inherit" }}/>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* ── EMI Stepper — hide for reducing balance ── */}
        {payType !== "reducing_balance" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 8 }}>
              {frequencyLabel(freq)}s Paid
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={() => handleEmisChange(emis - 1)}
                style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #E8E8E8", background: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>−</button>
              <span style={{ fontSize: 22, fontWeight: 800, minWidth: 36, textAlign: "center", color: "#111" }}>{emis}</span>
              <button onClick={() => handleEmisChange(emis + 1)}
                style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #E8E8E8", background: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#555" }}>+</button>
              <span style={{ fontSize: 12, color: "#AAA" }}>
                {emis === 0 ? "Mark as Missed" : emis === 1 ? `1 ${frequencyLabel(freq)}` : `${emis} ${frequencyLabel(freq)}s`}
              </span>
            </div>
            {emis > 0 && (
              <div style={{ marginTop: 8, fontSize: 11, color: "#AAA" }}>
                Suggested: <span style={{ color: P, fontWeight: 700 }}>{fmt(minDue * emis)}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Amount Entry ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Amount Received (₹) *
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, fontWeight: 700, color: "#888" }}>₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setAmtErr(""); }}
              placeholder={payType === "reducing_balance" ? `Min. ${fmt(intDue)}` : String(minDue * emis)}
              style={{ width: "100%", padding: "14px 14px 14px 32px", borderRadius: 12, border: `1.5px solid ${amtErr ? COLORS.red : amount ? P : "#F0F0F0"}`, fontSize: 18, fontWeight: 700, outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#111", fontFamily: "inherit" }}
            />
          </div>
          {amtErr && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>{amtErr}</div>}

          {/* Quick amount buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {suggestions
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .map((v) => (
                <button key={v} onClick={() => { setAmount(String(v)); setAmtErr(""); }}
                  style={{ padding: "6px 12px", borderRadius: 99, border: `1.5px solid ${Number(amount) === v ? P : "#E8E8E8"}`, background: Number(amount) === v ? PL : "#fff", color: Number(amount) === v ? P : "#888", fontSize: 12, fontWeight: Number(amount) === v ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                  {fmt(v)}
                </button>
              ))}
          </div>
        </div>

        {/* ── Reducing Balance Breakdown ── */}
        {rb && amountNum > 0 && (
          <div style={{ background: PL, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: P, fontWeight: 700, marginBottom: 10 }}>
              Payment Breakdown
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Total Paid",        fmt(amountNum)],
                ["Interest Portion",  fmt(rb.interestPaid)],
                ["Principal Paid",    fmt(rb.principalPaid)],
                ["New Loan Amount",   fmt(rb.newPrincipal)],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: "#888" }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: P, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
            {rb.isFullyPaid && (
              <div style={{ marginTop: 10, padding: 8, background: G + "22", borderRadius: 8, fontSize: 12, fontWeight: 700, color: G, textAlign: "center" }}>
                🎉 Loan will be fully paid!
              </div>
            )}
          </div>
        )}

        {/* ── Payment Mode ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 8 }}>
            Payment Mode
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {["Cash", "UPI", "Bank Transfer"].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: `1.5px solid ${mode === m ? P : "#E8E8E8"}`, background: mode === m ? PL : "#fff", color: mode === m ? P : "#888", fontSize: 12, fontWeight: mode === m ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* ── Notes ── */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Notes (Optional)
          </label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Paid extra ₹25,000 to reduce principal..."
            rows={3}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #F0F0F0", fontSize: 14, resize: "none", outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#333", fontFamily: "inherit" }}/>
        </div>

        {/* ── Save Button ── */}
        <button onClick={handleSave} disabled={saving}
          style={{ width: "100%", padding: 14, background: saving ? "#AAA" : P, color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {saving ? "Saving..." : "Save Collection"}
        </button>
      </Card>
    </div>
  );
}