import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiTruck,
  FiPhone,
} from "react-icons/fi";

import Spinner from "../components/Spinner";
import { ORDER_STATUSES, ROUTES } from "../constants";
import { api } from "../services/api";
import { formatCurrency, formatDateTime } from "../utils/formatters";

const statusIcons = {
  pending: FiClock,
  preparing: FiPackage,
  ready: FiCheckCircle,
  delivered: FiTruck,
};

const statusColors = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  preparing: "text-blue-600 bg-blue-50 border-blue-200",
  ready: "text-green-600 bg-green-50 border-green-200",
  delivered: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

const TrackOrder = () => {
  const location = useLocation();

  const [tab, setTab] = useState(
    location.state?.orderId ? "tracking" : "tracking"
  );
  const [orderId, setOrderId] = useState(
    location.state?.orderId ? String(location.state.orderId) : ""
  );
  const [trackingCode, setTrackingCode] = useState(
    location.state?.trackingCode ? String(location.state.trackingCode) : ""
  );
  const [phone, setPhone] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [phoneLookupResults, setPhoneLookupResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const statusIndex = useMemo(
    () =>
      ORDER_STATUSES.findIndex(
        (status) => status.value === trackedOrder?.status
      ),
    [trackedOrder?.status]
  );

  const switchTab = (newTab) => {
    setTab(newTab);
    setError("");
    setTrackedOrder(null);
    setPhoneLookupResults(null);
  };

  const runTrackingLookup = async () => {
    const trimmedOrderId = orderId.trim();
    const trimmedCode = trackingCode.trim().toUpperCase();

    if (!trimmedOrderId || !trimmedCode) {
      setError("Order ID and tracking code are required");
      setTrackedOrder(null);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await api.trackOrder(trimmedOrderId, trimmedCode);
      setTrackedOrder(data?.order ?? null);
      setTrackingCode(trimmedCode);
    } catch (err) {
      setTrackedOrder(null);
      setError(err instanceof Error ? err.message : "Failed to track order");
    } finally {
      setIsLoading(false);
    }
  };

  const runPhoneLookup = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError("Please enter your phone number");
      return;
    }

    setIsLoading(true);
    setError("");
    setPhoneLookupResults(null);

    try {
      const data = await api.lookupOrdersByPhone(trimmedPhone);
      const results = data?.orders || [];
      setPhoneLookupResults(results);
      if (results.length === 0) {
        setError("No orders found for this phone number");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackFromLookup = (order) => {
    setOrderId(String(order.id));
    setTrackingCode(order.trackingCode);
    setTab("tracking");
    setPhoneLookupResults(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (tab === "tracking") {
      await runTrackingLookup();
    } else {
      await runPhoneLookup();
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Track Your Order
        </h1>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Track by order ID or look up orders using your phone number.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => switchTab("tracking")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            tab === "tracking"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiSearch className="h-4 w-4" />
          Track by ID
        </button>
        <button
          type="button"
          onClick={() => switchTab("phone")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            tab === "phone"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiPhone className="h-4 w-4" />
          Forgot Order ID?
        </button>
      </div>

      {/* Track by ID Form */}
      {tab === "tracking" && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6"
        >
          <label className="space-y-1.5 text-sm font-medium text-gray-700">
            <span>Order ID</span>
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="e.g. 1739958800000"
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium text-gray-700">
            <span>Tracking Code</span>
            <input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm uppercase transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="e.g. 9F4QK2"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FiSearch className="h-4 w-4" />
            {isLoading ? "Checking..." : "Track"}
          </button>
        </form>
      )}

      {/* Phone Lookup Form */}
      {tab === "phone" && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6"
        >
          <p className="mb-4 text-sm text-gray-500">
            Enter the phone number you used when placing your order and we&apos;ll find all your orders.
          </p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <FiPhone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="09XXXXXXXX"
                type="tel"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiSearch className="h-4 w-4" />
              {isLoading ? "Searching..." : "Find Orders"}
            </button>
          </div>
        </form>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="mt-8 flex items-center justify-center gap-3 text-gray-500">
          <Spinner />
          <p className="text-sm">Looking up your order...</p>
        </div>
      )}

      {/* Phone Lookup Results */}
      {phoneLookupResults && phoneLookupResults.length > 0 && (
        <div className="animate-fade-in-up mt-6 space-y-3">
          <h2 className="text-lg font-bold text-gray-900">
            Found {phoneLookupResults.length} order{phoneLookupResults.length !== 1 ? "s" : ""}
          </h2>
          {phoneLookupResults.map((order) => {
            const StatusIcon = statusIcons[order.status] || FiClock;
            return (
              <div
                key={order.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      statusColors[order.status]?.split(" ").slice(1, 2).join(" ") || "bg-gray-50"
                    }`}
                  >
                    <StatusIcon
                      className={`h-5 w-5 ${
                        statusColors[order.status]?.split(" ")[0] || "text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-900">
                      #{order.id}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDateTime(order.createdAt)} &middot;{" "}
                      {order.itemCount} item{order.itemCount !== 1 ? "s" : ""} &middot;{" "}
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      statusColors[order.status] || "text-gray-500 bg-gray-50 border-gray-200"
                    }`}
                  >
                    {order.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTrackFromLookup(order)}
                    className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600"
                  >
                    Track Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tracked Order Detail */}
      {trackedOrder && (
        <div className="animate-fade-in-up mt-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400">Order</p>
              <p className="font-mono text-lg font-bold text-gray-900">
                #{trackedOrder.id}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold capitalize ${
                  statusColors[trackedOrder.status] || "text-gray-600 bg-gray-50 border-gray-200"
                }`}
              >
                {(() => {
                  const Icon = statusIcons[trackedOrder.status] || FiClock;
                  return <Icon className="h-3.5 w-3.5" />;
                })()}
                {trackedOrder.status}
              </span>
              <p className="mt-1 text-xs text-gray-400">
                Updated {formatDateTime(trackedOrder.updatedAt)}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="relative">
            <div className="absolute left-0 right-0 top-5 hidden h-0.5 bg-gray-200 sm:block" />
            <div
              className="absolute left-0 top-5 hidden h-0.5 bg-orange-500 transition-all duration-500 sm:block"
              style={{
                width:
                  statusIndex >= 0
                    ? `${(statusIndex / (ORDER_STATUSES.length - 1)) * 100}%`
                    : "0%",
              }}
            />
            <ul className="relative grid gap-3 sm:grid-cols-4 sm:gap-2">
              {ORDER_STATUSES.map((status, index) => {
                const isReached = statusIndex >= 0 && index <= statusIndex;
                const isCurrent = status.value === trackedOrder.status;
                const Icon = statusIcons[status.value] || FiClock;

                return (
                  <li key={status.value} className="flex items-center gap-3 sm:flex-col sm:text-center">
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isReached
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-gray-200 bg-white text-gray-400"
                      } ${isCurrent ? "ring-4 ring-orange-100" : ""}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="sm:mt-2">
                      <p
                        className={`text-sm font-semibold ${
                          isReached ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {status.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-orange-500">Current</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Items */}
          <div>
            <h2 className="mb-3 text-sm font-bold text-gray-900">Order Items</h2>
            <ul className="divide-y divide-gray-100 rounded-xl bg-gray-50 px-4">
              {(trackedOrder.items || []).map((item, index) => (
                <li
                  key={`${item.id ?? item.name}-${index}`}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-gray-700">
                    {item.name}{" "}
                    <span className="text-gray-400">x{item.qty}</span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-orange-600">
              {formatCurrency(trackedOrder.total)}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runTrackingLookup}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <FiRefreshCw className="h-4 w-4" />
              Refresh Status
            </button>
            <Link
              to={ROUTES.MENU}
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Order Again
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
