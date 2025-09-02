const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nest');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const categorySchema = new mongoose.Schema({
  name: { type: String },
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

// Create Models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

// total batch
const batchSize = 500;

// Seed Data
const seedUsers = [];
for (let i = 0; i < (Math.round(batchSize * 0.1)); i++) {
    seedUsers.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
    })
}

const seedCategories = [];
for (let i = 0; i < 5; i++) {
   seedCategories.push({
    name: faker.commerce.productAdjective(),
    description: faker.commerce.productDescription(),
  }) 
}

// seed bulks products
const seedProducts = [];
for (let i = 0; i < batchSize; i++) {
    seedProducts.push({
        name: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        stock: Math.random(),
        tags: [faker.commerce.productAdjective()],
    });
};

// Seeding Functions
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Existing data cleared');

    // Seed Categories first (since Products reference them)
    console.log('Seeding categories...');
    const categories = await Category.insertMany(seedCategories);
    console.log(`${categories.length} categories created`);

    // Seed Users
    console.log('Seeding users...');
    const users = await User.insertMany(seedUsers);
    console.log(`${users.length} users created`);

    // Seed Products with category references
    console.log('Seeding products...');
    const productsWithCategories = seedProducts.map((product, index) => ({
      ...product,
      category: categories[index % categories.length]._id, // Distribute products across categories
    }));

    const products = await Product.insertMany(productsWithCategories);
    console.log(`${products.length} products created`);

    // Display summary
    console.log('\nSeeding Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${products.length}`);
    console.log('\nDatabase seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Main execution function
const runSeed = async () => {
  try {
    await connectDB();
    await seedDatabase();
  } catch (error) {
    console.error('Seed script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\nSeed script interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the seed script
if (require.main === module) {
  runSeed();
}

module.exports = {
  runSeed,
  seedDatabase,
  User,
  Category,
  Product,
};
