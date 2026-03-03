const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getAnnouncements,
  getActiveAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const router = express.Router();

router.get("/active", getActiveAnnouncements);

router.get("/", requireAdmin, getAnnouncements);
router.post("/", requireAdmin, createAnnouncement);
router.put("/:id", requireAdmin, updateAnnouncement);
router.delete("/:id", requireAdmin, deleteAnnouncement);

module.exports = router;
