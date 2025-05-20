const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/pet_paradise.sqlite');

const reviews = [
  ['Squeaky Bone', 1, 5, 'My dog won’t stop playing with this!'],
  ['Organic Dog Food', 2, 4, 'Healthy and my dog loves it.'],
  ['Catnip Mouse Toy', 3, 3, 'Cat liked it, but it didn’t last long.'],
  ['Luxury Cat Bed', 1, 5, 'My cat naps here all day!'],
  ['Parrot Treat Sticks', 2, 4, 'Bird goes crazy for these.'],
  ['Aquarium Filter Pump', 3, 5, 'Silent and works like a charm.'],
  ['Hamster Running Wheel', 4, 4, 'Perfect size and quiet.'],
  ['Reptile Heat Lamp', 2, 5, 'Keeps my lizard cozy and warm.'],
  ['Dog Collar - Large', 3, 4, 'Fits great and feels durable.'],
  ['Cat Litter Box', 1, 5, 'No smells and easy to clean.'],
  ['Dog Shampoo', 2, 5, 'Left my dog’s coat shiny and soft.'],
  ['Fish Tank Gravel', 4, 3, 'Looks nice but some pieces were chipped.'],
  ['Golden Retriever Puppy', 1, 5, 'Best dog we’ve ever adopted!'],
  ['Toy Poodle Puppy', 2, 5, 'Fluffy and super friendly.'],
  ['Short Hair Cat', 3, 4, 'Low maintenance and sweet.'],
  ['Siamese Kitten', 4, 5, 'Beautiful blue eyes and so vocal!']
];

db.serialize(() => {
  db.run(`DELETE FROM reviews`);

  let remaining = reviews.length;
  if (remaining === 0) return db.close();

  reviews.forEach(([title, userId, rating, comment]) => {
    db.get(`SELECT id FROM products WHERE title = ?`, [title], (err, row) => {
      if (err) {
        console.error(`Error finding product "${title}":`, err.message);
      } else if (row) {
        db.run(
          `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
          [row.id, userId, rating, comment],
          function (err) {
            if (err) console.error(`Error inserting review for ${title}:`, err.message);
            else console.log(`✅ Inserted review for ${title}`);
            if (--remaining === 0) db.close();
          }
        );
      } else {
        console.warn(`⚠️ Product "${title}" not found`);
        if (--remaining === 0) db.close();
      }
    });
  });
});
