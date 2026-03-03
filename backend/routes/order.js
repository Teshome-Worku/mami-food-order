const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/requireAdmin");
const {
  createOrder,
  getOrders,
  getOrderTracking,
  lookupOrdersByPhone,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

// Public routes (customers)
router.post("/", createOrder);
router.get("/track/:id", getOrderTracking);
router.get("/lookup", lookupOrdersByPhone);

// Protected routes (admin only)
router.get("/", requireAdmin, getOrders);
router.put("/:id", requireAdmin, updateOrderStatus);
router.delete("/:id", requireAdmin, deleteOrder);

module.exports = router;
