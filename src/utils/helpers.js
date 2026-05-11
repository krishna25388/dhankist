// ─── DhanKist Helpers ─────────────────────────────────────────────────────────

/** Format number as Indian Rupee: 10000 → "₹ 10,000" */
export const fmt = (n) =>
  "₹ " + Number(n || 0).toLocaleString("en-IN");

/** Format any date string */
export const fmtDate = (ds) =>
  new Date(ds).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });

/** Full date label like "Sunday, 18 May 2025" */
export const fullDateLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric",
    month:   "long", year: "numeric"
  });

/** Generate initials from full name: "Ramesh Kumar" → "RK" */
export const getInitials = (name) =>
  name.trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// ─── Loan Calculations ────────────────────────────────────────────────────────

/** Total repayable amount including interest (for fixed_emi only) */
export const totalAmount = (c) => {
  if (c.paymentType === "interest_only" || c.paymentType === "reducing_balance") {
    return c.loanAmount; // Principal stays same or reduces
  }
  return Math.round(c.loanAmount * (1 + c.interest / 100));
};

/** Calculate interest for one period based on payment type */
export const periodInterest = (c) => {
  const principal = c.remainingPrincipal || c.loanAmount;
  return Math.round(principal * c.interest / 100);
};

/** EMI per period based on frequency and payment type */
export const periodEMI = (c) => {
  switch (c.paymentType) {

    // ── Fixed EMI ──────────────────────────────────────────────────────────
    // Same amount every period — includes both interest + principal
    case "fixed_emi":
      return Math.round(totalAmount(c) / c.duration);

    // ── Interest Only ──────────────────────────────────────────────────────
    // Only interest paid each period
    // Principal paid at end as lump sum
    case "interest_only":
      return periodInterest(c);

    // ── Reducing Balance ───────────────────────────────────────────────────
    // Interest calculated on remaining principal
    // Customer can pay any extra amount to reduce principal
    case "reducing_balance":
      return periodInterest(c); // Minimum due is just interest

    default:
      return Math.round(totalAmount(c) / c.duration);
  }
};

/** Due date based on frequency */
export const dueDate = (c) => {
  const d = new Date(c.startDate);
  switch (c.frequency) {
    case "daily":   d.setDate(d.getDate()   + c.duration);       break;
    case "weekly":  d.setDate(d.getDate()   + c.duration * 7);   break;
    case "monthly": d.setMonth(d.getMonth() + c.duration);       break;
    default:        d.setDate(d.getDate()   + c.duration);
  }
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

/** Frequency label */
export const frequencyLabel = (freq) => {
  const map = { daily: "Day", weekly: "Week", monthly: "Month" };
  return map[freq] || "Day";
};

/** Payment type label */
export const paymentTypeLabel = (type) => {
  const map = {
    fixed_emi:        "Fixed EMI",
    interest_only:    "Interest Only",
    reducing_balance: "Reducing Balance",
  };
  return map[type] || "Fixed EMI";
};

// ─── Reducing Balance Calculation ─────────────────────────────────────────────
/**
 * Calculate payment breakdown for reducing balance
 *
 * Example:
 * Loan: ₹1,00,000 | Rate: 5% | Customer pays ₹30,000
 * Interest = 5% of ₹1,00,000 = ₹5,000
 * Principal = ₹30,000 - ₹5,000 = ₹25,000
 * New Principal = ₹1,00,000 - ₹25,000 = ₹75,000
 * Next interest = 5% of ₹75,000 = ₹3,750
 */
export const calcReducingBalance = (customer, amountPaid) => {
  const principal    = customer.remainingPrincipal || customer.loanAmount;
  const interestDue  = Math.round(principal * customer.interest / 100);
  const interestPaid = Math.min(amountPaid, interestDue);
  const principalPaid= Math.max(0, amountPaid - interestDue);
  const newPrincipal = Math.max(0, principal - principalPaid);

  return {
    interestDue,
    interestPaid,
    principalPaid,
    newPrincipal,
    isFullyPaid: newPrincipal === 0,
  };
};

// ─── Customer Stats ───────────────────────────────────────────────────────────
// export const customerStats = (c, history) => {
//   const cid = c._id || c.id;
//   const h   = history[cid] || [];

//   const totalReceived  = h.reduce((s, r) => s + (r.amount       || 0), 0);
//   const totalInterest  = h.reduce((s, r) => s + (r.interestPaid || 0), 0);
//   const totalPrincipal = h.reduce((s, r) => s + (r.principalPaid|| 0), 0);
//   const paidDays       = h.reduce((s, r) => s + (r.emis         || 0), 0);

//   // Remaining principal from customer record (most accurate)
//   const remainingPrincipal = c.remainingPrincipal ?? c.loanAmount;

//   // Profit = total interest collected
//   const profit = c.paymentType === "reducing_balance" || c.paymentType === "interest_only"
//     ? totalInterest
//     : Math.max(0, Math.round(totalReceived - (c.loanAmount * paidDays / c.duration)));

//   const pending = Math.max(0,
//     c.paymentType === "reducing_balance" || c.paymentType === "interest_only"
//       ? remainingPrincipal
//       : totalAmount(c) - totalReceived
//   );

//   return {
//     totalReceived,
//     totalInterest,
//     totalPrincipal,
//     paidDays,
//     pending,
//     profit,
//     remainingPrincipal,
//   };
// };

export const customerStats = (c, history) => {
  const cid = c._id || c.id;
  const h   = history[cid] || [];

  const totalReceived  = h.reduce((s, r) => s + (r.amount        || 0), 0);
  const totalInterest  = h.reduce((s, r) => s + (r.interestPaid  || 0), 0);
  const totalPrincipal = h.reduce((s, r) => s + (r.principalPaid || 0), 0);
  const paidDays       = h.reduce((s, r) => s + (r.emis          || 0), 0);

  // ── Remaining principal from DB (most accurate) ──
  const remainingPrincipal = c.remainingPrincipal ?? c.loanAmount;

  // ── Total amount customer owes including interest ──
  const fullTotal = c.paymentType === "fixed_emi"
    ? Math.round(c.loanAmount * (1 + c.interest / 100))
    : c.loanAmount;

  // ── Profit calculation ──
  let profit = 0;
  if (c.paymentType === "reducing_balance" || c.paymentType === "interest_only") {
    profit = totalInterest;
  } else {
    // Fixed EMI — profit is interest portion of received
    const totalInterestAmt = fullTotal - c.loanAmount;
    const interestPerEmi   = c.duration > 0 ? totalInterestAmt / c.duration : 0;
    profit = Math.round(interestPerEmi * paidDays);
  }

  // ── Pending = what is still owed ──
  const pending = Math.max(0, fullTotal - totalReceived);

  return {
    totalReceived,
    totalInterest,
    totalPrincipal,
    paidDays,
    pending,
    profit,
    remainingPrincipal: c.paymentType === "fixed_emi"
      ? pending  // For fixed EMI remaining = pending amount
      : remainingPrincipal,
    fullTotal,
  };
};