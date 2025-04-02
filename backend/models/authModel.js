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

// ✏️ Update user profile
export const updateUserById = async (userId, updateData) => {
  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("user_id", userId)
    .select("user_id, email, first_name")
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return data;
};