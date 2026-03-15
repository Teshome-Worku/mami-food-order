const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  // store menu item identifier as string so frontend numeric ids and ObjectId strings both work
  menuItem: { type: String, default: null },
  name: String,
  price: Number,
  qty: { type: Number, default: 1 },
  image: String,
});

const customerSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    address: String,
    notes: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: { type: [orderItemSchema], default: [] },
    customer: { type: customerSchema, required: true },
    status: { type: String, default: 'pending' },
    total: { type: Number, default: 0 },
    trackingCode: { type: String, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
