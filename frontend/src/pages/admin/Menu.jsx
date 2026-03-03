import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiImage,
  FiSearch,
} from "react-icons/fi";

import Spinner from "../../components/Spinner";
import { ROUTES, STORAGE_KEYS } from "../../constants";
import { api } from "../../services/api";
import { useToast } from "../../context/toastContext";
import { formatCurrency } from "../../utils/formatters";

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  image: "",
  price: "",
  prepTime: "",
  tags: "",
  ingredients: "",
};

const AdminMenu = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getMenuAdmin();
      setItems(Array.isArray(data) ? data : data?.menuItems || []);
    } catch (err) {
      if (err?.message?.includes("401") || err?.message?.includes("403")) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        navigate(ROUTES.ADMIN_LOGIN, { replace: true });
        return;
      }
      showToast("Failed to load menu", "error");
    } finally {
      setLoading(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  const openAddForm = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "",
      image: item.image || "",
      price: item.price != null ? String(item.price) : "",
      prepTime: item.prepTime != null ? String(item.prepTime) : "",
      tags: (item.tags || []).join(", "),
      ingredients: (item.ingredients || []).join(", "),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      showToast("Name and price are required", "error");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      image: form.image.trim(),
      price: Number(form.price),
      prepTime: Number(form.prepTime) || 0,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: form.ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
    };

    setSaving(true);
    try {
      if (editingItem) {
        const data = await api.updateMenuItem(editingItem.id, payload);
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? data.item : i))
        );
        showToast("Item updated", "success");
      } else {
        const data = await api.addMenuItem(payload);
        setItems((prev) => [...prev, data.item]);
        showToast("Item added", "success");
      }
      closeForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Item deleted", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-gray-500">
        <Spinner size="lg" className="text-orange-500" />
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
          <p className="text-sm text-gray-500">{items.length} items</p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          <FiPlus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <FiImage className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">
            {items.length === 0 ? "No menu items yet" : "No items match your search"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-sm"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-36 w-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                  }}
                />
                {item.tags?.length > 0 && (
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                  <p className="whitespace-nowrap font-bold text-orange-600">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                {item.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">
                    {item.description}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    {item.prepTime > 0 && <span>{item.prepTime} min</span>}
                    {item.rating > 0 && (
                      <>
                        <span>&middot;</span>
                        <span>★ {item.rating}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEditForm(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-blue-500"
                      aria-label="Edit"
                    >
                      <FiEdit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      aria-label="Delete"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
            <div className="animate-modal w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingItem ? "Edit Item" : "Add New Item"}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="custom-scrollbar max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="e.g. Classic Burger"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Price <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={form.price}
                      onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                      type="number"
                      min="0"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="150"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <input
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Meals, Drinks, Desserts"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Describe the dish..."
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      value={form.image}
                      onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Prep Time (min)</label>
                    <input
                      value={form.prepTime}
                      onChange={(e) => setForm((p) => ({ ...p, prepTime: e.target.value }))}
                      type="number"
                      min="0"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="15"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Tags</label>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="popular, new, spicy"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Ingredients</label>
                    <input
                      value={form.ingredients}
                      onChange={(e) => setForm((p) => ({ ...p, ingredients: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Beef, Lettuce, Tomato"
                    />
                  </div>
                </div>
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
                  {editingItem ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminMenu;
