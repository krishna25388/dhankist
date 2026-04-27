// ─── Avatar Component ─────────────────────────────────────────────────────────

export default function Avatar({ c, size = 44 }) {
  return (
    <div
      style={{
        width:          size,
        height:         size,
        borderRadius:   "50%",
        background:     c.color + "22",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontWeight:     700,
        fontSize:       size * 0.32,
        color:          c.color,
        flexShrink:     0,
        fontFamily:     "inherit",
      }}
    >
      {c.initials}
    </div>
  );
}