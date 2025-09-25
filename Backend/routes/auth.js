const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '72h' }
    );

    // 4. Send response
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
