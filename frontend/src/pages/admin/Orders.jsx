import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiRefreshCw,
  FiTrash2,
  FiClock,
  FiPackage,
  FiCheckCircle,
  FiTruck,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";

import Spinner from "../../components/Spinner";
import {
  ORDER_STATUSES,
  ROUTES,
  STORAGE_KEYS,
} from "../../constants";
import { api } from "../../services/api";
import { useToast } from "../../context/toastContext";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const STATUS_CONFIG = {
  pending: { bg: "bg-amber-50 border-amber-200 text-amber-700", icon: FiClock },
  preparing: { bg: "bg-blue-50 border-blue-200 text-blue-700", icon: FiPackage },
  ready: { bg: "bg-green-50 border-green-200 text-green-700", icon: FiCheckCircle },
  delivered: { bg: "bg-gray-50 border-gray-200 text-gray-500", icon: FiTruck },
};

const isAuthError = (message) =>
  typeof message === "string" &&
  (message.includes("401") ||
    message.includes("403") ||
    message.toLowerCase().includes("token"));

const normalizeOrdersResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  return [];
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getOrders();
      setOrders(normalizeOrdersResponse(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch orders";

      if (isAuthError(message)) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        navigate(ROUTES.ADMIN_LOGIN, { replace: true });
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    if (!token) {
      navigate(ROUTES.ADMIN_LOGIN, { replace: true });
      return;
    }

    loadOrders();
  }, [navigate, loadOrders]);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const preparing = orders.filter((o) => o.status === "preparing").length;
    const ready = orders.filter((o) => o.status === "ready").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const revenue = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + (o.total || 0), 0);
    return { total: orders.length, pending, preparing, ready, delivered, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          String(o.id).includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.customer?.phone?.includes(q) ||
          o.trackingCode?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, statusFilter, searchQuery]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);

    try {
      const data = await api.updateOrderStatus(orderId, newStatus);
      const updatedOrder = data?.order;

      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? updatedOrder : order))
        );
        showToast(`Order updated to ${newStatus}`, "success");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await api.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast("Order deleted", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-gray-500">
        <Spinner size="lg" className="text-orange-500" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg space-y-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={loadOrders}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{stats.total} total orders</p>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <FiClock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-600">
            <FiPackage className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Preparing</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-700">{stats.preparing}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-600">
            <FiCheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Ready</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-700">{stats.ready}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <FiTruck className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Delivered</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-700">{stats.delivered}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-orange-100 bg-orange-50 p-4 sm:col-span-1">
          <div className="flex items-center gap-2 text-orange-600">
            <FiShoppingBag className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Revenue</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-orange-700">
            {formatCurrency(stats.revenue)}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, phone, tracking code..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <FiShoppingBag className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">
            {orders.length === 0
              ? "No orders yet"
              : "No orders match your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-sm sm:p-5"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.bg}`}
                    >
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-gray-900">
                        #{order.id}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {formatDateTime(order.createdAt)}
                        {order.trackingCode && (
                          <>
                            {" "}&middot; <span className="font-mono">{order.trackingCode}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${config.bg}`}
                    >
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingOrderId === order.id}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    {updatingOrderId === order.id && (
                      <Spinner size="sm" className="text-orange-500" />
                    )}
                  </div>
                </div>

                {/* Customer + Items */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Customer
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customer?.name || "-"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customer?.phone || "-"}
                    </p>
                    {order.customer?.address && (
                      <p className="mt-1 text-xs text-gray-500">
                        {order.customer.address}
                      </p>
                    )}
                    {order.customer?.notes && (
                      <p className="mt-1 rounded-md bg-amber-50 p-1.5 text-xs text-amber-700">
                        Note: {order.customer.notes}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Items
                    </p>
                    <ul className="space-y-1">
                      {(order.items || []).map((item, idx) => (
                        <li
                          key={`${item.id ?? item.name}-${idx}`}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-gray-700">
                            {item.name} <span className="text-gray-400">x{item.qty}</span>
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.price * item.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-sm font-bold">
                      <span className="text-gray-700">Total</span>
                      <span className="text-orange-600">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(order.id)}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <FiTrash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
