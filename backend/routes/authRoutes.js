const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Database connection module
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/admin/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Check if user already exists
    const userExists = await db.query('SELECT * FROM AdminUsers WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Store user
    const newUser = await db.query(
      'INSERT INTO AdminUsers (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, password_hash]
    );

    const user = newUser.rows[0];

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' }); // Adjust expiry as needed

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await db.query('SELECT * FROM AdminUsers WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// POST /api/admin/logout - Placeholder. Actual logout is client-side (clearing token).
router.post('/logout', (req, res) => {
  // For stateless JWT, logout is typically handled client-side by deleting the token.
  // If using a token blacklist or server-side sessions, more logic would be here.
  res.json({ message: 'Logged out successfully. Please clear your token client-side.' });
});

module.exports = router;
