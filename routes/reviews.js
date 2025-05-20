const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /reviews/add
router.post('/add', (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.session.userId;

  if (!userId) return res.status(401).send('Login required to leave a review.');

  db.run(
    `INSERT INTO reviews (product_id, user_id, rating, comment)
     VALUES (?, ?, ?, ?)`,
    [productId, userId, rating, comment],
    function (err) {
      if (err) return res.status(500).send('Failed to save review.');
      res.status(200).send('Review submitted.');
    }
  );
});

module.exports = router;
