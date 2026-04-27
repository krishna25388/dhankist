// ─── Badge Component ──────────────────────────────────────────────────────────

export default function Badge({ status }) {
  const colorMap = {
    Active:    "#22C55E",
    Completed: "#94A3B8",
    Paid:      "#22C55E",
    Missed:    "#EF4444",
    Pending:   "#FF8C42",
  };

  const col = colorMap[status] || "#94A3B8";

  return (
    <span
      style={{
        fontSize:        12,
        fontWeight:      600,
        color:           col,
        background:      col + "1A",
        padding:         "3px 10px",
        borderRadius:    20,
        whiteSpace:      "nowrap",
        fontFamily:      "inherit",
      }}
    >
      {status}
    </span>
  );
}