// ─── DhanKist Root App ────────────────────────────────────────────────────────
import { useState }  from "react";
import useStore      from "./hooks/useStore";
import BottomNav     from "./components/BottomNav";

import Dashboard         from "./screens/Dashboard";
import Customers         from "./screens/Customers";
import AddCustomer       from "./screens/AddCustomer";
import CustomerDetail    from "./screens/CustomerDetail";
import AddCollection     from "./screens/AddCollection";
import CollectionHistory from "./screens/CollectionHistory";
import Collections       from "./screens/Collections";
import Reports           from "./screens/Reports";
import EditCustomer from "./screens/EditCustomer";

export default function App() {
  // ── Navigation ──
  const [screen,   setScreen]   = useState("dashboard");
  const [selected, setSelected] = useState(null);

  // ── Data store ──
  const {
    customers,
    history,
    loading,
    error,
    addCustomer,
    addCollection,
    updateHistoryRecord,
    updateCustomerRecord,
    refresh,
  } = useStore();

  // ── Loading screen ──
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F7F8FC" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>💰</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#5B4FE8" }}>DhanKist</div>
        <div style={{ fontSize: 13, color: "#AAA", marginTop: 8 }}>Loading your data...</div>
      </div>
    );
  }

  // ── Error screen ──
  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F7F8FC", padding: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#EF4444", marginBottom: 8 }}>Connection Error</div>
        <div style={{ fontSize: 13, color: "#AAA", textAlign: "center", marginBottom: 24 }}>{error}</div>
        <button
          onClick={refresh}
          style={{ padding: "12px 24px", background: "#5B4FE8", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Shared props ──
  const shared = { customers, history, setScreen, selected, setSelected };
  const hideNav = ["addCustomer", "addCollection"].includes(screen);

  return (
    <div
      style={{
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        background: "#F7F8FC",
        minHeight:  "100vh",
        maxWidth:   430,
        margin:     "0 auto",
        position:   "relative",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* ── Screens ── */}
      {screen === "dashboard"         && <Dashboard         {...shared} />}
      {screen === "customers"         && <Customers         {...shared} />}
      {screen === "addCustomer"       && (
        <AddCustomer
          setScreen={setScreen}
          onAdd={addCustomer}
        />
      )}
      {screen === "customerDetail"    && (
        <CustomerDetail
          customer={selected}
          history={history}
          setScreen={setScreen}
        />
      )}
      {screen === "editCustomer" && (
  <EditCustomer
    customer={selected}
    setScreen={setScreen}
    onUpdate={updateCustomerRecord}
  />
)}

      {screen === "addCollection"     && (
        <AddCollection
          customer={selected}
          setScreen={setScreen}
          onAdd={addCollection}
        />
      )}
      {screen === "collectionHistory" && (
        <CollectionHistory
          customer={selected}
          history={history}
          setScreen={setScreen}
          onHistoryUpdate={updateHistoryRecord}
        />
      )}
      {screen === "collections"       && <Collections       {...shared} />}
      {screen === "reports"           && (
        <Reports
          customers={customers}
          history={history}
        />
      )}

      {/* ── Bottom Nav ── */}
      {!hideNav && (
        <BottomNav
          active={screen}
          setScreen={setScreen}
        />
      )}
    </div>
  );
}