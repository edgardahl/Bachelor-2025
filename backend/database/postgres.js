import pkg from "pg";
import { POSTGRES_URI } from "../config/dbConfig.js";

const { Pool } = pkg;

const pool = new Pool({ connectionString: POSTGRES_URI });

const connectPostgres = async () => {
  try {
    await pool.connect();
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.error("PostgreSQL connection error:", err);
    process.exit(1);
  }
};

export { pool, connectPostgres };
