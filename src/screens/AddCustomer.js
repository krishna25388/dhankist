// ─── Add Customer Screen ──────────────────────────────────────────────────────
import { useState }  from "react";
import Card          from "../components/Card";
import { COLORS }    from "../utils/theme";
import { fmt, totalAmount, dailyEMI, dueDate } from "../utils/helpers";

const P  = COLORS.primary;
const PL = COLORS.primaryLight;

const FIELDS = [
  { label: "Customer Name *",   key: "name",       type: "text",   ph: "Full name"        },
  { label: "Phone Number",      key: "phone",       type: "tel",    ph: "+91 XXXXX XXXXX"  },
  { label: "Loan Amount (₹) *", key: "loanAmount",  type: "number", ph: "e.g. 10000"       },
  { label: "Interest (%)",      key: "interest",    type: "number", ph: "20"               },
  { label: "Duration (Days)",   key: "duration",    type: "number", ph: "80"               },
  { label: "Start Date",        key: "startDate",   type: "date",   ph: ""                 },
];

export default function AddCustomer({ setScreen, onAdd }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name:       "",
    phone:      "",
    loanAmount: "",
    interest:   "20",
    duration:   "80",
    startDate:  today,
  });

  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  // ── Preview calculation ──
  const la = Number(form.loanAmount);
  const ir = Number(form.interest);
  const du = Number(form.duration) || 1;

  const preview = form.loanAmount
    ? {
        totalAmt:    totalAmount({ loanAmount: la, interest: ir }),
        emi:         dailyEMI({ loanAmount: la, interest: ir, duration: du }),
        interestAmt: Math.round(la * ir / 100),
        due:         dueDate({ startDate: form.startDate, duration: du }),
      }
    : null;

  // ── Validate ──
  function validate() {
    const e = {};
    if (!form.name.trim())   e.name       = "Name is required";
    if (!form.loanAmount)    e.loanAmount  = "Loan amount is required";
    if (la <= 0)             e.loanAmount  = "Enter a valid amount";
    return e;
  }

  // ── Submit ──
async function handleSave() {
  const e = validate();
  if (Object.keys(e).length > 0) { setErrors(e); return; }

  console.log("🔥 handleSave triggered");

  try {
    await onAdd(form);
    setScreen("customers");
  } catch (err) {
    console.error("❌ Save failed:", err);
    alert("Failed: " + err.message);
  }
}

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setScreen("customers")}
          style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px #0000000d", cursor: "pointer" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}>
          Add Customer
        </h1>
      </div>

      <Card>
        {/* ── Form Fields ── */}
        {FIELDS.map((field) => (
          <div key={field.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
              {field.label}
            </label>
            <input
              type={field.type}
              value={form[field.key]}
              onChange={(e) => set(field.key, e.target.value)}
              placeholder={field.ph}
              style={{
                width:        "100%",
                padding:      "12px 14px",
                borderRadius: 12,
                border:       `1.5px solid ${errors[field.key] ? COLORS.red : "#F0F0F0"}`,
                fontSize:     14,
                outline:      "none",
                background:   "#FAFAFA",
                boxSizing:    "border-box",
                color:        "#111",
                fontFamily:   "inherit",
              }}
            />
            {errors[field.key] && (
              <div style={{ fontSize: 11, color: COLORS.red, marginTop: 4 }}>
                {errors[field.key]}
              </div>
            )}
          </div>
        ))}

        {/* ── Calculation Preview ── */}
        {preview && (
          <div style={{ background: PL, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: P, fontWeight: 700, marginBottom: 10 }}>
              Calculation Preview
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Total Amount",  fmt(preview.totalAmt)],
                ["Daily EMI",     fmt(preview.emi)],
                ["Interest Amt",  fmt(preview.interestAmt)],
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
  style={{ width: "100%", padding: 14, background: P, color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
>
  Save Customer
</button>
      </Card>
    </div>
  );
}