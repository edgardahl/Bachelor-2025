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

// Henter alle store managers, uavhengig av butikk
export const getAllStoreManagersWithStoreModel = async () => {
  const { data, error } = await supabase.rpc("get_all_store_managers_with_store");

  if (error) {
    console.error("Error fetching store managers with store info:", error);
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
export const updateUserByIdModel = async (
  id,
  updates,
  municipality_ids = []
) => {
  // 1. Update main user info
  const { data: userData, error: userError } = await supabase
    .from("users")
    .update(updates)
    .eq("user_id", id)
    .select("user_id, email, first_name")
    .single();

  if (userError || !userData) {
    console.error("Supabase error updating user:", userError);
    return null;
  }

  // 2. Replace preferred municipalities
  const { error: deleteError } = await supabase
    .from("user_municipality")
    .delete()
    .eq("user_id", id);

  if (deleteError) {
    console.error("Error clearing user_municipality:", deleteError);
    return null;
  }

  if (municipality_ids.length > 0) {
    const insertRows = municipality_ids.map((municipality_id) => ({
      user_id: id,
      municipality_id,
    }));

    const { error: insertError } = await supabase
      .from("user_municipality")
      .insert(insertRows);

    if (insertError) {
      console.error("Error inserting user municipalities:", insertError);
      return null;
    }
  }

  return userData;
};

export const getAvailableEmployeesInMunicipality = async (municipalityId) => {
  const { data, error } = await supabase.rpc(
    "get_available_employees_in_municipality",
    {
      municipality_input: municipalityId,
    }
  );

  if (error) {
    console.error("Error fetching available employees:", error);
    throw new Error(error.message);
  }

  return data;
};

// Get employees by store ID
export const getEmployeesByStoreIdModel = async (storeId) => {
  const { data, error } = await supabase.rpc(
    "get_employees_in_store_with_qualifications",
    { store_id: storeId }
  );

  if (error) {
    console.error("Error fetching employees with qualifications:", error);
    return null; // If error occurs, return null
  }

  return data; // Return the data which contains employees and their qualifications
};

export const getManagersByStoreId = async (storeId) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, first_name, last_name, email")
    .eq("role", "store_manager")
    .eq("store_id", storeId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};


// Get user qualifications
export const getUserQualificationsModel = async (userIds = []) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("userIds must be a non-empty array");
  }

  const { data, error } = await supabase
    .from("user_qualifications")
    .select("user_id, qualification_id")
    .in("user_id", userIds);

  if (error) {
    console.error("Error fetching qualifications:", error);
    throw new Error(error.message);
  }

  return data;
};

// Update employee qualifications
export const updateUserQualificationsModel = async (
  user_id,
  qualification_ids
) => {
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
