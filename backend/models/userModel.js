import { supabase } from "../config/supabaseClient.js";

// Get all users
export const getAllUsersModel = async () => {
  const { data, error } = await supabase.rpc("get_all_users");

  if (error) {
    console.error("Error fetching all users:", error);
    throw new Error(error.message);
  }

  return data;
};

// Get user by ID
export const getUserByIdModel = async (userId) => {
  const { data, error } = await supabase.rpc("get_user_by_id", {
    user_id_input: userId,
  });

  if (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error(error.message);
  }

  return data?.[0];
};

// Update user
export const updateUserByIdModel = async (id, updates) => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("user_id", id)
    .select("user_id, email, first_name")
    .single();

  if (error || !data) {
    console.error("Supabase error in updateUserByIdModel:", error);
    return null;
  }

  return data;
};

// Get employees by store ID
export const getEmployeesByStoreIdModel = async (storeId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("store_id", storeId)
    .eq("role", "employee");

  if (error) {
    console.error("Error fetching employees:", error);
    return null;
  }

  return data;
};

// Get user qualifications
export const getUserQualificationsModel = async (userIds) => {
  const { data, error } = await supabase.rpc("get_user_qualifications", {
    user_ids: userIds,
  });

  if (error) {
    console.error("Error fetching qualifications:", error);
    throw new Error(error.message);
  }

  return data;
};

// Update employee qualifications
export const updateUserQualificationsModel = async (user_id, qualification_ids) => {
  const { error: deleteError } = await supabase
    .from("user_qualifications")
    .delete()
    .eq("user_id", user_id);

  if (deleteError) {
    console.error("Error deleting qualifications:", deleteError);
    return false;
  }

  const inserts = qualification_ids.map((qid) => ({
    user_id,
    qualification_id: qid,
  }));

  const { error: insertError } = await supabase
    .from("user_qualifications")
    .insert(inserts);

  if (insertError) {
    console.error("Error inserting qualifications:", insertError);
    return false;
  }

  return true;
};

// Get user (including password) for password change
export const getUserWithPasswordById = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, password")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user with password:", error);
    return null;
  }

  return data;
};

// Update password
export const updateUserPasswordById = async (userId, hashedPassword) => {
  const { data, error } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("user_id", userId)
    .select("user_id")
    .single();

  if (error) {
    console.error("Error updating password:", error);
    return null;
  }

  return data;
};
