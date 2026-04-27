// ─── Add Collection Screen ────────────────────────────────────────────────────
import { useState }  from "react";
import Card          from "../components/Card";
import Avatar        from "../components/Avatar";
import { COLORS }    from "../utils/theme";
import { fmt, dailyEMI, dueDate } from "../utils/helpers";

const P  = COLORS.primary;
const PL = COLORS.primaryLight;

export default function AddCollection({ customer, setScreen, onAdd }) {
  const today = new Date().toISOString().split("T")[0];

  // ── Hooks first ──
  const [date,      setDate]      = useState(today);
  const [emis,      setEmis]      = useState(1);
  const [amount,    setAmount]    = useState("");
  const [mode,      setMode]      = useState("Cash");
  const [notes,     setNotes]     = useState("");
  const [amtError,  setAmtError]  = useState("");

  if (!customer) return null;

  const suggestedEMI = dailyEMI(customer);

  // ── When EMI stepper changes, update suggested amount ──
  function handleEmisChange(val) {
    const newEmis = Math.max(0, val);
    setEmis(newEmis);
    // Only auto-fill if user hasn't manually typed
    if (newEmis === 0) {
      setAmount("0");
    } else {
      setAmount(String(suggestedEMI * newEmis));
    }
  }

  // ── Save ──
  function handleSave() {
    const finalAmount = Number(amount);
    if (!amount || isNaN(finalAmount) || finalAmount < 0) {
      setAmtError("Please enter a valid amount");
      return;
    }
    onAdd(customer.id, {
      date,
      emis,
      amount:  finalAmount,
      status:  finalAmount > 0 ? "Paid" : "Missed",
    });
    setScreen("customerDetail");
  }

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setScreen("customerDetail")}
          style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px #0000000d", cursor: "pointer" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}>
          Add Collection
        </h1>
      </div>

      <Card>

        {/* ── Customer mini info ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: "1px solid #F3F3F3", marginBottom: 16 }}>
          <Avatar c={customer} size={46} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{customer.name}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
              {fmt(customer.loanAmount)} • {customer.duration} Days
            </div>
            <div style={{ fontSize: 11, color: "#BBB", marginTop: 1 }}>
              Due: {dueDate(customer)}
            </div>
          </div>
          <button
            onClick={() => setScreen("customerDetail")}
            style={{ fontSize: 12, color: P, background: PL, border: "none", padding: "4px 10px", borderRadius: 99, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
          >
            View Details ›
          </button>
        </div>

        {/* ── Collection Date ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Collection Date
          </label>
          <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", border: "1.5px solid #F0F0F0", borderRadius: 12, background: "#FAFAFA", gap: 8 }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ border: "none", background: "none", fontSize: 14, outline: "none", flex: 1, color: "#111", fontFamily: "inherit" }}
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* ── EMI Stepper ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 8 }}>
            EMI Days
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => handleEmisChange(emis - 1)}
              style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #E8E8E8", background: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "inherit" }}
            >
              −
            </button>
            <span style={{ fontSize: 22, fontWeight: 800, minWidth: 36, textAlign: "center", color: "#111" }}>
              {emis}
            </span>
            <button
              onClick={() => handleEmisChange(emis + 1)}
              style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #E8E8E8", background: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "inherit" }}
            >
              +
            </button>
            <span style={{ fontSize: 12, color: "#AAA" }}>
              {emis === 0
                ? "Mark as Missed"
                : emis === 1
                ? "1 day EMI"
                : `${emis} days together`}
            </span>
          </div>
          {/* Suggested amount hint */}
          {emis > 0 && (
            <div style={{ marginTop: 8, fontSize: 11, color: "#AAA" }}>
              Suggested: <span style={{ color: P, fontWeight: 700 }}>{fmt(suggestedEMI * emis)}</span>
              <span style={{ color: "#CCC" }}> (₹{suggestedEMI}/day)</span>
            </div>
          )}
        </div>

        {/* ── Manual Amount Entry ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Amount Received (₹) *
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, fontWeight: 700, color: "#888" }}>
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setAmtError("");
              }}
              placeholder={emis > 0 ? String(suggestedEMI * emis) : "0"}
              style={{ width: "100%", padding: "14px 14px 14px 32px", borderRadius: 12, border: `1.5px solid ${amtError ? COLORS.red : amount ? P : "#F0F0F0"}`, fontSize: 18, fontWeight: 700, outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#111", fontFamily: "inherit" }}
            />
          </div>
          {amtError && (
            <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>{amtError}</div>
          )}

          {/* Quick amount buttons */}
          {emis > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {[
                suggestedEMI * emis,
                Math.round(suggestedEMI * emis * 0.5),
                Math.round(suggestedEMI * emis * 1.5),
                Math.round(suggestedEMI * emis * 2),
              ]
                .filter((v, i, arr) => arr.indexOf(v) === i && v > 0)
                .map((v) => (
                  <button
                    key={v}
                    onClick={() => { setAmount(String(v)); setAmtError(""); }}
                    style={{ padding: "6px 12px", borderRadius: 99, border: `1.5px solid ${Number(amount) === v ? P : "#E8E8E8"}`, background: Number(amount) === v ? PL : "#fff", color: Number(amount) === v ? P : "#888", fontSize: 12, fontWeight: Number(amount) === v ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {fmt(v)}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* ── Payment Mode ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 8 }}>
            Payment Mode
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {["Cash", "UPI", "Bank Transfer"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: `1.5px solid ${mode === m ? P : "#E8E8E8"}`, background: mode === m ? PL : "#fff", color: mode === m ? P : "#888", fontSize: 12, fontWeight: mode === m ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}
              >
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
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Paid extra ₹200 for yesterday..."
            rows={3}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #F0F0F0", fontSize: 14, resize: "none", outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#333", fontFamily: "inherit" }}
          />
        </div>

        {/* ── Save Button ── */}
        <button
          onClick={handleSave}
          style={{ width: "100%", padding: 14, background: P, color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          Save Collection
        </button>

      </Card>
    </div>
  );
}