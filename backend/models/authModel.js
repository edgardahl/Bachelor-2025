import { supabase } from "../config/supabaseClient.js";

// 🏛 Register User in Database
export const registerUserInDB = async (userData) => {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select("user_id, email, first_name, last_name");

  if (error) {
    console.error("Database error:", error);
    return null;
  }

  return data[0];
};

// 🏛 Insert user qualifications into the junction table
export const insertUserQualifications = async (userId, qualifications) => {
  const userQualifications = qualifications.map((qualificationId) => ({
    user_id: userId,
    qualification_id: qualificationId,
  }));

  const { data, error } = await supabase
    .from("user_qualifications")
    .insert(userQualifications);

  if (error) {
    console.error("Error inserting user qualifications:", error);
    return false;
  }

  return true;
};

// ➕ Insert multiple preferred municipalities
export const insertUserMunicipalitiesModel = async (user_id, municipality_ids) => {
  console.log("Inserting preferred municipalities:", municipality_ids);
  if (!municipality_ids || municipality_ids.length === 0) return true;

  const inserts = municipality_ids.map((id) => ({
    user_id,
    municipality_id: id,
  }));

  const { error } = await supabase
    .from("user_municipality")
    .insert(inserts, { ignoreDuplicates: true });

  if (error) {
    console.error("Error inserting preferred municipalities:", error);
    return false;
  }

  return true;
};


// 📝 Check if the phone number already exists
export const getUserByPhoneNumber = async (phoneNumber) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id")
    .eq("phone_number", phoneNumber)
    .single();

  if (error) {
    console.error("Error checking phone number:", error);
    return null;
  }

  return data;
};

// 🔍 Get user by email (for login)
export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, email, password, first_name, role, store_id")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }

  return data;
};

// 🔍 Get user by ID (for /auth/me)
export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, email, first_name, role, store_id") 
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }

  return data;
};

// 🔍 Get user ID + role only (for refresh-token)
export const getUserBasicById = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, role, store_id")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching basic user by ID:", error);
    return null;
  }

  return data;
};

