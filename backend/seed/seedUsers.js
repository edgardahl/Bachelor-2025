/**
 * 🚀 seedUsers.js
 *
 * This script reads dummy user data from `dummydata/users.json`
 * and inserts it into the MongoDB database using Mongoose.
 * 
 * It ensures passwords are properly hashed by using `.save()`
 * on each `User` document (instead of insertMany).
 * 
 * Usage:
 *   Run this from the backend root:
 *     node seed/seedUsers.js
 *
 * Notes:
 * - Be sure your `.env` file contains a valid `MONGO_URI`.
 * - This script clears the `users` collection before seeding.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import User from '../models/userModel.js';

dotenv.config({ path: path.resolve('../.env') });


const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Optional: Clear existing users
    await User.deleteMany();

    // Load JSON
    const filePath = path.resolve('./dummydata/users.json');
    const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const data of users) {
      const user = new User(data);
      await user.save(); // ✅ triggers password hashing
      console.log(`✅ Created user: ${user.email}`);
    }

    console.log('🎉 All users seeded!');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();
