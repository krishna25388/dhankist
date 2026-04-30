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
  updateCustomer,
  updateCollection,
} from "../utils/api";

export default function useStore(token) {
  const [customers, setCustomers] = useState([]);
  const [history,   setHistory]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // ── Only load when token exists ───────────────────────────────────────────
  useEffect(() => {
    if (token) {
      loadCustomers();
    } else {
      setCustomers([]);
      setHistory({});
      setLoading(false);
    }
  }, [token]);

  // ── Load all customers ────────────────────────────────────────────────────
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res    = await getCustomers();
      const mapped = res.data.map((c) => ({ ...c, id: c._id }));
      setCustomers(mapped);
      await loadAllCollections(mapped);
    } catch (err) {
      console.error("❌ loadCustomers failed:", err);
      setError("Failed to load. Check server is running.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Load collections for all customers ───────────────────────────────────
  const loadAllCollections = async (customerList) => {
    try {
      const historyMap = {};
      await Promise.all(
        customerList.map(async (c) => {
          const res          = await getCustomerCollections(c._id);
          historyMap[c._id]  = res.data.map((r) => ({ ...r, id: r._id }));
        })
      );
      setHistory(historyMap);
    } catch (err) {
      console.error("❌ loadAllCollections failed:", err);
    }
  };

  // ── Add new customer ──────────────────────────────────────────────────────
  async function addCustomer(form) {
    try {
      const payload = {
        name:               form.name.trim(),
        initials:           getInitials(form.name),
        color:              AVATAR_COLORS[customers.length % AVATAR_COLORS.length],
        phone:              form.phone,
        loanAmount:         Number(form.loanAmount),
        remainingPrincipal: Number(form.loanAmount),
        interest:           Number(form.interest),
        duration:           Number(form.duration),
        startDate:          form.startDate,
        frequency:          form.frequency   || "daily",
        paymentType:        form.paymentType || "fixed_emi",
        status:             "Active",
      };

      const res         = await createCustomer(payload);
      const newCustomer = { ...res.data, id: res.data._id };

      setCustomers((cs) => [newCustomer, ...cs]);
      setHistory((h)   => ({ ...h, [newCustomer._id]: [] }));

      return newCustomer;
    } catch (err) {
      console.error("❌ addCustomer failed:", err);
      throw err;
    }
  }

  // ── Add collection ────────────────────────────────────────────────────────
  async function addCollection(customerId, record) {
    try {
      const payload = {
        customerId,
        date:               record.date,
        emis:               record.emis               || 0,
        amount:             record.amount             || 0,
        status:             record.status             || "Paid",
        paymentMode:        record.paymentMode        || "Cash",
        notes:              record.notes              || "",
        interestPaid:       record.interestPaid       || 0,
        principalPaid:      record.principalPaid      || 0,
        remainingPrincipal: record.remainingPrincipal || 0,
      };

      const res   = await createCollection(payload);
      const saved = { ...res.data, id: res.data._id };

      // ── Update local history ──
      setHistory((h) => {
        const arr = [...(h[customerId] || [])];
        const idx = arr.findIndex((r) => r.date === record.date);
        if (idx >= 0) {
          arr[idx] = {
            ...arr[idx],
            emis:               arr[idx].emis   + record.emis,
            amount:             arr[idx].amount + record.amount,
            interestPaid:       (arr[idx].interestPaid  || 0) + (record.interestPaid  || 0),
            principalPaid:      (arr[idx].principalPaid || 0) + (record.principalPaid || 0),
            remainingPrincipal: record.remainingPrincipal,
            status:             record.amount > 0 ? "Paid" : arr[idx].status,
          };
        } else {
          arr.unshift(saved);
        }
        return { ...h, [customerId]: arr };
      });

      // ── Update remaining principal in customer locally ──
      if (record.principalPaid > 0) {
        setCustomers((cs) =>
          cs.map((c) =>
            (c._id === customerId || c.id === customerId)
              ? {
                  ...c,
                  remainingPrincipal: record.remainingPrincipal,
                  status: record.remainingPrincipal === 0 ? "Completed" : c.status,
                }
              : c
          )
        );
      }

      return saved;
    } catch (err) {
      console.error("❌ addCollection failed:", err);
      throw err;
    }
  }

  // ── Update collection record locally ─────────────────────────────────────
  function updateHistoryRecord(customerId, recordId, updated) {
    setHistory((h) => {
      const arr = [...(h[customerId] || [])];
      const idx = arr.findIndex((r) => (r._id || r.id) === recordId);
      if (idx >= 0) arr[idx] = { ...arr[idx], ...updated };
      return { ...h, [customerId]: arr };
    });
  }

  // ── Update customer record locally ────────────────────────────────────────
  function updateCustomerRecord(updated) {
    setCustomers((cs) =>
      cs.map((c) =>
        (c._id === updated._id || c.id === updated.id)
          ? { ...c, ...updated }
          : c
      )
    );
  }

  // ── Soft delete customer ──────────────────────────────────────────────────
  function deleteCustomer(customerId) {
    setCustomers((cs) =>
      cs.filter((c) => (c._id || c.id) !== customerId)
    );
  }

  // ── Complete customer ─────────────────────────────────────────────────────
  async function completeCustomer(customerId) {
    try {
      await updateCustomerStatus(customerId, "Completed");
      setCustomers((cs) =>
        cs.map((c) =>
          (c._id === customerId || c.id === customerId)
            ? { ...c, status: "Completed" }
            : c
        )
      );
    } catch (err) {
      console.error("❌ completeCustomer failed:", err);
      throw err;
    }
  }

  // ── Refresh all data ──────────────────────────────────────────────────────
  async function refresh() {
    await loadCustomers();
  }

  return {
    customers,
    history,
    loading,
    error,
    addCustomer,
    addCollection,
    updateHistoryRecord,
    updateCustomerRecord,
    deleteCustomer,
    completeCustomer,
    refresh,
  };
}