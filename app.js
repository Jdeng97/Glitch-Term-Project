const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();


// ✅ Import routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products'); 
const reviewRoutes = require('./routes/reviews');
const cartRoutes = require('./routes/cart');
const db = require('./db/database');

// ✅ Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// ✅ Body parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ Mount app routes BEFORE static
app.use('/products', productRoutes);  
app.use('/users', userRoutes);
app.use('/reviews', reviewRoutes);
app.use('/cart', cartRoutes);

// ✅ Serve static files after routing
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
