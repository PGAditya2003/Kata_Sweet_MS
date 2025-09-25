const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model('Sweet', sweetSchema);
