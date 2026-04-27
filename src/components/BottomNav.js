// ─── Bottom Navigation ────────────────────────────────────────────────────────
import { COLORS } from "../utils/theme";

const P = COLORS.primary;

const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <path
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: "customers",
    label: "Customers",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "__add__",
    label: "",
    icon: null,
  },
  {
    id: "collections",
    label: "Collections",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <path
        d="M18 20V10M12 20V4M6 20v-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function BottomNav({ active, setScreen }) {
  return (
    <div
      style={{
        position:       "fixed",
        bottom:         0,
        left:           "50%",
        transform:      "translateX(-50%)",
        width:          "min(430px, 100vw)",
        background:     "#fff",
        borderTop:      "1px solid #F0F0F0",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-around",
        padding:        "8px 0 18px",
        zIndex:         100,
        boxShadow:      "0 -2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {tabs.map((t) =>
        t.id === "__add__" ? (
          // ── Centre + button ──
          <button
            key="add"
            onClick={() => setScreen("addCustomer")}
            style={{
              width:        52,
              height:       52,
              borderRadius: "50%",
              background:   P,
              border:       "none",
              color:        "#fff",
              fontSize:     26,
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              boxShadow:    `0 4px 16px ${P}55`,
              marginTop:    -20,
              fontFamily:   "inherit",
            }}
          >
            +
          </button>
        ) : (
          // ── Regular tab ──
          <button
            key={t.id}
            onClick={() => setScreen(t.id)}
            style={{
              background:     "none",
              border:         "none",
              cursor:         "pointer",
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              gap:            2,
              color:          active === t.id ? P : "#C0C0C0",
              padding:        "0 10px",
              fontFamily:     "inherit",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={active === t.id ? 2.2 : 1.8}
            >
              {t.icon}
            </svg>
            <span
              style={{
                fontSize:   10,
                fontWeight: active === t.id ? 700 : 400,
              }}
            >
              {t.label}
            </span>
          </button>
        )
      )}
    </div>
  );
}