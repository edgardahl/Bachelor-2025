import { DB_TYPE } from "../config/dbConfig.js";
import Store from "../models/storeModel.js";  // Import the Store schema
import { pool } from "../database/postgres.js";

// Get all stores
export const getAllStores = async (req, res) => {
  try {
    if (DB_TYPE === "mongo") {
      // MongoDB: Fetch all stores
      const stores = await Store.find();
      return res.json(stores);
    } else if (DB_TYPE === "postgres") {
      // PostgreSQL: Fetch all stores
      const { rows } = await pool.query("SELECT * FROM stores ORDER BY id ASC");
      return res.json(rows);
    }
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
