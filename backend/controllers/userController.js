import { DB_TYPE } from "../config/dbConfig.js";
import User from "../models/userModel.js"; // Import the provided User schema
import { pool } from "../database/postgres.js";

export const getUsers = async (req, res) => {
  try {
    if (DB_TYPE === "mongo") {
      const users = await User.find();
      return res.json(users);
    } else if (DB_TYPE === "postgres") {
      const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page
      const offset = (page - 1) * limit;
      const { rows } = await pool.query(
        "SELECT * FROM users ORDER BY id ASC LIMIT $1 OFFSET $2",
        console.error("Error fetching users:", error)
      );
      res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
      return res.json(rows);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (DB_TYPE === "mongo") {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json(user);
    } else if (DB_TYPE === "postgres") {
      const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json(rows[0]);
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    role,
    store,
    shiftPreferences,
    skills,
    availability,
    employmentStatus,
  } = req.body;

  try {
    if (DB_TYPE === "mongo") {
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        phone,
        role,
        store,
        shiftPreferences,
        skills,
        availability,
        employmentStatus,
      });
      return res.status(201).json(newUser);
    } else if (DB_TYPE === "postgres") {
      const { rows } = await pool.query(
        "INSERT INTO users(firstName, lastName, email, phone, role, store, shiftPreferences, skills, availability, employmentStatus) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
        [
          firstName,
          lastName,
          email,
          phone,
          role,
          store,
          shiftPreferences,
          skills,
          availability,
          employmentStatus,
        ]
      );
      return res.status(201).json(rows[0]);
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    if (DB_TYPE === "mongo") {
      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json(updatedUser);
    } else if (DB_TYPE === "postgres") {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);

      const querySet = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");

      const query = `UPDATE users SET ${querySet} WHERE id = $$${fields.length + 1} RETURNING *`;
      const { rows } = await pool.query(query, [...values, id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json(rows[0]);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (DB_TYPE === "mongo") {
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ message: "User deleted successfully" });
    } else if (DB_TYPE === "postgres") {
      const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [id]);

      if (rowCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ message: "User deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsersWithStore = async (req, res) => {
  try {
    if (DB_TYPE === "mongo") {
      // MongoDB: Fetch all users and only populate the store's name
      const users = await User.find()
        .populate("butikk", "butikknavn"); // Only include the store's name in the populated field
      return res.json(users);
    } else if (DB_TYPE === "postgres") {
      // PostgreSQL: Modify the SQL to only return the store name
      const { rows } = await pool.query(`
        SELECT users.*, stores.butikknavn
        FROM users
        LEFT JOIN stores ON users.store = stores.id
        ORDER BY users.id ASC
      `);
      res.status(200).json(rows);
    }
  } catch (error) {
    console.error("Error fetching users with stores:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
