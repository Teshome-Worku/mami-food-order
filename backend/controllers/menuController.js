const MenuItem = require("../models/MenuItem");

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const getMenu = async (_req, res) => {
  try {
    const menu = await MenuItem.find({ _deleted: false }).lean();
    return res.json(menu);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load menu" });
  }
};

const getMenuAdmin = async (_req, res) => {
  try {
    const menu = await MenuItem.find({ _deleted: false }).lean();
    return res.json(menu);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load menu" });
  }
};

const addMenuItem = async (req, res) => {
  const name = toText(req.body?.name);
  const description = toText(req.body?.description);
  const category = toText(req.body?.category);
  const image = toText(req.body?.image);
  const price = Number(req.body?.price);
  const prepTime = Number(req.body?.prepTime) || 0;
  const tags = Array.isArray(req.body?.tags) ? req.body.tags : [];
  const ingredients = Array.isArray(req.body?.ingredients) ? req.body.ingredients : [];
  const available = req.body?.available !== false;

  if (!name || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ message: "Name and a valid price are required" });
  }

  try {
    const itemData = {
      name,
      description,
      category,
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      price,
      prepTime,
      rating: 0,
      reviewCount: 0,
      tags,
      ingredients,
      available,
    };

    const created = await MenuItem.create(itemData);
    return res.status(201).json({ item: created });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create menu item" });
  }
};

const updateMenuItem = async (req, res) => {
  const id = req.params.id;
  const updates = {};
  if (req.body.name !== undefined) updates.name = toText(req.body.name);
  if (req.body.description !== undefined) updates.description = toText(req.body.description);
  if (req.body.category !== undefined) updates.category = toText(req.body.category);
  if (req.body.image !== undefined) updates.image = toText(req.body.image);
  if (req.body.price !== undefined) {
    const p = Number(req.body.price);
    if (Number.isFinite(p) && p >= 0) updates.price = p;
  }
  if (req.body.prepTime !== undefined) updates.prepTime = Number(req.body.prepTime) || 0;
  if (req.body.tags !== undefined) updates.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split?.(",")?.map(t => t.trim()).filter(Boolean) || [];
  if (req.body.ingredients !== undefined) updates.ingredients = Array.isArray(req.body.ingredients) ? req.body.ingredients : req.body.ingredients.split?.(",")?.map(i => i.trim()).filter(Boolean) || [];
  if (req.body.available !== undefined) updates.available = Boolean(req.body.available);

  try {
    const updated = await MenuItem.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: "Menu item not found" });
    return res.json({ item: updated });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update menu item" });
  }
};

const deleteMenuItem = async (req, res) => {
  const id = req.params.id;
  try {
    const updated = await MenuItem.findByIdAndUpdate(id, { _deleted: true }, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: "Menu item not found" });
    return res.json({ message: "Item deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete menu item" });
  }
};

module.exports = {
  getMenu,
  getMenuAdmin,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
