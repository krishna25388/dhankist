// ─── Edit Customer Screen ─────────────────────────────────────────────────────
import { useState }  from "react";
import Card          from "../components/Card";
import Avatar        from "../components/Avatar";
import { COLORS }    from "../utils/theme";
import { totalAmount, dailyEMI, dueDate } from "../utils/helpers";
import { updateCustomer }                 from "../utils/api";

const P  = COLORS.primary;
const PL = COLORS.primaryLight;

export default function EditCustomer({ customer, setScreen, onUpdate }) {
  if (!customer) return null;

  const [form, setForm] = useState({
    name:       customer.name,
    phone:      customer.phone       || "",
    loanAmount: String(customer.loanAmount),
    interest:   String(customer.interest),
    duration:   String(customer.duration),
    startDate:  customer.startDate,
    status:     customer.status,
  });

  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  // ── Preview ──
  const la = Number(form.loanAmount);
  const ir = Number(form.interest);
  const du = Number(form.duration) || 1;

  const preview = form.loanAmount ? {
    totalAmt:    Math.round(la * (1 + ir / 100)),
    emi:         Math.round(la * (1 + ir / 100) / du),
    interestAmt: Math.round(la * ir / 100),
    due:         dueDate({ startDate: form.startDate, duration: du }),
  } : null;

  // ── Validate ──
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name       = "Name is required";
    if (!form.loanAmount)  e.loanAmount = "Loan amount is required";
    if (la <= 0)           e.loanAmount = "Enter a valid amount";
    return e;
  }

  // ── Save ──
  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    try {
      setSaving(true);

      const payload = {
        name:       form.name.trim(),
        phone:      form.phone,
        loanAmount: Number(form.loanAmount),
        interest:   Number(form.interest),
        duration:   Number(form.duration),
        startDate:  form.startDate,
        status:     form.status,
      };

      const res = await updateCustomer(customer._id || customer.id, payload);
      const updated = { ...res.data, id: res.data._id };

      // Update local state
      if (onUpdate) onUpdate(updated);

      setScreen("customerDetail");
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setScreen("customerDetail")}
          style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px #0000000d", cursor: "pointer" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}>
          Edit Customer
        </h1>
      </div>

      {/* ── Avatar preview ── */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Avatar c={{ ...customer, name: form.name, initials: form.name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || customer.initials }} size={64} />
          <span style={{ fontSize: 12, color: "#AAA" }}>Customer Profile</span>
        </div>
      </div>

      <Card>
        {/* ── Name ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Customer Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${errors.name ? COLORS.red : "#F0F0F0"}`, fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#111", fontFamily: "inherit" }}
          />
          {errors.name && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>{errors.name}</div>}
        </div>

        {/* ── Phone ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #F0F0F0", fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#111", fontFamily: "inherit" }}
          />
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
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${errors.loanAmount ? COLORS.red : "#F0F0F0"}`, fontSize: 14, outline: "none", background: "#FAFAFA", boxSizing: "border-box", color: "#111", fontFamily: "inherit" }}
          />
          {errors.loanAmount && <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>{errors.loanAmount}</div>}
        </div>

        {/* ── Interest & Duration ── */}
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
              Duration (Days)
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

        {/* ── Status ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 8 }}>
            Status
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {["Active", "Completed"].map((s) => (
              <button
                key={s}
                onClick={() => set("status", s)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1.5px solid ${form.status === s ? P : "#E8E8E8"}`, background: form.status === s ? PL : "#fff", color: form.status === s ? P : "#888", fontSize: 13, fontWeight: form.status === s ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Calculation Preview ── */}
        {preview && (
          <div style={{ background: PL, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: P, fontWeight: 700, marginBottom: 10 }}>
              Updated Calculation
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Total Amount",  `₹ ${preview.totalAmt.toLocaleString("en-IN")}`],
                ["Daily EMI",     `₹ ${preview.emi.toLocaleString("en-IN")}`],
                ["Interest Amt",  `₹ ${preview.interestAmt.toLocaleString("en-IN")}`],
                ["Due Date",      preview.due],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: "#888" }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: P, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Save Button ── */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: "100%", padding: 14, background: P, color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </Card>
    </div>
  );
}