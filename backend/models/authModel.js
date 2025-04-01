import { supabase } from "../config/supabaseClient.js";

// 🏛 Register User in Database
export const registerUserInDB = async (userData) => {
  // Insert user data into the users table
  const { data, error } = await supabase.from("users").insert([userData]).select("user_id, email, first_name, last_name");

  if (error) {
    console.error("Database error:", error);
    return null;
  }

  return data[0]; // Return the inserted user
};

// 🏛 Insert user qualifications into the junction table
export const insertUserQualifications = async (userId, qualifications) => {
  // Create an array of objects to insert into the junction table
  const userQualifications = qualifications.map((qualificationId) => ({
    user_id: userId,
    qualification_id: qualificationId
  }));

  // Insert the qualifications into the junction table
  const { data, error } = await supabase.from("user_qualifications").insert(userQualifications);

  if (error) {
    console.error("Error inserting user qualifications:", error);
    return false;
  }

  return true; // Successfully inserted qualifications
};

