const VALID_STATUSES = ["pending", "preparing", "ready", "delivered"];
const TRACKING_CODE_LENGTH = 6;

// TODO: replace with database persistence
let orders = [];

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const findOrderIndexById = (id) =>
  orders.findIndex((order) => String(order.id) === String(id));

const createTrackingCode = () =>
  Math.random()
    .toString(36)
    .slice(2, 2 + TRACKING_CODE_LENGTH)
    .toUpperCase();

const normalizeItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      id: item?.id,
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

const createOrder = (req, res) => {
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
  const total = submittedTotal !== null && submittedTotal > 0
    ? submittedTotal
    : calculatedTotal;
  const now = new Date().toISOString();

  const savedOrder = {
    id: Date.now(),
    status: "pending",
    trackingCode: createTrackingCode(),
    createdAt: now,
    updatedAt: now,
    customer: {
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
      ...(customerNotes && { notes: customerNotes }),
    },
    items,
    total,
  };

  orders = [savedOrder, ...orders];

  return res.status(201).json({
    message: "Order created",
    orderId: savedOrder.id,
    trackingCode: savedOrder.trackingCode,
  });
};

const getOrders = (_req, res) => {
  return res.status(200).json({
    orders,
  });
};

const getOrderTracking = (req, res) => {
  const orderId = req.params.id;
  const trackingCode = toText(req.query?.code).toUpperCase();

  if (!trackingCode) {
    return res.status(400).json({
      message: "Tracking code is required",
    });
  }

  const index = findOrderIndexById(orderId);
  if (index === -1) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  const order = orders[index];
  if (order.trackingCode !== trackingCode) {
    return res.status(401).json({
      message: "Invalid tracking credentials",
    });
  }

  return res.status(200).json({
    order: {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
      total: order.total,
    },
  });
};

const lookupOrdersByPhone = (req, res) => {
  const phone = toText(req.query?.phone);

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const normalizedPhone = phone.replace(/\s+/g, "");

  const matched = orders
    .filter((order) => {
      const orderPhone = (order.customer?.phone || "").replace(/\s+/g, "");
      return orderPhone === normalizedPhone;
    })
    .map((order) => ({
      id: order.id,
      status: order.status,
      trackingCode: order.trackingCode,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      total: order.total,
      itemCount: (order.items || []).reduce((s, i) => s + (i.qty || 0), 0),
    }));

  return res.status(200).json({ orders: matched });
};

const updateOrderStatus = (req, res) => {
  const orderId = req.params.id;
  const nextStatus = toText(req.body?.status).toLowerCase();

  if (!VALID_STATUSES.includes(nextStatus)) {
    return res.status(400).json({
      message:
        "Invalid status. Must be one of: pending, preparing, ready, delivered",
    });
  }

  const index = findOrderIndexById(orderId);
  if (index === -1) {
    return res.status(404).json({
      message: "Order not found. It may have been cleared after a server restart.",
    });
  }

  orders[index] = {
    ...orders[index],
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };

  return res.status(200).json({
    order: orders[index],
  });
};

const deleteOrder = (req, res) => {
  const orderId = req.params.id;
  const index = findOrderIndexById(orderId);

  if (index === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  orders.splice(index, 1);
  return res.status(200).json({ message: "Order deleted" });
};

module.exports = {
  createOrder,
  getOrders,
  getOrderTracking,
  lookupOrdersByPhone,
  updateOrderStatus,
  deleteOrder,
};
