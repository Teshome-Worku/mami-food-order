const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  prepTime: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  ingredients: { type: [String], default: [] },
  available: { type: Boolean, default: true },
  _deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
