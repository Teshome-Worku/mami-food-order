/** API service - single place for backend calls */

import {
  API_ENDPOINTS,
  STORAGE_KEYS,
} from "../constants";

const parseJsonSafe = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

async function fetchJson(url, options = {}) {
  const hasBody = options.body !== undefined && options.body !== null;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
}

const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  return fetchJson(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

const toOrderTrackingUrl = (orderId, trackingCode) => {
  const params = new URLSearchParams({ code: trackingCode });
  return `${API_ENDPOINTS.ORDER_TRACKING}/${encodeURIComponent(orderId)}?${params.toString()}`;
};

export const api = {
  // --- Public ---
  getMenu: () => fetchJson(API_ENDPOINTS.MENU),

  createOrder: (order) =>
    fetchJson(API_ENDPOINTS.ORDERS, {
      method: "POST",
      body: JSON.stringify(order),
    }),

  trackOrder: (orderId, trackingCode) =>
    fetchJson(toOrderTrackingUrl(orderId, trackingCode)),

  lookupOrdersByPhone: (phone) =>
    fetchJson(`${API_ENDPOINTS.ORDER_LOOKUP}?phone=${encodeURIComponent(phone)}`),

  getActiveAnnouncements: () =>
    fetchJson(API_ENDPOINTS.ANNOUNCEMENTS_ACTIVE),

  // --- Admin: Orders ---
  getOrders: () => fetchWithAuth(API_ENDPOINTS.ORDERS),

  updateOrderStatus: (orderId, status) =>
    fetchWithAuth(`${API_ENDPOINTS.ORDERS}/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  deleteOrder: (orderId) =>
    fetchWithAuth(`${API_ENDPOINTS.ORDERS}/${orderId}`, {
      method: "DELETE",
    }),

  // --- Admin: Menu ---
  getMenuAdmin: () => fetchWithAuth(API_ENDPOINTS.MENU_ADMIN),

  addMenuItem: (item) =>
    fetchWithAuth(API_ENDPOINTS.MENU, {
      method: "POST",
      body: JSON.stringify(item),
    }),

  updateMenuItem: (id, updates) =>
    fetchWithAuth(`${API_ENDPOINTS.MENU}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deleteMenuItem: (id) =>
    fetchWithAuth(`${API_ENDPOINTS.MENU}/${id}`, {
      method: "DELETE",
    }),

  // --- Admin: Announcements ---
  getAnnouncements: () => fetchWithAuth(API_ENDPOINTS.ANNOUNCEMENTS),

  createAnnouncement: (data) =>
    fetchWithAuth(API_ENDPOINTS.ANNOUNCEMENTS, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateAnnouncement: (id, updates) =>
    fetchWithAuth(`${API_ENDPOINTS.ANNOUNCEMENTS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deleteAnnouncement: (id) =>
    fetchWithAuth(`${API_ENDPOINTS.ANNOUNCEMENTS}/${id}`, {
      method: "DELETE",
    }),

  // --- Admin: Auth ---
  adminLogin: (email, password) =>
    fetchJson(API_ENDPOINTS.ADMIN_LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};
