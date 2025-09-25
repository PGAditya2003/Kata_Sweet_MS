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
router.put("/:id/purchase", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Sweet ID" });
    }

    // Validate quantity
    if (quantity == null || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    if (sweet.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    sweet.stock -= quantity;
    await sweet.save();

    res.status(200).json({ message: "Stock updated successfully", stock: sweet.stock });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🔍 Search sweets by name
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query; // e.g. /api/sweets/search?q=jamun
    if (!q) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    // Case-insensitive search using regex
    const sweets = await Sweet.find({
      name: { $regex: q, $options: "i" },
    });

    res.json(sweets);
  } catch (error) {
    console.error("Error searching sweets:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
