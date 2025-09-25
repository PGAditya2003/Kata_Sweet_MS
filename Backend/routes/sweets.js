const express = require("express");
const mongoose = require("mongoose");
const Sweet = require("../models/Sweet");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/sweets
 * Add a new sweet (admin only)
 */
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, price, stock, imageUrl } = req.body;

    // Validate required fields
    if (!name || price == null) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const sweet = await Sweet.create({ name, price, stock: stock || 0, imageUrl });
    res.status(201).json(sweet);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Sweet already exists" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET /api/sweets
 * Get all sweets (available to all)
 */
router.get("/", async (req, res) => {
  try {
    const sweets = await Sweet.find();
    res.status(200).json(sweets);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * DELETE /api/sweets/:id
 * Delete a sweet by ID (admin only)
 */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Sweet ID" });
    }

    const sweet = await Sweet.findByIdAndDelete(id);
    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }
    res.status(200).json({ message: "Sweet deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PATCH /api/sweets/:id/purchase
 * Reduce stock quantity after a purchase (admin only)
 */


module.exports = router;
