import User from '../models/userModel.js';
import { DB_TYPE } from '../config/dbConfig.js';
import '../models/qualificationModel.js'; 
import '../models/storeModel.js';

// import { pool } from '../database/mysql.js'; // For future MySQL use

// Get all users
export const getUsers = async (req, res) => {
  try {
    if (DB_TYPE === 'mongo') {
      const users = await User.find()
        .populate({
          path: 'qualifications',
          select: 'name'
        })
        .populate({
          path: 'store_id',
          select: 'name'
        });

      return res.json(users);
    } else if (DB_TYPE === 'mysql') {
      return res.json([]); // Placeholder
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get one user by ID
export const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (DB_TYPE === 'mongo') {
      const user = await User.findById(id)
        .populate({
          path: 'qualifications',
          select: 'name'
        })
        .populate({
          path: 'store_id',
          select: 'name'
        });

      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    } else if (DB_TYPE === 'mysql') {
      return res.json({}); // Placeholder
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    if (DB_TYPE === 'mongo') {
      const newUser = await User.create(req.body);
      return res.status(201).json(newUser);
    } else if (DB_TYPE === 'mysql') {
      // const { first_name, last_name, ... } = req.body;
      // await pool.query('INSERT INTO users (...) VALUES (...)', [...]);
      return res.status(201).json({ message: 'User created (MySQL placeholder)' });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user by ID
export const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (DB_TYPE === 'mongo') {
      const updatedUser = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(updatedUser);
    } else if (DB_TYPE === 'mysql') {
      // await pool.query('UPDATE users SET ... WHERE id = ?', [..., id]);
      return res.json({ message: 'User updated (MySQL placeholder)' });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (DB_TYPE === 'mongo') {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ message: 'User deleted successfully' });
    } else if (DB_TYPE === 'mysql') {
      // await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return res.json({ message: 'User deleted (MySQL placeholder)' });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
