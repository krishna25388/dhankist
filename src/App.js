// ─── DhanKist Root App ────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import useStore                from "./hooks/useStore";
import BottomNav               from "./components/BottomNav";
import Login                   from "./screens/Login";

import Dashboard         from "./screens/Dashboard";
import Customers         from "./screens/Customers";
import AddCustomer       from "./screens/AddCustomer";
import CustomerDetail    from "./screens/CustomerDetail";
import AddCollection     from "./screens/AddCollection";
import CollectionHistory from "./screens/CollectionHistory";
import EditCustomer      from "./screens/EditCustomer";
import Collections       from "./screens/Collections";
import Reports           from "./screens/Reports";

export default function App() {
  // ── Auth state ──
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // ── Navigation state ──
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
  } = useStore(token);

  // ── Check localStorage for existing login on app start ──
  useEffect(() => {
    const savedToken = localStorage.getItem("dhankist_token");
    const savedUser  = localStorage.getItem("dhankist_user");

    if (savedToken && savedUser) {
      try {
        // Check token expiry
        const payload = JSON.parse(atob(savedToken.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          // Token expired — clear and show login
          localStorage.removeItem("dhankist_token");
          localStorage.removeItem("dhankist_user");
        } else {
          // Valid token — auto login
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        localStorage.removeItem("dhankist_token");
        localStorage.removeItem("dhankist_user");
      }
    }
    setAuthReady(true);
  }, []);

  // ── Handle login ──
  function handleLogin(userData, userToken) {
    setUser(userData);
    setToken(userToken);
  }

  // ── Handle logout ──
  function handleLogout() {
    localStorage.removeItem("dhankist_token");
    localStorage.removeItem("dhankist_user");
    setUser(null);
    setToken(null);
    setScreen("dashboard");
  }

  // ── Auth loading ──
  if (!authReady) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F7F8FC" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>💰</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#5B4FE8" }}>DhanKist</div>
      </div>
    );
  }

  // ── Show login if not authenticated ──
  if (!user || !token) {
    return (
      <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", maxWidth: 430, margin: "0 auto" }}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // ── Data loading ──
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F7F8FC" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>💰</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#5B4FE8" }}>DhanKist</div>
        <div style={{ fontSize: 13, color: "#AAA", marginTop: 8 }}>Loading your data...</div>
      </div>
    );
  }

  // ── Data error ──
  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F7F8FC", padding: 24 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#EF4444", marginBottom: 8 }}>Connection Error</div>
        <div style={{ fontSize: 13, color: "#AAA", textAlign: "center", marginBottom: 24 }}>{error}</div>
        <button onClick={refresh}
          style={{ padding: "12px 24px", background: "#5B4FE8", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Try Again
        </button>
      </div>
    );
  }

  // ── Shared props ──
  const shared = { customers, history, setScreen, selected, setSelected };
  const hideNav = ["addCustomer", "addCollection", "editCustomer"].includes(screen);

  return (
    <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", background: "#F7F8FC", minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>

      {/* ── User info bar ── */}
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "min(430px,100vw)", background: "#fff", borderBottom: "1px solid #F0F0F0", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 99, boxShadow: "0 1px 4px #0000000a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EEF0FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#5B4FE8" }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{user.name}</div>
            <div style={{ fontSize: 10, color: "#AAA" }}>+91 {user.mobile}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: "#FFF0F0", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#EF4444", cursor: "pointer", fontFamily: "inherit" }}
        >
          Logout
        </button>
      </div>

      {/* ── Screens ── */}
      {screen === "dashboard"         && <Dashboard         {...shared} />}
      {screen === "customers"         && <Customers         {...shared} />}
      {screen === "addCustomer"       && <AddCustomer        setScreen={setScreen} onAdd={addCustomer} />}
      {screen === "customerDetail"    && <CustomerDetail     customer={selected} history={history} setScreen={setScreen} />}
      {screen === "addCollection"     && <AddCollection      customer={selected} setScreen={setScreen} onAdd={addCollection} />}
      {screen === "collectionHistory" && <CollectionHistory  customer={selected} history={history} setScreen={setScreen} onHistoryUpdate={updateHistoryRecord} />}
      {screen === "editCustomer"      && <EditCustomer       customer={selected} setScreen={setScreen} onUpdate={updateCustomerRecord} />}
      {screen === "collections"       && <Collections        {...shared} />}
      {screen === "reports"           && <Reports            customers={customers} history={history} />}

      {/* ── Bottom Nav ── */}
      {!hideNav && <BottomNav active={screen} setScreen={setScreen} />}
    </div>
  );
}