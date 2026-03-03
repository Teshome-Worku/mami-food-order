const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getMenu,
  getMenuAdmin,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");

const router = express.Router();

router.get("/", getMenu);

router.get("/admin", requireAdmin, getMenuAdmin);
router.post("/", requireAdmin, addMenuItem);
router.put("/:id", requireAdmin, updateMenuItem);
router.delete("/:id", requireAdmin, deleteMenuItem);

module.exports = router;
