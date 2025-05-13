import { supabase } from "../config/supabaseClient.js";

// Henter alle brukere fra RPC (brukt i getAllUsersController)
export const getAllUsersModel = async () => {
  const { data, error } = await supabase.rpc("get_all_users");
  if (error) throw new Error(error.message);
  return data;
};

// Henter alle butikksjefer med tilknyttet butikk (brukt i getAllStoreManagersController)
export const getAllStoreManagersWithStoreModel = async () => {
  const { data, error } = await supabase.rpc(
    "get_all_store_managers_with_store"
  );
  if (error) throw new Error(error.message);
  return data;
};

// Henter en bruker med info basert på ID (brukt i getUserByIdController)
export const getUserByIdModel = async (userId) => {
  const { data, error } = await supabase.rpc("get_user_by_id", {
    user_id_input: userId,
  });
  if (error) throw new Error(error.message);
  return data?.[0];
};

// Oppdaterer en bruker og deres foretrukne kommuner (brukt i updateUserByIdController)
export const updateUserByIdModel = async (
  id,
  updates,
  municipality_ids = []
) => {
  let userData = null;

  if (Object.keys(updates).length > 0) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("user_id", id)
      .select("user_id, email, first_name")
      .maybeSingle();
    if (error) return null;
    userData = data;
  }

  const { error: deleteError } = await supabase
    .from("user_municipality")
    .delete()
    .eq("user_id", id);
  if (deleteError) return null;

  if (Array.isArray(municipality_ids) && municipality_ids.length > 0) {
    const insertRows = municipality_ids.map((municipality_id) => ({
      user_id: id,
      municipality_id,
    }));
    const { error: insertError } = await supabase
      .from("user_municipality")
      .insert(insertRows);
    if (insertError) return null;
  }

  return userData || {};
};

// Sletter en bruker fra databasen (brukt i deleteUserByIdController)
export const deleteUserByIdModel = async (userId) => {
  const { error } = await supabase.from("users").delete().eq("user_id", userId);
  if (error) return false;
  return true;
};

// Henter tilgjengelige ansatte i spesifikk kommune (brukt i getAvailableEmployeesController)
export const getAvailableEmployeesInMunicipality = async (municipalityId) => {
  const { data, error } = await supabase.rpc(
    "get_available_employees_in_municipality",
    {
      municipality_input: municipalityId,
    }
  );
  if (error) throw new Error(error.message);
  return data;
};

// Henter alle ansatte i en butikk med kvalifikasjoner som en string (brukt i getEmployeesByStoreIdController)
export const getEmployeesByStoreIdModel = async (storeId) => {
  const { data, error } = await supabase.rpc(
    "get_employees_in_store_with_qualifications",
    {
      store_id: storeId,
    }
  );
  if (error) return null;
  return data;
};

// Henter butikksjefer i en spesifikk butikk (brukt i getStoreManagersController)
export const getManagersByStoreId = async (storeId) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, first_name, last_name, email")
    .eq("role", "store_manager")
    .eq("store_id", storeId);
  if (error) throw new Error(error.message);
  return data;
};

// Henter kvalifikasjoner til ansatte (brukt i getUserById og andre)
export const getUserQualificationsModel = async (userIds = []) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("userIds must be a non-empty array");
  }

  const { data, error } = await supabase
    .from("user_qualifications")
    .select("user_id, qualification_id")
    .in("user_id", userIds);

  if (error) throw new Error(error.message);
  return data;
};

// Oppdaterer kvalifikasjoner for en ansatt (brukt i updateEmployeeQualificationsController)
export const updateUserQualificationsModel = async (
  user_id,
  qualification_ids
) => {
  const { error: deleteError } = await supabase
    .from("user_qualifications")
    .delete()
    .eq("user_id", user_id);
  if (deleteError) return false;

  const inserts = qualification_ids.map((qid) => ({
    user_id,
    qualification_id: qid,
  }));

  const { error: insertError } = await supabase
    .from("user_qualifications")
    .insert(inserts);
  if (insertError) return false;

  return true;
};

// Henter bruker med passord (brukt i changePasswordController)
export const getUserWithPasswordById = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, password")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
};

// Oppdaterer brukerens passord (brukt i changePasswordController)
export const updateUserPasswordById = async (userId, hashedPassword) => {
  const { data, error } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("user_id", userId)
    .select("user_id")
    .single();
  if (error) return null;
  return data;
};
