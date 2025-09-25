const express = require("express");
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

    const sweet = await Sweet.create({ name, price, stock, imageUrl });
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
    const sweet = await Sweet.findByIdAndDelete(req.params.id);
    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }
    res.status(200).json({ message: "Sweet deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
