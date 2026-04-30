// ─── DhanKist Excel Export ────────────────────────────────────────────────────
import * as XLSX      from "xlsx";
import { saveAs }     from "file-saver";
import { fmt, totalAmount, periodEMI, dueDate, customerStats, fmtDate } from "./helpers";

export function exportCustomerExcel(customer, history) {
  const wb   = XLSX.utils.book_new();
  const cid  = customer._id || customer.id;
  const h    = history[cid] || [];
  const st   = customerStats(customer, history);
  const pct  = Math.min(100, Math.round((st.paidDays / customer.duration) * 100));

  // ── Sheet 1: Customer Details ──────────────────────────────────────────────
  const details = [
    ["DhanKist — Customer Report", ""],
    ["", ""],
    ["CUSTOMER INFORMATION", ""],
    ["Name",           customer.name],
    ["Phone",          customer.phone || "—"],
    ["Status",         customer.status],
    ["", ""],
    ["LOAN DETAILS", ""],
    ["Loan Amount",    customer.loanAmount],
    ["Interest (%)",   customer.interest + "%"],
    ["Total Amount",   totalAmount(customer)],
    ["Daily EMI",      periodEMI(customer)],
    ["Duration",       customer.duration + " Days"],
    ["Start Date",     customer.startDate],
    ["Due Date",       dueDate(customer)],
    ["", ""],
    ["COLLECTION SUMMARY", ""],
    ["Total Received", st.totalReceived],
    ["Pending Amount", st.pending],
    ["Total Profit",   st.profit],
    ["Days Paid",      st.paidDays + " / " + customer.duration],
    ["Progress",       pct + "%"],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(details);

  // Column widths
  ws1["!cols"] = [{ wch: 20 }, { wch: 25 }];

  // Style header rows
  ws1["A1"] = { v: "DhanKist — Customer Report", t: "s" };

  XLSX.utils.book_append_sheet(wb, ws1, "Customer Details");

  // ── Sheet 2: Collection History ────────────────────────────────────────────
  const histHeader = [
    ["Date", "EMI Days", "Amount (₹)", "Status", "Payment Mode", "Notes"]
  ];

  const histRows = [...h]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((r) => [
      r.date,
      r.emis,
      r.amount,
      r.status,
      r.paymentMode || "Cash",
      r.notes       || "",
    ]);

  // Summary row at bottom
  const totalPaid   = h.filter((r) => r.status === "Paid").reduce((s, r) => s + r.amount, 0);
  const totalMissed = h.filter((r) => r.status === "Missed").length;

  const histData = [
    ...histHeader,
    ...histRows,
    [],
    ["TOTAL", "", totalPaid, "", "", ""],
    ["Paid Days",   h.filter((r) => r.status === "Paid").length,   "", "", "", ""],
    ["Missed Days", totalMissed, "", "", "", ""],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(histData);

  // Column widths
  ws2["!cols"] = [
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
    { wch: 10 },
    { wch: 16 },
    { wch: 24 },
  ];

  XLSX.utils.book_append_sheet(wb, ws2, "Collection History");

  // ── Save file ──────────────────────────────────────────────────────────────
  const fileName = `DhanKist_${customer.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
}