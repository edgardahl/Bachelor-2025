import { supabase } from "../config/supabaseClient.js";

// Fetch all stores
export const getAllStoresModel = async () => {
  const { data, error } = await supabase
    .from("stores")
    .select(
      "store_id, name, store_chain, municipality_id, address, phone_number, email, manager_id"
    );

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Fetch a single store by ID
export const getStoreByIdModel = async (storeId) => {
  const { data, error } = await supabase
    .from("stores")
    .select(
      "store_id, name, store_chain, municipality_id, address, phone_number, email, manager_id"
    )
    .eq("store_id", storeId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Fetch all stores with municipality details
export const getStoresWithMunicipality = async (
  municipality,
  county,
  page = 1,
  pageSize = 10
) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Fetch stores with municipality details
  const { data, error, count } = await supabase
    .from("stores")
    .select(
      `store_id, name, store_chain, address, phone_number, email, manager_id, 
      municipality:municipality_id (municipality_name, county_name)`,
      { count: "exact" } // Get total number of matching rows
    )
    .range(start, end);

  if (error) {
    throw new Error(error.message);
  }

  // Apply filtering in JavaScript if necessary
  let filteredData = data;
  if (municipality) {
    filteredData = filteredData.filter(
      (store) => store.municipality?.municipality_name === municipality
    );
  }
  if (county) {
    filteredData = filteredData.filter(
      (store) => store.municipality?.county_name === county
    );
  }

  return {
    stores: filteredData,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
  };
};
