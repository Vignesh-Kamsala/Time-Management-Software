// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Executive = require('../schema/ExecutiveSchema');
const Secretary = require('../schema/SecretarySchema');

// LOGIN route for both executive and secretary
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: 'Please enter both email and password' });

  try {
    // Try to find Executive first
    let user = await Executive.findOne({ email });
    let role = 'executive';

    // If not found, try Secretary
    if (!user) {
      user = await Secretary.findOne({ email });
      role = 'secretary';
    }

    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    // Create token
 // when creating token (server-side)
const payload = { id: user._id, role: user.role };
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });


    res.json({
      msg: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

const auth=require("../middleware/authMiddleware")







module.exports = router;
