import { supabase } from "../config/supabaseClient.js";

const connectDB = async () => {
  console.log("Supabase client initialized");
  return supabase;
};

export default connectDB;
