// routes/secretary.js (CommonJS)
const express = require('express');
const router = express.Router();
const Secretary = require('../schema/SecretarySchema'); // CommonJS import
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('Secretary imported:', typeof Secretary === 'function' ? 'Model OK' : Secretary);
const auth = require('../middleware/authMiddleware');

// Apply protection to all routes below
router.use(auth);
// POST /api/secretary/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

  try {
    const existing = await Secretary.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Secretary already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const secretary = new Secretary({ name, email, password: hash });
    await secretary.save();

    const payload = { id: secretary._id, role: secretary.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '5h' });

    res.status(201).json({ token, secretary: { id: secretary._id, name: secretary.name, email: secretary.email } });
  } catch (err) {
    console.error('Error registering secretary:', err);
    res.status(500).send('Server error');
  }
});

// POST /api/secretary/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });

  try {
    const secretary = await Secretary.findOne({ email });
    if (!secretary) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, secretary.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { id: secretary._id, role: secretary.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '5h' });

    res.json({ token, secretary: { id: secretary._id, name: secretary.name, email: secretary.email } });
  } catch (err) {
    console.error('Error logging in secretary:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
