const initialMenuItems = require("../data/menu");

let menuItems = [...initialMenuItems];
let nextId = Math.max(...menuItems.map((i) => i.id), 0) + 1;

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const getMenu = (_req, res) => {
  return res.json(menuItems.filter((item) => !item._deleted));
};

const getMenuAdmin = (_req, res) => {
  return res.json(menuItems.filter((item) => !item._deleted));
};

const addMenuItem = (req, res) => {
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

  const item = {
    id: nextId++,
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
    createdAt: new Date().toISOString(),
  };

  menuItems.push(item);
  return res.status(201).json({ item });
};

const updateMenuItem = (req, res) => {
  const id = Number(req.params.id);
  const index = menuItems.findIndex((i) => i.id === id && !i._deleted);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found" });
  }

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
  if (req.body.tags !== undefined && Array.isArray(req.body.tags)) updates.tags = req.body.tags;
  if (req.body.ingredients !== undefined && Array.isArray(req.body.ingredients)) updates.ingredients = req.body.ingredients;
  if (req.body.available !== undefined) updates.available = Boolean(req.body.available);

  menuItems[index] = { ...menuItems[index], ...updates };
  return res.json({ item: menuItems[index] });
};

const deleteMenuItem = (req, res) => {
  const id = Number(req.params.id);
  const index = menuItems.findIndex((i) => i.id === id && !i._deleted);

  if (index === -1) {
    return res.status(404).json({ message: "Menu item not found" });
  }

  menuItems[index]._deleted = true;
  return res.json({ message: "Item deleted" });
};

module.exports = {
  getMenu,
  getMenuAdmin,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
