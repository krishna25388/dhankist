// ─── DhanKist Entry Point ─────────────────────────────────────────────────────
import React    from "react";
import ReactDOM from "react-dom/client";
import App      from "./App";

// ─── Mount React App ──────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ─── Register Service Worker for PWA (offline support) ───────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => {
        console.log("✅ DhanKist SW registered:", reg.scope);
      })
      .catch((err) => {
        console.log("❌ SW registration failed:", err);
      });
  });
}