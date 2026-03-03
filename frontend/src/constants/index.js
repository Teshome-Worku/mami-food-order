/** Application constants - single source for currency, routes, and config */

export const BRAND_NAME = "Mami Food";
export const CURRENCY = "Birr";
export const DELIVERY_FEE = 50;
export const FREE_DELIVERY_THRESHOLD = 500;

export const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
];

export const PROMO_CODES = {
  MAMI10: { discount: 0.1, label: "10% off" },
  FIRST50: { discount: 0, flat: 50, label: "50 Birr off" },
  FREEDEL: { discount: 0, freeDelivery: true, label: "Free delivery" },
};

export const ROUTES = {
  HOME: "/",
  MENU: "/menu",
  CART: "/cart",
  SUCCESS: "/success",
  TRACK_ORDER: "/track-order",
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_ORDERS: "/admin/orders",
};

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const STORAGE_KEYS = {
  ADMIN_TOKEN: "admin_token",
  CART_ITEMS: "cart_items",
};

export const API_ENDPOINTS = {
  MENU: `${API_BASE_URL}/api/menu`,
  MENU_ADMIN: `${API_BASE_URL}/api/menu/admin`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDER_TRACKING: `${API_BASE_URL}/api/orders/track`,
  ORDER_LOOKUP: `${API_BASE_URL}/api/orders/lookup`,
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ANNOUNCEMENTS: `${API_BASE_URL}/api/announcements`,
  ANNOUNCEMENTS_ACTIVE: `${API_BASE_URL}/api/announcements/active`,
};
