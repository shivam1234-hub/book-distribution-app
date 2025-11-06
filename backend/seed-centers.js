const mongoose = require('mongoose');
require('dotenv').config();

const Center = require('./models/Center');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book-distribution';

const centers = [
  { name: 'IYMF Panathur' },
  { name: 'IYMF AECS' },
  { name: 'IYMF Marathalli' }
];

async function seedCenters() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    for (const centerData of centers) {
      try {
        const existingCenter = await Center.findOne({ name: centerData.name });
        if (existingCenter) {
          console.log(`Center "${centerData.name}" already exists, skipping...`);
        } else {
          const center = new Center(centerData);
          await center.save();
          console.log(`✓ Added center: ${centerData.name}`);
        }
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Center "${centerData.name}" already exists (duplicate key), skipping...`);
        } else {
          console.error(`Error adding center "${centerData.name}":`, error.message);
        }
      }
    }

    console.log('\n✓ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding centers:', error);
    process.exit(1);
  }
}

seedCenters();

