import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiMessageSquare,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";

import Spinner from "../../components/Spinner";
import { ROUTES, STORAGE_KEYS } from "../../constants";
import { api } from "../../services/api";
import { useToast } from "../../context/toastContext";
import { formatDateTime } from "../../utils/formatters";

const TYPE_CONFIG = {
  info: { label: "Info", color: "bg-blue-50 border-blue-200 text-blue-700", icon: FiInfo },
  warning: { label: "Warning", color: "bg-amber-50 border-amber-200 text-amber-700", icon: FiAlertTriangle },
  success: { label: "Promotion", color: "bg-green-50 border-green-200 text-green-700", icon: FiCheckCircle },
  urgent: { label: "Urgent", color: "bg-red-50 border-red-200 text-red-700", icon: FiAlertTriangle },
};

const EMPTY_FORM = {
  title: "",
  message: "",
  type: "info",
  active: true,
  expiresAt: "",
};

const Announcements = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data?.announcements || []);
    } catch (err) {
      if (err?.message?.includes("401") || err?.message?.includes("403")) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        navigate(ROUTES.ADMIN_LOGIN, { replace: true });
        return;
      }
      showToast("Failed to load announcements", "error");
    } finally {
      setLoading(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const openAddForm = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      message: item.message || "",
      type: item.type || "info",
      active: item.active !== false,
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 16) : "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      showToast("Title and message are required", "error");
      return;
    }

    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      type: form.type,
      active: form.active,
      expiresAt: form.expiresAt || null,
    };

    setSaving(true);
    try {
      if (editingItem) {
        const data = await api.updateAnnouncement(editingItem.id, payload);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingItem.id ? data.announcement : a))
        );
        showToast("Announcement updated", "success");
      } else {
        const data = await api.createAnnouncement(payload);
        setAnnouncements((prev) => [data.announcement, ...prev]);
        showToast("Announcement created", "success");
      }
      closeForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const data = await api.updateAnnouncement(item.id, { active: !item.active });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? data.announcement : a))
      );
      showToast(
        `Announcement ${!item.active ? "activated" : "deactivated"}`,
        "success"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToast("Announcement deleted", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-gray-500">
        <Spinner size="lg" className="text-orange-500" />
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500">
            Create banners and notices visible to customers
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          <FiPlus className="h-4 w-4" />
          New Announcement
        </button>
      </div>

      {/* List */}
      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <FiMessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">No announcements yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Create one to display a banner on the customer site.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => {
            const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
            const Icon = conf.icon;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white p-4 transition hover:shadow-sm sm:p-5 ${
                  item.active ? "" : "opacity-60"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${conf.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <p className="mt-0.5 text-sm text-gray-500">{item.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        <span
                          className={`rounded-full border px-2 py-0.5 font-semibold ${conf.color}`}
                        >
                          {conf.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-medium ${
                            item.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {item.active ? "Active" : "Inactive"}
                        </span>
                        <span>Created {formatDateTime(item.createdAt)}</span>
                        {item.expiresAt && (
                          <span>Expires {formatDateTime(item.expiresAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        item.active
                          ? "text-amber-600 hover:bg-amber-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {item.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-500"
                    >
                      <FiEdit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <>
          <div
            className="animate-backdrop fixed inset-0 z-50 bg-black/50"
            onClick={closeForm}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="animate-modal w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingItem ? "Edit Announcement" : "New Announcement"}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="e.g. Holiday Hours Update"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    placeholder="Write the announcement message..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="info">Info</option>
                      <option value="success">Promotion</option>
                      <option value="warning">Warning</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Expires</label>
                    <input
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                  />
                  <span className="font-medium text-gray-700">Active (visible to customers)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
                >
                  {saving && <Spinner size="sm" className="text-white" />}
                  {editingItem ? "Save Changes" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Announcements;
