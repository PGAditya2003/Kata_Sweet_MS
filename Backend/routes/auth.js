const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// -----------------------------
// LOGIN
// -----------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "testsecret",
    { expiresIn: "3h" }
  );

  // Return username along with token and role
  res.json({ token, role: user.role, username: user.username });
});

// -----------------------------
// REGISTER
// -----------------------------
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Make first user admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    const user = await User.create({ username, email, password: hashedPassword, role });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "testsecret",
      { expiresIn: "3h" }
    );

    // Return username along with token and role
    res.status(201).json({ token, role: user.role, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// -----------------------------
// LIST ALL USERS (admin only)
// -----------------------------
router.get("/all",authMiddleware, adminMiddleware , async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// -----------------------------
// PROMOTE USER TO ADMIN (admin only)
// -----------------------------
router.patch("/promote/:id",authMiddleware, adminMiddleware ,async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    await user.save();

    res.json({ message: `${user.username} is now an admin`, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
