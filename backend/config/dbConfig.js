import dotenv from "dotenv";

dotenv.config();

export const DB_TYPE = process.env.DB_TYPE || "supabase"; // Default to Supabase
export const MONGO_URI = process.env.MONGO_URI;
export const POSTGRES_URI = process.env.POSTGRES_URI;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;
