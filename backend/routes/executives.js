// routes/executive.js (CommonJS)
const express = require('express');
const router = express.Router();
const Executive = require('../schema/ExecutiveSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('Executive imported:', typeof Executive === 'function' ? 'Model OK' : Executive);
const auth = require('../middleware/authMiddleware');

// Apply protection to all routes below
router.use(auth);

// POST /api/executive/register
router.post('/register', async (req, res) => {
  const { name, email, password, department } = req.body;
  if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

  try {
    const existing = await Executive.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Executive already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const executive = new Executive({ name, email, password: hash, department });
    await executive.save();

    const payload = { id: executive._id, role: executive.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '5h' });

    res.status(201).json({ token, executive: { id: executive._id, name: executive.name, email: executive.email } });
  } catch (err) {
    console.error('Error registering executive:', err);
    res.status(500).send('Server error');
  }
});

// POST /api/executive/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });

  try {
    const executive = await Executive.findOne({ email });
    if (!executive) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, executive.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { id: executive._id, role: executive.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '5h' });

    res.json({ token, executive: { id: executive._id, name: executive.name, email: executive.email } });
  } catch (err) {
    console.error('Error logging in executive:', err);
    res.status(500).send('Server error');
  }
});


router.get('/info', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

    const user = await Executive.findById(userId)
      .select('-password -__v') // hide sensitive fields (adjust if your schema differs)
      .lean();

    if (!user) return res.status(404).json({ msg: 'User not found' });

    return res.json({ user });
  } catch (err) {
    console.error('GET /api/auth/me error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
