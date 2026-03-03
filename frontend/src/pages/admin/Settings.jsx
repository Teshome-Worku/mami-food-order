import { useState } from "react";
import {
  FiSave,
  FiClock,
  FiTruck,
  FiPhone,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";

import { useToast } from "../../context/toastContext";

const INITIAL_SETTINGS = {
  restaurantName: "Mami Food",
  phone: "+251 912 345 678",
  email: "info@mamifood.com",
  address: "Adama, Ethiopia, Bole Sub City",

  deliveryFee: "50",
  freeDeliveryThreshold: "500",
  minOrderAmount: "100",
  estimatedDeliveryTime: "30",
  deliveryRadius: "10",

  monFri: "8:00 AM - 10:00 PM",
  saturday: "9:00 AM - 11:00 PM",
  sunday: "10:00 AM - 9:00 PM",

  currency: "Birr",
  orderNotification: true,
  autoAcceptOrders: false,
};

const SettingsSection = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border border-gray-200 bg-white">
    <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="font-bold text-gray-900">{title}</h2>
    </div>
    <div className="space-y-4 p-5">{children}</div>
  </div>
);

const FieldRow = ({ label, children }) => (
  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
    <label className="w-44 shrink-0 text-sm font-medium text-gray-600">
      {label}
    </label>
    <div className="flex-1">{children}</div>
  </div>
);

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

const AdminSettings = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    showToast("Settings saved successfully", "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your restaurant configuration
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          <FiSave className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      {/* Contact Info */}
      <SettingsSection icon={FiPhone} title="Restaurant Info">
        <FieldRow label="Restaurant Name">
          <input
            value={settings.restaurantName}
            onChange={(e) => update("restaurantName", e.target.value)}
            className={inputClass}
          />
        </FieldRow>
        <FieldRow label="Phone Number">
          <input
            value={settings.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
          />
        </FieldRow>
        <FieldRow label="Email">
          <input
            value={settings.email}
            onChange={(e) => update("email", e.target.value)}
            type="email"
            className={inputClass}
          />
        </FieldRow>
        <FieldRow label="Address">
          <input
            value={settings.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputClass}
          />
        </FieldRow>
      </SettingsSection>

      {/* Delivery Settings */}
      <SettingsSection icon={FiTruck} title="Delivery Configuration">
        <FieldRow label="Delivery Fee (Birr)">
          <input
            value={settings.deliveryFee}
            onChange={(e) => update("deliveryFee", e.target.value)}
            type="number"
            min="0"
            className={inputClass}
          />
        </FieldRow>
        <FieldRow label="Free Delivery Over">
          <input
            value={settings.freeDeliveryThreshold}
            onChange={(e) => update("freeDeliveryThreshold", e.target.value)}
            type="number"
            min="0"
            className={inputClass}
          />
        </FieldRow>
        <FieldRow label="Min Order Amount">
          <input
            value={settings.minOrderAmount}
            onChange={(e) => update("minOrderAmount", e.target.value)}
            type="number"
            min="0"
            className={inputClass}
          />
        </FieldRow>
        <FieldRow label="Est. Delivery Time (min)">
          <input
            value={settings.estimatedDeliveryTime}
            onChange={(e) => update("estimatedDeliveryTime", e.target.value)}
            type="number"
            min="0"
            className={inputClass}
          />
        </FieldRow>
        <FieldRow label="Delivery Radius (km)">
          <input
            value={settings.deliveryRadius}
            onChange={(e) => update("deliveryRadius", e.target.value)}
            type="number"
            min="0"
            className={inputClass}
          />
        </FieldRow>
      </SettingsSection>

      {/* Business Hours */}
      <SettingsSection icon={FiClock} title="Business Hours">
        <FieldRow label="Monday - Friday">
          <input
            value={settings.monFri}
            onChange={(e) => update("monFri", e.target.value)}
            className={inputClass}
          />
        </FieldRow>
        <FieldRow label="Saturday">
          <input
            value={settings.saturday}
            onChange={(e) => update("saturday", e.target.value)}
            className={inputClass}
          />
        </FieldRow>
        <FieldRow label="Sunday">
          <input
            value={settings.sunday}
            onChange={(e) => update("sunday", e.target.value)}
            className={inputClass}
          />
        </FieldRow>
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection icon={FiDollarSign} title="Preferences">
        <FieldRow label="Currency Symbol">
          <input
            value={settings.currency}
            onChange={(e) => update("currency", e.target.value)}
            className={inputClass}
          />
        </FieldRow>
        <FieldRow label="Location">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiMapPin className="h-4 w-4 text-orange-500" />
            <span>{settings.address}</span>
          </div>
        </FieldRow>
        <FieldRow label="Order Notifications">
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={settings.orderNotification}
              onChange={(e) => update("orderNotification", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            <span className="text-gray-600">
              Get notified for new orders
            </span>
          </label>
        </FieldRow>
        <FieldRow label="Auto-accept Orders">
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={settings.autoAcceptOrders}
              onChange={(e) => update("autoAcceptOrders", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            <span className="text-gray-600">
              Automatically accept incoming orders
            </span>
          </label>
        </FieldRow>
      </SettingsSection>
    </div>
  );
};

export default AdminSettings;
