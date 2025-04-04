// models/userModel.js
import { supabase } from "../config/supabaseClient.js";

// Get all users from the database
export const getAllUsersModel = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, email, first_name"); // Replace 'id' with 'user_id'

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Get one user by ID from the database
export const getUserByIdModel = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, email, first_name") // Replace 'id' with 'user_id'
    .eq("user_id", id) // Adjust the column name here as well
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const getUserQualificationsModel = async (userId) => {
  const { data, error } = await supabase
    .from("user_qualifications") // Assuming this table maps users to qualifications
    .select("qualification_id")
    .eq("user_id", userId); // Get all qualifications for the user

  if (error) {
    throw new Error(error.message);
  }

  return data; // Return the user's qualifications
};

// Model function to get employees by store ID
export const getEmployeesByStoreIdModel = async (storeId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*') // Fetch all user fields or select specific ones you need
    .eq('store_id', storeId) // Filter by dynamic store_id passed as parameter
    .eq('role', 'employee'); // Only employees

  if (error) {
    console.error('Error fetching employees:', error);
    return null; // Return null in case of error
  }

  return data; // Return the list of employees
};


