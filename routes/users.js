const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/database');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send('All fields are required.');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

    db.run(query, [name, email, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).send('Email is already registered.');
        }
        return res.status(500).send('Registration failed.');
      }

      req.session.userId = this.lastID; // auto-login after register
      res.redirect('/profile.html');
    });
  } catch (err) {
    res.status(500).send('Server error.');
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('Missing email or password.');

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(401).send('Invalid login credentials.');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Incorrect password.');

    req.session.userId = user.id;
    res.redirect('/profile.html');
  });
});

// Get Profile Info + Purchase History
router.get('/profile', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).send('Not logged in');

  const userQuery = `SELECT id, name, email FROM users WHERE id = ?`;
  const purchaseQuery = `
    SELECT products.title, products.price, purchases.quantity, purchases.purchased_at
    FROM purchases
    JOIN products ON purchases.product_id = products.id
    WHERE purchases.user_id = ?
    ORDER BY purchases.purchased_at DESC
  `;

  db.get(userQuery, [userId], (err, user) => {
    if (err || !user) return res.status(404).send('User not found');

    db.all(purchaseQuery, [userId], (err, purchases) => {
      if (err) return res.status(500).send('Error loading purchases');

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        purchases: purchases || []
      });
    });
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// Update user
router.post('/update', async (req, res) => {
  const { id, name, email, password } = req.body;
  if (!id || !name || !email || !password) {
    return res.status(400).send('All fields required for update.');
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const query = `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`;

    db.run(query, [name, email, hashed, id], function (err) {
      if (err) return res.status(500).send('Update failed.');
      res.redirect('/profile.html');
    });
  } catch (err) {
    res.status(500).send('Server error.');
  }
});


// Delete user
router.post('/delete', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send('User ID required.');

  db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).send('Deletion failed.');
    res.send('User deleted.');
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Logout failed.');
    }
    res.redirect('/login.html'); // Send user back to login page
  });
});

module.exports = router;
