import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2, FiTag, FiX, FiTruck } from "react-icons/fi";

import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  PROMO_CODES,
  ROUTES,
} from "../constants";
import { useCart } from "../context/cartContext";
import { useToast } from "../context/toastContext";
import { formatCurrency } from "../utils/formatters";

const REQUIRED_FIELDS = ["name", "phone", "address"];

const Cart = ({ onPlaceOrder }) => {
  const { cartItems, cartTotal, cartCount, clearCart, removeFromCart, updateQty } =
    useCart();
  const { showToast } = useToast();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const updateCustomerField = (field, value) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const pricing = useMemo(() => {
    const subtotal = cartTotal;
    const qualifiesFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
    let deliveryFee = qualifiesFreeDelivery ? 0 : DELIVERY_FEE;
    let discount = 0;

    if (appliedPromo) {
      const promo = PROMO_CODES[appliedPromo];
      if (promo) {
        if (promo.freeDelivery) {
          deliveryFee = 0;
        }
        if (promo.discount > 0) {
          discount = Math.round(subtotal * promo.discount);
        }
        if (promo.flat > 0) {
          discount = promo.flat;
        }
      }
    }

    const total = Math.max(0, subtotal - discount + deliveryFee);
    return { subtotal, deliveryFee, discount, total, qualifiesFreeDelivery };
  }, [cartTotal, appliedPromo]);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      showToast(`Promo "${code}" applied! ${PROMO_CODES[code].label}`, "success");
    } else {
      showToast("Invalid promo code", "error");
    }
    setPromoCode("");
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    showToast("Promo code removed", "info");
  };

  const validateForm = () => {
    const nextErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!customer[field].trim()) {
        nextErrors[field] = `${field[0].toUpperCase()}${field.slice(1)} is required`;
      }
    });

    if (customer.phone.trim() && !/^(\+?251|0)?[79]\d{8}$/.test(customer.phone.replace(/\s/g, ""))) {
      nextErrors.phone = "Enter a valid Ethiopian phone number";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      showToast("Please fix the errors below", "error");
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsPlacingOrder(true);

    const trimmedNotes = customer.notes.trim();
    const order = {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        ...(trimmedNotes && { notes: trimmedNotes }),
      },
      items: cartItems,
      subtotal: pricing.subtotal,
      deliveryFee: pricing.deliveryFee,
      discount: pricing.discount,
      promoCode: appliedPromo || undefined,
      total: pricing.total,
    };

    try {
      await onPlaceOrder?.(order);
      clearCart();
      setCustomer({ name: "", phone: "", address: "", notes: "" });
      setErrors({});
      setAppliedPromo(null);
      showToast("Order placed successfully!", "success");
    } catch {
      showToast("Something went wrong. Try again.", "error");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-5xl">
          🛒
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-500">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          to={ROUTES.MENU}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-gray-500">
          {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Order Items - Left Column */}
        <div className="space-y-6 lg:col-span-3">
          {/* Cart Items */}
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Your Order</h2>
            <ul className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400 sm:text-sm">
                      {formatCurrency(item.price)} each
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                        aria-label="Increase quantity"
                      >
                        <FiPlus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.price * item.qty)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        removeFromCart(item.id);
                        showToast(`${item.name} removed`, "info");
                      }}
                      className="flex items-center gap-1 text-xs text-red-400 transition hover:text-red-600"
                      aria-label={`Remove ${item.name}`}
                    >
                      <FiTrash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Promo Code */}
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
              <FiTag className="h-4 w-4 text-orange-500" />
              Promo Code
            </h2>
            {appliedPromo ? (
              <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-green-700">
                    {appliedPromo}
                  </p>
                  <p className="text-xs text-green-600">
                    {PROMO_CODES[appliedPromo]?.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-green-600 transition hover:bg-green-100"
                  aria-label="Remove promo"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                  placeholder="Enter code"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="shrink-0 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Delivery Details + Summary */}
        <div className="space-y-6 lg:col-span-2">
          {/* Delivery Form */}
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-4 shadow-sm sm:p-6"
          >
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Delivery Details
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => updateCustomerField("name", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => updateCustomerField("phone", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                  placeholder="09XXXXXXXX"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customer.address}
                  onChange={(e) => updateCustomerField("address", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                    errors.address
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                  placeholder="Your address or location"
                />
                {errors.address && (
                  <p className="text-xs text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Special Instructions
                </label>
                <textarea
                  value={customer.notes}
                  onChange={(e) => updateCustomerField("notes", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="Allergies, preferences, etc."
                />
              </div>
            </div>
          </form>

          {/* Order Summary */}
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartCount} items)</span>
                <span>{formatCurrency(pricing.subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <FiTruck className="h-3.5 w-3.5" />
                  Delivery Fee
                </span>
                {pricing.deliveryFee === 0 ? (
                  <span className="font-medium text-green-600">Free</span>
                ) : (
                  <span>{formatCurrency(pricing.deliveryFee)}</span>
                )}
              </div>

              {!pricing.qualifiesFreeDelivery && !appliedPromo && (
                <p className="text-xs text-gray-400">
                  Free delivery on orders over {formatCurrency(FREE_DELIVERY_THRESHOLD)}
                </p>
              )}

              {pricing.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(pricing.discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
                <span>Total</span>
                <span className="text-orange-600">
                  {formatCurrency(pricing.total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isPlacingOrder}
              className="mt-5 w-full rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
            >
              {isPlacingOrder ? "Placing Order..." : `Place Order · ${formatCurrency(pricing.total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
