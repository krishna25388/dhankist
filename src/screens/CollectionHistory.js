// ─── Collection History Screen ────────────────────────────────────────────────
import { useState }  from "react";
import Card          from "../components/Card";
import Badge         from "../components/Badge";
import { COLORS }    from "../utils/theme";
import { fmt, fmtDate } from "../utils/helpers";
import { updateCollection } from "../utils/api";

const P = COLORS.primary;
const G = COLORS.green;
const R = COLORS.red;
const PL = COLORS.primaryLight;

export default function CollectionHistory({ customer, history, setScreen, onHistoryUpdate }) {

    // ── Edit state ──
  const [editingId, setEditingId]     = useState(null);
  const [editAmount, setEditAmount]   = useState("");
  const [editEmis,   setEditEmis]     = useState(1);
  const [editMode,   setEditMode]     = useState("Cash");
  const [editNotes,  setEditNotes]    = useState("");
  const [editStatus, setEditStatus]   = useState("Paid");
  const [saving,     setSaving]       = useState(false);
  
  if (!customer) return null;

  const h    = [...(history[customer.id] || [])].reverse();
  const paid = h.filter((r) => r.status === "Paid").length;
  const miss = h.filter((r) => r.status === "Missed").length;
  const rem  = Math.max(0, customer.duration - h.length);



  // ── Open edit ──
  function openEdit(r) {
    setEditingId(r._id || r.id);
    setEditAmount(String(r.amount));
    setEditEmis(r.emis);
    setEditMode(r.paymentMode || "Cash");
    setEditNotes(r.notes || "");
    setEditStatus(r.status);
  }

  // ── Save edit ──
  async function handleEditSave(r) {
    try {
      setSaving(true);
      const updated = {
        amount:      Number(editAmount),
        emis:        editEmis,
        paymentMode: editMode,
        notes:       editNotes,
        status:      editStatus,
      };
      await updateCollection(r._id || r.id, updated);

      // Update local state
      if (onHistoryUpdate) onHistoryUpdate(customer.id, r._id || r.id, updated);

      setEditingId(null);
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "52px 16px 100px", background: "#F7F8FC", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setScreen("customerDetail")}
            style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px #0000000d", cursor: "pointer" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}>
            Collection History
          </h1>
        </div>
      </div>

      {/* ── Summary Counts ── */}
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", textAlign: "center" }}>
          {[
            ["Total EMI", customer.duration, "#111"],
            ["Paid",      paid,              G    ],
            ["Missed",    miss,              R    ],
            ["Remaining", rem,               P    ],
          ].map(([l, v, col], i) => (
            <div key={l} style={{ borderLeft: i > 0 ? "1px solid #F3F3F3" : "none" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: col }}>{v}</div>
              <div style={{ fontSize: 10, color: "#AAA", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── History Table ── */}
      <Card style={{ padding: 0, overflow: "hidden" }}>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px 60px 36px", padding: "10px 14px", borderBottom: "1px solid #F5F5F5", background: "#FAFAFA" }}>
          {["Date", "EMI", "Amount", "Status", ""].map((h, i) => (
            <span key={i} style={{ fontSize: 11, color: "#AAA", fontWeight: 600, textAlign: i > 0 ? "center" : "left" }}>
              {h}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {h.map((r, i) => (
          <div key={i}>
            {/* ── Normal row ── */}
            {editingId !== (r._id || r.id) ? (
              <div
                style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px 60px 36px", padding: "11px 14px", borderBottom: i < h.length - 1 ? "1px solid #F9F9F9" : "none", background: i % 2 === 0 ? "#fff" : "#FAFAFA", alignItems: "center" }}
              >
                <span style={{ fontSize: 12, color: "#555" }}>{fmtDate(r.date)}</span>
                <span style={{ fontSize: 12, color: "#888", textAlign: "center" }}>{r.emis > 0 ? `${r.emis}` : "—"}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111", textAlign: "center" }}>{r.amount > 0 ? fmt(r.amount) : "—"}</span>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Badge status={r.status} />
                </div>
                {/* Edit button */}
                <button
                  onClick={() => openEdit(r)}
                  style={{ background: PL, border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              /* ── Edit row ── */
              <div style={{ padding: "14px", background: PL, borderBottom: "1px solid #E8E4FF" }}>
                <div style={{ fontSize: 11, color: P, fontWeight: 700, marginBottom: 10 }}>
                  ✏️ Editing — {fmtDate(r.date)}
                </div>

                {/* Amount */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: "#888", fontWeight: 600, display: "block", marginBottom: 4 }}>Amount (₹)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${P}`, fontSize: 15, fontWeight: 700, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>

                {/* EMI days */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: "#888", fontWeight: 600, display: "block", marginBottom: 4 }}>EMI Days</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => setEditEmis(Math.max(0, editEmis - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #DDD", background: "#fff", fontSize: 18, cursor: "pointer" }}>−</button>
                    <span style={{ fontSize: 18, fontWeight: 800, minWidth: 30, textAlign: "center" }}>{editEmis}</span>
                    <button onClick={() => setEditEmis(editEmis + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #DDD", background: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
                  </div>
                </div>

                {/* Status */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: "#888", fontWeight: 600, display: "block", marginBottom: 4 }}>Status</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Paid", "Missed"].map((s) => (
                      <button key={s} onClick={() => setEditStatus(s)}
                        style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1.5px solid ${editStatus === s ? P : "#DDD"}`, background: editStatus === s ? P : "#fff", color: editStatus === s ? "#fff" : "#888", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment mode */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: "#888", fontWeight: 600, display: "block", marginBottom: 4 }}>Payment Mode</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Cash", "UPI", "Bank Transfer"].map((m) => (
                      <button key={m} onClick={() => setEditMode(m)}
                        style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: `1.5px solid ${editMode === m ? P : "#DDD"}`, background: editMode === m ? PL : "#fff", color: editMode === m ? P : "#888", fontSize: 11, fontWeight: editMode === m ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: "#888", fontWeight: 600, display: "block", marginBottom: 4 }}>Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={2}
                    placeholder="Add a note..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1.5px solid #DDD", fontSize: 13, resize: "none", outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{ flex: 1, padding: "10px", background: "#fff", color: "#888", border: "1.5px solid #DDD", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditSave(r)}
                    disabled={saving}
                    style={{ flex: 2, padding: "10px", background: P, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {h.length === 0 && (
          <div style={{ textAlign: "center", color: "#CCC", padding: 32, fontSize: 14 }}>No history yet</div>
        )}
      </Card>
    </div>
  );
}