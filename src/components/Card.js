// ─── Card Component ───────────────────────────────────────────────────────────

export default function Card({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background:   "#FFFFFF",
        borderRadius: 16,
        padding:      16,
        boxShadow:    "0 1px 6px rgba(0,0,0,0.06)",
        marginBottom: 12,
        cursor:       onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}