// models/userModel.js
import { supabase } from "../config/supabaseClient.js";

// Get all users from the database
export const getAllUsersModel = async () => {
  const { data, error } = await supabase.rpc("get_all_users");

  if (error) {
    console.error("Error fetching all users:", error);
    throw new Error(error.message);
  }

  return data;
};

// Get one user by ID from the database
export const getUserByIdModel = async (userId) => {
  const { data, error } = await supabase.rpc("get_user_by_id", { user_id_input: userId });

  if (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error(error.message);
  }

  return data;
};

/// Fetch qualifications for multiple users using the RPC function
export const getUserQualificationsModel = async (userIds) => {
  const { data, error } = await supabase
    .rpc("get_user_qualifications", { user_ids: userIds }); // Call the RPC function

  if (error) {
    console.error("Error fetching qualifications:", error);
    throw new Error(error.message);
  }

  return data; // Return the qualifications along with user IDs
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


