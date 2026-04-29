// const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// async function request(endpoint, options = {}) {
//   try {
//     console.log("📡 Calling:", `${BASE_URL}${endpoint}`);
//     const res = await fetch(`${BASE_URL}${endpoint}`, {
//       headers: { "Content-Type": "application/json" },
//       ...options,
//     });
//     const data = await res.json();
//     if (!data.success) throw new Error(data.error || "Something went wrong");
//     return data;
//   } catch (err) {
//     console.error(`❌ API Error [${endpoint}]:`, err.message);
//     throw err;
//   }
// }

// // ─── CUSTOMERS ────────────────────────────────────────────────────────────────

// /** Get all customers */
// export async function getCustomers() {
//   return request("/customers");
// }

// /** Get single customer by ID */
// export async function getCustomer(id) {
//   return request(`/customers/${id}`);
// }

// /** Add new customer */
// export async function createCustomer(data) {
//   return request("/customers", {
//     method: "POST",
//     body:   JSON.stringify(data),
//   });
// }

// /** Update customer */
// export async function updateCustomer(id, data) {
//   return request(`/customers/${id}`, {
//     method: "PUT",
//     body:   JSON.stringify(data),
//   });
// }

// /** Update customer status only */
// export async function updateCustomerStatus(id, status) {
//   return request(`/customers/${id}/status`, {
//     method: "PATCH",
//     body:   JSON.stringify({ status }),
//   });
// }

// /** Delete customer */
// export async function deleteCustomer(id) {
//   return request(`/customers/${id}`, {
//     method: "DELETE",
//   });
// }

// // ─── COLLECTIONS ──────────────────────────────────────────────────────────────

// /** Get all collections — optional filters */
// export async function getCollections({ date, customerId, status } = {}) {
//   const params = new URLSearchParams();
//   if (date)       params.append("date",       date);
//   if (customerId) params.append("customerId", customerId);
//   if (status)     params.append("status",     status);
//   const query = params.toString() ? `?${params.toString()}` : "";
//   return request(`/collections${query}`);
// }

// /** Get all collections for one customer */
// export async function getCustomerCollections(customerId) {
//   return request(`/collections/customer/${customerId}`);
// }

// /** Get all collections for a specific date */
// export async function getCollectionsByDate(date) {
//   return request(`/collections/date/${date}`);
// }

// /** Get today's summary */
// export async function getTodaySummary() {
//   return request("/collections/summary/today");
// }

// /** Add new collection */
// export async function createCollection(data) {
//   return request("/collections", {
//     method: "POST",
//     body:   JSON.stringify(data),
//   });
// }

// /** Update a collection */
// export async function updateCollection(id, data) {
//   return request(`/collections/${id}`, {
//     method: "PUT",
//     body:   JSON.stringify(data),
//   });
// }

// /** Delete a collection */
// export async function deleteCollection(id) {
//   return request(`/collections/${id}`, {
//     method: "DELETE",
//   });
// }

// ─── DhanKist API Calls ───────────────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ─── Get token from localStorage ─────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("dhankist_token");
}

// ─── Helper — fetch wrapper with auth token ───────────────────────────────────
async function request(endpoint, options = {}) {
  try {
    const token = getToken();

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type":  "application/json",
        // ── Send token with every request ──
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      ...options,
    });

    const data = await res.json();

    // ── Token expired — force logout ──
    if (res.status === 401) {
      localStorage.removeItem("dhankist_token");
      localStorage.removeItem("dhankist_user");
      window.location.reload();
      return;
    }

    if (!data.success) throw new Error(data.error || "Something went wrong");
    return data;

  } catch (err) {
    console.error(`❌ API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

/** Login with mobile + PIN */
export async function login(mobile, pin) {
  return request("/auth/login", {
    method: "POST",
    body:   JSON.stringify({ mobile, pin }),
  });
}

/** Verify token still valid */
export async function verifyToken() {
  return request("/auth/verify");
}

/** Logout */
export async function logout() {
  localStorage.removeItem("dhankist_token");
  localStorage.removeItem("dhankist_user");
}

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────

/** Get all customers */
export async function getCustomers() {
  return request("/customers");
}

/** Get single customer by ID */
export async function getCustomer(id) {
  return request(`/customers/${id}`);
}

/** Add new customer */
export async function createCustomer(data) {
  return request("/customers", {
    method: "POST",
    body:   JSON.stringify(data),
  });
}

/** Update customer */
export async function updateCustomer(id, data) {
  return request(`/customers/${id}`, {
    method: "PUT",
    body:   JSON.stringify(data),
  });
}

/** Update customer status only */
export async function updateCustomerStatus(id, status) {
  return request(`/customers/${id}/status`, {
    method: "PATCH",
    body:   JSON.stringify({ status }),
  });
}

/** Delete customer */
export async function deleteCustomer(id) {
  return request(`/customers/${id}`, {
    method: "DELETE",
  });
}

// ─── COLLECTIONS ──────────────────────────────────────────────────────────────

/** Get all collections — optional filters */
export async function getCollections({ date, customerId, status } = {}) {
  const params = new URLSearchParams();
  if (date)       params.append("date",       date);
  if (customerId) params.append("customerId", customerId);
  if (status)     params.append("status",     status);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/collections${query}`);
}

/** Get all collections for one customer */
export async function getCustomerCollections(customerId) {
  return request(`/collections/customer/${customerId}`);
}

/** Get all collections for a specific date */
export async function getCollectionsByDate(date) {
  return request(`/collections/date/${date}`);
}

/** Get today's summary */
export async function getTodaySummary() {
  return request("/collections/summary/today");
}

/** Add new collection */
export async function createCollection(data) {
  return request("/collections", {
    method: "POST",
    body:   JSON.stringify(data),
  });
}

/** Update a collection */
export async function updateCollection(id, data) {
  return request(`/collections/${id}`, {
    method: "PUT",
    body:   JSON.stringify(data),
  });
}

/** Delete a collection */
export async function deleteCollection(id) {
  return request(`/collections/${id}`, {
    method: "DELETE",
  });
}