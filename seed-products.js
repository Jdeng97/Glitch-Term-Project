const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/pet_paradise.sqlite');

const products = [
  { title: 'Squeaky Bone', description: 'A fun chew toy that squeaks to entertain dogs.', price: 5.99, image: '/images/squeakybone.jpg', category: 'toys' },
  { title: 'Organic Dog Food', description: 'Grain-free, organic kibble for all breeds.', price: 19.99, image: '/images/dogfood.jpg', category: 'food' },
  { title: 'Catnip Mouse Toy', description: 'Plush toy infused with premium catnip.', price: 4.49, image: '/images/catnipmouse.jpg', category: 'toys' },
  { title: 'Luxury Cat Bed', description: 'Soft faux-fur cat bed with non-slip base.', price: 34.95, image: '/images/catbed.jpg', category: 'furniture' },
  { title: 'Parrot Treat Sticks', description: 'Honey-coated treat sticks for birds.', price: 6.25, image: '/images/parrottreat.jpg', category: 'food' },
  { title: 'Aquarium Filter Pump', description: 'Quiet, efficient water filter for tanks up to 20 gallons.', price: 29.99, image: '/images/fishfilter.jpg', category: 'equipment' },
  { title: 'Hamster Running Wheel', description: 'Safe and silent wheel for small rodents.', price: 12.75, image: '/images/wheel.jpg', category: 'toys' },
  { title: 'Reptile Heat Lamp', description: 'UVA/UVB heat lamp for terrariums.', price: 22.99, image: '/images/heatlamp.jpg', category: 'accessories' },
  { title: 'Dog Collar - Large', description: 'Adjustable, reflective nylon collar.', price: 8.99, image: '/images/dogcollar.jpg', category: 'accessories' },
  { title: 'Cat Litter Box', description: 'Hooded litter box with carbon filter.', price: 18.49, image: '/images/litterbox.jpg', category: 'furniture' },
  { title: 'Dog Shampoo', description: 'Hypoallergenic oatmeal dog shampoo.', price: 9.99, image: '/images/dogshampoo.jpg', category: 'hygiene' },
  { title: 'Fish Tank Gravel', description: 'Decorative blue gravel for aquariums.', price: 3.49, image: '/images/fishgravel.jpg', category: 'decor' },
  { title: 'Golden Retriever Puppy', description: 'Adorable Golden Retriever, vaccinated and ready for a loving home.', price: 850.00, image: '/images/goldenretriever.jpg', category: 'dogs' },
  { title: 'Toy Poodle Puppy', description: 'Small, playful Toy Poodle for sale. Hypoallergenic and family-friendly.', price: 950.00, image: '/images/toypoodle.jpg', category: 'dogs' },
  { title: 'Short Hair Cat', description: 'Sweet and cuddly domestic short hair cat. Litter-trained.', price: 150.00, image: '/images/shortcat.jpg', category: 'cats' },
  { title: 'Siamese Kitten', description: 'Beautiful blue-eyed Siamese kitten. Very vocal and affectionate.', price: 200.00, image: '/images/siamese.jpg', category: 'cats' }
];

db.serialize(() => {
  db.run(`DELETE FROM products`);

  const stmt = db.prepare(`INSERT INTO products (title, description, price, image, category) VALUES (?, ?, ?, ?, ?)`);
  products.forEach(p => {
    stmt.run(p.title, p.description, p.price, p.image, p.category);
  });
  stmt.finalize(() => {
    console.log("✅ Products seeded.");
    db.close();
  });
});
