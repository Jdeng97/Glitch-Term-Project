const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Add item to cart
router.post('/add', (req, res) => {
  const { productId, quantity } = req.body;

  // Validate quantity
  const qty = parseInt(quantity);
  if (!productId || isNaN(qty) || qty < 1 || qty > 10) {
    return res.status(400).send('Invalid quantity or product');
  }

  // Initialize session cart if it doesn't exist
  if (!req.session.cart) req.session.cart = [];

  const existingItem = req.session.cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    req.session.cart.push({ productId, quantity: qty });
  }

  res.redirect('/cart.html');
});

// View cart
router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.json([]);

  const placeholders = cart.map(() => '?').join(',');
  const ids = cart.map(item => item.productId);

  const sql = `SELECT * FROM products WHERE id IN (${placeholders})`;

  db.all(sql, ids, (err, products) => {
    if (err) return res.status(500).send('Failed to load cart');

    const result = products.map(p => {
      const item = cart.find(i => i.productId == p.id);
      return {
        ...p,
        quantity: item ? item.quantity : 1,
        total: item ? item.quantity * p.price : p.price
      };
    });

    res.json(result);
  });
});

// Checkout - transfer session cart to purchases table
router.post('/checkout', (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).send('Login required');

  const cart = req.session.cart || [];
  if (cart.length === 0) return res.status(400).send('Cart is empty');

  const stmt = db.prepare(`INSERT INTO purchases (user_id, product_id, quantity) VALUES (?, ?, ?)`);

  for (const item of cart) {
    stmt.run(userId, item.productId, item.quantity);
  }

  stmt.finalize();
  req.session.cart = []; // clear cart after purchase

  res.redirect('/profile.html');
});

// Update item quantity in cart
router.post('/update', (req, res) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity);
  if (!req.session.cart) req.session.cart = [];

  // Remove item if quantity is 0
  if (qty === 0) {
    req.session.cart = req.session.cart.filter(item => item.productId !== productId);
  } else if (!isNaN(qty) && qty > 0 && qty <= 10) {
    const item = req.session.cart.find(i => i.productId === productId);
    if (item) {
      item.quantity = qty;
    } else {
      req.session.cart.push({ productId, quantity: qty });
    }
  }

  res.redirect('/cart.html');
});


module.exports = router;
