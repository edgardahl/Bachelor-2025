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

// Fetch stores with pagination and filtering by municipality and county
export const getStoresWithMunicipality = async (
  municipality,
  county,
  page = 1,
  pageSize = 10
) => {
  // Fetch all stores without pagination for filtering
  const { data, error, count } = await supabase.from("stores").select(
    `store_id, name, store_chain, address, phone_number, email, manager_id,
      municipality:municipality_id (municipality_name, county_name)`
  );

  if (error) {
    throw new Error(error.message);
  }

  // Filter stores based on the selected municipality and county
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

  // Calculate the total number of pages
  const totalFiltered = filteredData.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);

  // Ensure the page doesn't exceed the total pages
  const validPage = page > totalPages ? totalPages : page;

  // Apply pagination on filtered data
  const start = (validPage - 1) * pageSize;
  const end = start + pageSize;
  const pagedData = filteredData.slice(start, end);

  return {
    stores: pagedData,
    total: totalFiltered,
    page: validPage,
    pageSize,
    totalPages,
  };
};
