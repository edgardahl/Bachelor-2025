// database/index.js
// ✅ Only using Supabase now, so no need for dynamic DB switching
import { supabase } from '../config/supabaseClient.js';

const connectDB = async () => {
  console.log('✅ Supabase client initialized');
  return supabase;
};

export default connectDB;