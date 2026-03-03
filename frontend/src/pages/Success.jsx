import { Link, Navigate, useLocation } from "react-router-dom";
import { FiCheckCircle, FiCopy, FiArrowRight } from "react-icons/fi";

import { ROUTES } from "../constants";
import { useToast } from "../context/toastContext";

const Success = () => {
  const { state } = useLocation();
  const { showToast } = useToast();
  const orderId = state?.orderId;
  const trackingCode = state?.trackingCode;

  if (!orderId) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied!`, "success");
    } catch {
      showToast("Could not copy", "error");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center sm:py-24">
      <div className="animate-fade-in-up">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <FiCheckCircle className="h-10 w-10 text-green-500" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          Order Confirmed!
        </h1>

        <p className="mb-8 text-sm text-gray-500 sm:text-base">
          Thank you for your order. We&apos;ll start preparing it right away.
        </p>

        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-4">
            <div className="text-left">
              <p className="text-xs text-gray-400">Order ID</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-gray-800">
                #{orderId}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(String(orderId), "Order ID")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
              aria-label="Copy order ID"
            >
              <FiCopy className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-orange-50 px-5 py-4">
            <div className="text-left">
              <p className="text-xs text-orange-600">Tracking Code</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-orange-800">
                {trackingCode || "N/A"}
              </p>
            </div>
            {trackingCode && (
              <button
                type="button"
                onClick={() => copyToClipboard(trackingCode, "Tracking code")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-100 hover:text-orange-600"
                aria-label="Copy tracking code"
              >
                <FiCopy className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <p className="mb-8 text-xs text-gray-400">
          Save these details to track your order status in real time.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to={ROUTES.TRACK_ORDER}
            state={{ orderId, trackingCode }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
          >
            Track This Order
            <FiArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to={ROUTES.MENU}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
