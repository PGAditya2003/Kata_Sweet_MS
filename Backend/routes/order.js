const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth").authMiddleware;
const Order = require("../models/Order");
const Sweet = require("../models/Sweet");
const User = require("../models/User");

// CREATE ORDER
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { sweetId, quantity } = req.body;
    const userId = req.user.id; // get user id from token

    // fetch username from DB
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const username = user.username;

    // Validate sweetId
    if (!mongoose.Types.ObjectId.isValid(sweetId)) {
      return res.status(400).json({ message: "Invalid Sweet ID" });
    }

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be positive" });
    }

    // Fetch sweet
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    if (sweet.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Reduce stock
    sweet.stock -= quantity;
    await sweet.save();

    const gstRate = 0.18;
    const totalPrice = quantity * sweet.price * (1 + gstRate);

    const order = new Order({
      username,
      sweetName: sweet.name,
      sweetId: sweet._id,
      quantity,
      totalPrice,
    });

    await order.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET ALL ORDERS FOR LOGGED-IN USER
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const username = user.username;
    const orders = await Order.find({ username }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// GET RECENT 10 ORDERS (any user)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 }) // most recent first
      .limit(10);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
