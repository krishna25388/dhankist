// ─── DhanKist Store — MongoDB version ────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { AVATAR_COLORS }                    from "../utils/theme";
import { getInitials }                      from "../utils/helpers";
import {
  getCustomers,
  createCustomer,
  getCustomerCollections,
  createCollection,
  updateCustomerStatus,
} from "../utils/api";

export default function useStore() {
  const [customers, setCustomers] = useState([]);
  const [history,   setHistory]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Loading customers from MongoDB...");
      const res = await getCustomers();
      console.log("✅ Customers loaded:", res.data);

      const mapped = res.data.map((c) => ({ ...c, id: c._id }));
      setCustomers(mapped);
      await loadAllCollections(mapped);
    } catch (err) {
      console.error("❌ loadCustomers failed:", err);
      setError("Failed to load. Check server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllCollections = async (customerList) => {
    try {
      const historyMap = {};
      await Promise.all(
        customerList.map(async (c) => {
          const res = await getCustomerCollections(c._id);
          historyMap[c._id] = res.data.map((r) => ({ ...r, id: r._id }));
        })
      );
      setHistory(historyMap);
    } catch (err) {
      console.error("❌ loadAllCollections failed:", err);
    }
  };

  async function addCustomer(form) {
    try {
      console.log("1️⃣ addCustomer called");

      const payload = {
        name:       form.name.trim(),
        initials:   getInitials(form.name),
        color:      AVATAR_COLORS[customers.length % AVATAR_COLORS.length],
        phone:      form.phone,
        loanAmount: Number(form.loanAmount),
        interest:   Number(form.interest),
        duration:   Number(form.duration),
        startDate:  form.startDate,
        status:     "Active",
      };

      console.log("2️⃣ Sending to API:", payload);
      const res = await createCustomer(payload);
      console.log("3️⃣ Saved to MongoDB:", res.data);

      const newCustomer = { ...res.data, id: res.data._id };
      setCustomers((cs) => [newCustomer, ...cs]);
      setHistory((h)  => ({ ...h, [newCustomer._id]: [] }));

      return newCustomer;
    } catch (err) {
      console.error("❌ addCustomer failed:", err);
      throw err;
    }
  }

  async function addCollection(customerId, record) {
    try {
      console.log("1️⃣ addCollection called:", record);

      const payload = {
        customerId,
        date:        record.date,
        emis:        record.emis,
        amount:      record.amount,
        status:      record.status,
        paymentMode: record.paymentMode || "Cash",
        notes:       record.notes       || "",
      };

      console.log("2️⃣ Sending collection to API:", payload);
      const res = await createCollection(payload);
      console.log("3️⃣ Collection saved:", res.data);

      const saved = { ...res.data, id: res.data._id };
      setHistory((h) => {
        const arr = [...(h[customerId] || [])];
        const idx = arr.findIndex((r) => r.date === record.date);
        if (idx >= 0) {
          arr[idx] = {
            ...arr[idx],
            emis:   arr[idx].emis   + record.emis,
            amount: arr[idx].amount + record.amount,
            status: record.amount > 0 ? "Paid" : arr[idx].status,
          };
        } else {
          arr.unshift(saved);
        }
        return { ...h, [customerId]: arr };
      });

      return saved;
    } catch (err) {
      console.error("❌ addCollection failed:", err);
      throw err;
    }
  }

  async function completeCustomer(customerId) {
    try {
      await updateCustomerStatus(customerId, "Completed");
      setCustomers((cs) =>
        cs.map((c) =>
          c._id === customerId || c.id === customerId
            ? { ...c, status: "Completed" }
            : c
        )
      );
    } catch (err) {
      console.error("❌ completeCustomer failed:", err);
      throw err;
    }
  }

  async function refresh() {
    await loadCustomers();
  }

  // ─── Update a collection record locally ───────────────────────────────────
function updateHistoryRecord(customerId, recordId, updated) {
  setHistory((h) => {
    const arr = [...(h[customerId] || [])];
    const idx = arr.findIndex((r) => (r._id || r.id) === recordId);
    if (idx >= 0) arr[idx] = { ...arr[idx], ...updated };
    return { ...h, [customerId]: arr };
  });
}

function updateCustomerRecord(updated) {
  setCustomers((cs) =>
    cs.map((c) =>
      (c._id === updated._id || c.id === updated.id)
        ? { ...c, ...updated }
        : c
    )
  );
}

  return {
    customers,
    history,
    loading,
    error,
    addCustomer,
    addCollection,
    completeCustomer,
    updateHistoryRecord,
    updateCustomerRecord,
    refresh,
  };
}