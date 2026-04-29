// ─── Login Screen ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { COLORS }   from "../utils/theme";

const P  = COLORS.primary;
const PL = COLORS.primaryLight;

export default function Login({ onLogin }) {
  const [mobile,   setMobile]   = useState("");
  const [pin,      setPin]      = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPin,  setShowPin]  = useState(false);

  // ── Handle PIN input — only 4 digits ──
  function handlePinInput(val) {
    if (/^\d{0,4}$/.test(val)) setPin(val);
  }

  // ── Handle mobile input — only 10 digits ──
  function handleMobileInput(val) {
    if (/^\d{0,10}$/.test(val)) setMobile(val);
  }

  // ── Validate ──
  function validate() {
    if (!mobile || mobile.length !== 10) {
      setError("Enter a valid 10 digit mobile number");
      return false;
    }
    if (!pin || pin.length !== 4) {
      setError("Enter a valid 4 digit PIN");
      return false;
    }
    return true;
  }

  // ── Login ──
  async function handleLogin() {
    setError("");
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ mobile, pin }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Login failed");
        return;
      }

      // ── Save token + user to localStorage ──
      localStorage.setItem("dhankist_token", data.token);
      localStorage.setItem("dhankist_user",  JSON.stringify(data.user));

      // ── Notify App ──
      onLogin(data.user, data.token);

    } catch (err) {
      setError("Cannot connect to server. Check your internet.");
    } finally {
      setLoading(false);
    }
  }

  // ── PIN dots display ──
  function PinDots() {
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: 16, margin: "20px 0" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width:        18,
              height:       18,
              borderRadius: "50%",
              background:   i < pin.length ? P : "#E8E8E8",
              transition:   "background 0.2s",
              border:       `2px solid ${i < pin.length ? P : "#DDD"}`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FC", display: "flex", flexDirection: "column" }}>

      {/* ── Top Brand Section ── */}
      <div style={{ background: P, padding: "60px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {/* Logo */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ffffff22", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 36 }}>💰</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -0.5 }}>
          Dhan<span style={{ color: "#F5C842" }}>Kist</span>
        </h1>
        <p style={{ fontSize: 13, color: "#ffffff88", margin: 0, letterSpacing: 2, textTransform: "uppercase" }}>
          Har Roz · Har Kist
        </p>
      </div>

      {/* ── Login Form ── */}
      <div style={{ flex: 1, padding: "32px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 6px" }}>
          Welcome Back!
        </h2>
        <p style={{ fontSize: 14, color: "#AAA", margin: "0 0 28px" }}>
          Login with your mobile number and PIN
        </p>

        {/* ── Mobile Number ── */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Mobile Number
          </label>
          <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 14, border: `1.5px solid ${error && mobile.length !== 10 ? COLORS.red : "#F0F0F0"}`, padding: "14px 16px", gap: 10, boxShadow: "0 1px 4px #0000000a" }}>
            <span style={{ fontSize: 14, color: "#888", fontWeight: 600 }}>+91</span>
            <div style={{ width: 1, height: 20, background: "#EEE" }}/>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => { handleMobileInput(e.target.value); setError(""); }}
              placeholder="Enter 10 digit number"
              style={{ border: "none", outline: "none", fontSize: 16, fontWeight: 600, color: "#111", flex: 1, background: "none", fontFamily: "inherit", letterSpacing: 1 }}
            />
          </div>
        </div>

        {/* ── PIN ── */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 12, color: "#999", fontWeight: 600, display: "block", marginBottom: 6 }}>
            4 Digit PIN
          </label>
          <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 14, border: `1.5px solid ${error && pin.length !== 4 ? COLORS.red : "#F0F0F0"}`, padding: "14px 16px", gap: 10, boxShadow: "0 1px 4px #0000000a" }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => { handlePinInput(e.target.value); setError(""); }}
              placeholder="Enter 4 digit PIN"
              maxLength={4}
              style={{ border: "none", outline: "none", fontSize: 22, fontWeight: 800, color: "#111", flex: 1, background: "none", fontFamily: "inherit", letterSpacing: 8 }}
            />
            <button
              onClick={() => setShowPin(!showPin)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 0 }}
            >
              {showPin ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* ── PIN Dots ── */}
        <PinDots />

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "#FFF0F0", border: "1px solid #FFD0D0", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: COLORS.red, fontWeight: 500, textAlign: "center" }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Login Button ── */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", padding: "16px", background: loading ? "#AAA" : P, color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: loading ? "none" : `0 4px 16px ${P}55`, marginBottom: 16 }}
        >
          {loading ? "Logging in..." : "Login →"}
        </button>

        {/* ── Help text ── */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#CCC", margin: 0 }}>
          Contact admin if you forgot your PIN
        </p>
      </div>

      {/* ── Bottom branding ── */}
      <div style={{ padding: "16px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "#DDD", margin: 0 }}>
          DhanKist v1.0 — Secure Financial Manager
        </p>
      </div>

    </div>
  );
}