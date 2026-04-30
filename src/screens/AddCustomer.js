// ─── Add Customer Screen ──────────────────────────────────────────────────────
import { useState }  from "react";
import Card          from "../components/Card";
import { COLORS }    from "../utils/theme";
import {
  fmt,
  periodEMI,
  periodInterest,
  dueDate,
  frequencyLabel,
  paymentTypeLabel,
} from "../utils/helpers";

const P  = COLORS.primary;
const PL = COLORS.primaryLight;

export default function AddCustomer({ setScreen, onAdd }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name:        "",
    phone:       "",
    loanAmount:  "",
    interest:    "5",
    duration:    "12",
    startDate:   today,
    frequency:   "monthly",
    paymentType: "reducing_balance",
  });

  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  // ── Build preview customer object ──
  const previewCustomer = form.loanAmount ? {
    loanAmount:         Number(form.loanAmount),
    remainingPrincipal: Number(form.loanAmount),
    interest:           Number(form.interest),
    duration:           Number(form.duration) || 1,
    startDate:          form.startDate,
    frequency:          form.frequency,
    paymentType:        form.paymentType,
  } : null;

  // ── Validate ──
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name       = "Name is required";
    if (!form.loanAmount)  e.loanAmount = "Loan amount is required";
    if (Number(form.loanAmount) <= 0) e.loanAmount = "Enter valid amount";
    return e;
  }

  // ── Save ──
  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    try {
      setSaving(true);
      await onAdd(form);
      setScreen("customers");
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setScreen("customers")}
          style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px #0000000d", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}>Add Customer</h1>
      </div>

      <Card>
        {/* ── Basic Info ── */}
        <div style={{ fontSize: 11, color: P, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>
          CUSTOMER INFO
        </div>

        {[
          { label: "Customer Name *", key: "name",      type: "text",   ph: "Full name"       },
          { label: "Phone Number",    key: "phone",     type: "tel",    ph: "+91 XXXXX XXXXX" },
        ].map((f) => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
              {f.label}
            </label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.ph}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${errors[f.key] ? COLORS.red : "#F0F0F0"}`, fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#111", fontFamily: "inherit" }}
            />
            {errors[f.key] && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>{errors[f.key]}</div>}
          </div>
        ))}

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "#F5F5F5", margin: "8px 0 16px" }}/>
        <div style={{ fontSize: 11, color: P, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>
          LOAN DETAILS
        </div>

        {/* ── Loan Amount ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Loan Amount (₹) *
          </label>
          <input
            type="number"
            value={form.loanAmount}
            onChange={(e) => set("loanAmount", e.target.value)}
            placeholder="e.g. 100000"
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${errors.loanAmount ? COLORS.red : "#F0F0F0"}`, fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#111", fontFamily: "inherit" }}
          />
          {errors.loanAmount && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>{errors.loanAmount}</div>}
        </div>

        {/* ── Interest + Duration ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Interest (%)
            </label>
            <input
              type="number"
              value={form.interest}
              onChange={(e) => set("interest", e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #F0F0F0", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#111", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Duration ({frequencyLabel(form.frequency)}s)
            </label>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #F0F0F0", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#111", fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* ── Start Date ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Start Date
          </label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #F0F0F0", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#111", fontFamily: "inherit" }}
          />
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "#F5F5F5", margin: "8px 0 16px" }}/>
        <div style={{ fontSize: 11, color: P, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>
          COLLECTION TYPE
        </div>

        {/* ── Frequency ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 8 }}>
            Collection Frequency
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { val: "daily",   label: "Daily",   icon: "📅" },
              { val: "weekly",  label: "Weekly",  icon: "🗓️" },
              { val: "monthly", label: "Monthly", icon: "📆" },
            ].map((f) => (
              <button key={f.val} onClick={() => set("frequency", f.val)}
                style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: `1.5px solid ${form.frequency === f.val ? P : "#E8E8E8"}`, background: form.frequency === f.val ? PL : "#fff", color: form.frequency === f.val ? P : "#888", fontSize: 12, fontWeight: form.frequency === f.val ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                <div>{f.icon}</div>
                <div style={{ marginTop: 2 }}>{f.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Payment Type ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 8 }}>
            Payment Type
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              {
                val:  "fixed_emi",
                label:"Fixed EMI",
                desc: "Same amount every period. Principal + Interest split evenly.",
                icon: "🔒",
              },
              {
                val:  "interest_only",
                label:"Interest Only",
                desc: "Pay only interest each period. Full principal at end.",
                icon: "💡",
              },
              {
                val:  "reducing_balance",
                label:"Reducing Balance",
                desc: "Pay interest + any extra reduces principal. Interest reduces each period.",
                icon: "📉",
              },
            ].map((pt) => (
              <button key={pt.val} onClick={() => set("paymentType", pt.val)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${form.paymentType === pt.val ? P : "#E8E8E8"}`, background: form.paymentType === pt.val ? PL : "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{pt.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: form.paymentType === pt.val ? P : "#333" }}>{pt.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "#AAA", lineHeight: 1.4 }}>{pt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Calculation Preview ── */}
        {previewCustomer && (
          <div style={{ background: PL, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: P, fontWeight: 700, marginBottom: 10 }}>
              Calculation Preview
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Loan Amount",    fmt(previewCustomer.loanAmount)],
                ["Interest/Period",fmt(periodInterest(previewCustomer))],
                ["Min. Due/Period",fmt(periodEMI(previewCustomer))],
                ["Frequency",      form.frequency.charAt(0).toUpperCase() + form.frequency.slice(1)],
                ["Duration",       `${form.duration} ${frequencyLabel(form.frequency)}s`],
                ["Due Date",       dueDate(previewCustomer)],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: "#888" }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: P, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Reducing balance example */}
            {form.paymentType === "reducing_balance" && (
              <div style={{ marginTop: 12, padding: 10, background: "#fff", borderRadius: 10, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
                💡 <strong>Example:</strong> If customer pays {fmt(periodInterest(previewCustomer) + 25000)} →
                Interest: {fmt(periodInterest(previewCustomer))} +
                Principal: {fmt(25000)} →
                New loan: {fmt(Math.max(0, previewCustomer.loanAmount - 25000))}
              </div>
            )}
          </div>
        )}

        {/* ── Save Button ── */}
        <button onClick={handleSave} disabled={saving}
          style={{ width: "100%", padding: 14, background: saving ? "#AAA" : P, color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {saving ? "Saving..." : "Save Customer"}
        </button>
      </Card>
    </div>
  );
}