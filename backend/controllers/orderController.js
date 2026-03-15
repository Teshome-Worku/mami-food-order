const VALID_STATUSES = ["pending", "preparing", "ready", "delivered"];
const TRACKING_CODE_LENGTH = 6;

const Order = require("../models/Order");

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const createTrackingCode = () =>
  Math.random()
    .toString(36)
    .slice(2, 2 + TRACKING_CODE_LENGTH)
    .toUpperCase();

const normalizeItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      // convert incoming ids to string so they match schema (supports numeric ids or ObjectId strings)
      menuItem: item?.id != null ? String(item.id) : null,
      name: toText(item?.name),
      price: toNumber(item?.price),
      qty: toNumber(item?.qty),
      image: toText(item?.image),
    }))
    .filter(
      (item) =>
        item.name &&
        item.price !== null &&
        item.price >= 0 &&
        item.qty !== null &&
        item.qty > 0
    );
};

const calculateOrderTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.qty, 0);

//to create a new order
const createOrder = async (req, res) => {
  try {
    const customerName = toText(req.body?.customer?.name);
    const customerPhone = toText(req.body?.customer?.phone);
    const customerAddress = toText(req.body?.customer?.address);
    const customerNotes = toText(req.body?.customer?.notes);

    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({
        message: "Customer name, phone, and address are required",
      });
    }

    const items = normalizeItems(req.body?.items);
    if (items.length === 0) {
      return res.status(400).json({
        message: "Order must include at least one valid item",
      });
    }

    const calculatedTotal = calculateOrderTotal(items);
    const submittedTotal = toNumber(req.body?.total);
    const total = submittedTotal !== null && submittedTotal > 0 ? submittedTotal : calculatedTotal;

    const saved = await Order.create({
      items,
      customer: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        ...(customerNotes && { notes: customerNotes }),
      },
      total,
      status: "pending",
      trackingCode: createTrackingCode(),
    });

    return res.status(201).json({
      message: "Order created",
      orderId: saved._id,
      trackingCode: saved.trackingCode,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// to get all orders (admin)
const getOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getOrderTracking = async (req, res) => {
  try {
    const orderId = req.params.id;
    const trackingCode = toText(req.query?.code).toUpperCase();

    if (!trackingCode) {
      return res.status(400).json({ message: 'Tracking code is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if ((order.trackingCode || '').toUpperCase() !== trackingCode) {
      return res.status(401).json({ message: 'Invalid tracking credentials' });
    }

    return res.status(200).json({
      order: {
        id: order._id,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items,
        total: order.total,
      },
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// to lookup orders by customer phone number (admin)
const lookupOrdersByPhone = async (req, res) => {
  try {
    const phone = toText(req.query?.phone);

    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const normalizedPhone = phone.replace(/\s+/g, '');

    const all = await Order.find().sort({ createdAt: -1 });
    const matched = all
      .filter((order) => (order.customer?.phone || '').replace(/\s+/g, '') === normalizedPhone)
      .map((order) => ({
        id: order._id,
        status: order.status,
        trackingCode: order.trackingCode,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        total: order.total,
        itemCount: (order.items || []).reduce((s, i) => s + (i.qty || 0), 0),
      }));

    return res.status(200).json({ orders: matched });
  } catch (error) {
    console.error('Lookup by phone error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const nextStatus = toText(req.body?.status).toLowerCase();

    if (!VALID_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: pending, preparing, ready, delivered' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = nextStatus;
    order.updatedAt = new Date();
    await order.save();

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// to delete an order (admin)
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deleted = await Order.findByIdAndDelete(orderId);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    return res.status(200).json({ message: 'Order deleted' });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderTracking,
  lookupOrdersByPhone,
  updateOrderStatus,
  deleteOrder,
};
