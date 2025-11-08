const express = require('express');
const router = express.Router();
const Secretary = require('../models/SecretarySchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route   POST /api/secretary/register
// @desc    Register a new secretary
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if secretary already exists
    let existing = await Secretary.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: 'Secretary already exists' });
    }

    // Create and save new secretary
    const secretary = new Secretary({ name, email, password });
    await secretary.save();

    // Generate JWT token
    const payload = { id: secretary.id, role: secretary.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    // Send token back to client
    res.status(201).json({ token });
  } catch (err) {
    console.error('Error registering secretary:', err.message);
    res.status(500).send('Server error');
  }
});


// @route   POST /api/secretary/login
// @desc    Login a secretary and return JWT
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find secretary by email
    const secretary = await Secretary.findOne({ email });
    if (!secretary) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, secretary.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = { id: secretary.id, role: secretary.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    // Respond with token
    res.json({ token });
  } catch (err) {
    console.error('Error logging in secretary:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
