import { DB_TYPE } from "../config/dbConfig.js";
import connectMongo from "./mongo.js";
import connectPostgres from "./postgres.js";
import { supabase } from "../config/supabaseClient.js";

let connectDB;

if (DB_TYPE === "mongo") {
  connectDB = connectMongo;
} else if (DB_TYPE === "postgres") {
  connectDB = connectPostgres;
} else if (DB_TYPE === "supabase") {
  console.log("✅ Using Supabase as the database!");
  connectDB = async () => supabase; // Return the Supabase client
} else {
  throw new Error("❌ Invalid DB_TYPE! Must be 'mongo', 'postgres', or 'supabase'.");
}

export default connectDB;
