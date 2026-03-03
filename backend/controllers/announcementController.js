let announcements = [];
let nextId = 1;

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const getAnnouncements = (_req, res) => {
  return res.json({ announcements });
};

const getActiveAnnouncements = (_req, res) => {
  const now = new Date();
  const active = announcements.filter((a) => {
    if (!a.active) return false;
    if (a.expiresAt && new Date(a.expiresAt) < now) return false;
    return true;
  });
  return res.json({ announcements: active });
};

const createAnnouncement = (req, res) => {
  const title = toText(req.body?.title);
  const message = toText(req.body?.message);
  const type = toText(req.body?.type) || "info";
  const active = req.body?.active !== false;
  const expiresAt = toText(req.body?.expiresAt) || null;

  if (!title || !message) {
    return res.status(400).json({ message: "Title and message are required" });
  }

  const announcement = {
    id: nextId++,
    title,
    message,
    type,
    active,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  announcements.unshift(announcement);
  return res.status(201).json({ announcement });
};

const updateAnnouncement = (req, res) => {
  const id = Number(req.params.id);
  const index = announcements.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Announcement not found" });
  }

  const updates = {};
  if (req.body.title !== undefined) updates.title = toText(req.body.title);
  if (req.body.message !== undefined) updates.message = toText(req.body.message);
  if (req.body.type !== undefined) updates.type = toText(req.body.type);
  if (req.body.active !== undefined) updates.active = Boolean(req.body.active);
  if (req.body.expiresAt !== undefined) updates.expiresAt = toText(req.body.expiresAt) || null;

  announcements[index] = { ...announcements[index], ...updates };
  return res.json({ announcement: announcements[index] });
};

const deleteAnnouncement = (req, res) => {
  const id = Number(req.params.id);
  const index = announcements.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Announcement not found" });
  }

  announcements.splice(index, 1);
  return res.json({ message: "Announcement deleted" });
};

module.exports = {
  getAnnouncements,
  getActiveAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
