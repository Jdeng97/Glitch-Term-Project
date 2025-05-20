const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /products - All products or filtered by search term
router.get('/', (req, res) => {
  const search = req.query.search;
  if (search) {
    const sql = `SELECT * FROM products WHERE title LIKE ? OR description LIKE ?`;
    const wildcard = `%${search}%`;
    db.all(sql, [wildcard, wildcard], (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows);
    });
  } else {
    db.all('SELECT * FROM products', [], (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows);
    });
  }
});

// ✅ GET /products/:id/reviews - Get reviews for a product
router.get('/:id/reviews', (req, res) => {
  const sql = `
    SELECT r.rating, r.comment, u.name, r.created_at
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `;
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).send('Failed to load reviews');
    res.json(rows);
  });
});

// ✅ GET /products/:id - Single product by ID
router.get('/:id', (req, res) => {
  console.log('Fetching product by ID:', req.params.id);  // Helpful debug log
  const sql = 'SELECT * FROM products WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (!row) return res.status(404).send('Product not found');
    res.json(row);
  });
});

// POST /products/add - Add new product
router.post('/add', (req, res) => {
  const { title, description, price, image, category } = req.body;
  const sql = `INSERT INTO products (title, description, price, image, category)
               VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [title, description, price, image, category], function (err) {
    if (err) return res.status(500).send(err.message);
    res.send(`Product added with ID ${this.lastID}`);
  });
});

module.exports = router;
