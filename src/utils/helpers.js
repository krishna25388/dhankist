// ─── DhanKist Helpers ─────────────────────────────────────────────────────────

/** Format number as Indian Rupee: 10000 → "₹ 10,000" */
export const fmt = (n) =>
  "₹ " + Number(n).toLocaleString("en-IN");

/** Total repayable amount including interest */
export const totalAmount = (c) =>
  Math.round(c.loanAmount * (1 + c.interest / 100));

/** Daily EMI amount */
export const dailyEMI = (c) =>
  Math.round(totalAmount(c) / c.duration);

/** Loan due date string */
export const dueDate = (c) => {
  const d = new Date(c.startDate);
  d.setDate(d.getDate() + c.duration);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

/** Format any date string */
export const fmtDate = (ds) =>
  new Date(ds).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });

/** Full date label like "Sunday, 18 May 2025" */
export const fullDateLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric",
    month: "long",  year: "numeric"
  });

/** Customer stats calculated from their history */
export const customerStats = (c, history) => {
  const h = history[c.id] || [];
  const totalReceived = h.reduce((s, r) => s + r.amount, 0);
  const paidDays      = h.reduce((s, r) => s + r.emis,   0);
  const pending       = Math.max(0, totalAmount(c) - totalReceived);
  const profit        = Math.max(0, Math.round(
    totalReceived - (c.loanAmount * paidDays / c.duration)
  ));
  return { totalReceived, paidDays, pending, profit };
};

/** Generate initials from full name: "Ramesh Kumar" → "RK" */
export const getInitials = (name) =>
  name.trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();