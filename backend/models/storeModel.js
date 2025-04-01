import { supabase } from "../config/supabaseClient.js";

// Fetch all stores
export const getAllStoresModel = async () => {
  const { data, error } = await supabase
    .from("stores")
    .select("store_id, name, store_chain, municipality_id, address, phone_number, email, manager_id");

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Fetch a single store by ID
export const getStoreByIdModel = async (storeId) => {
  const { data, error } = await supabase
    .from("stores")
    .select("store_id, name, store_chain, municipality_id, address, phone_number, email, manager_id")
    .eq("store_id", storeId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
