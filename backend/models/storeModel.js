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
// export const getStoresWithMunicipality = async (
//   municipality,
//   county,
//   page = 1,
//   pageSize = 10
// ) => {
//   const start = (page - 1) * pageSize;
//   const end = start + pageSize - 1;

//   // Fetch stores with municipality details
//   const { data, error, count } = await supabase
//     .from("stores")
//     .select(
//       `store_id, name, store_chain, address, phone_number, email, manager_id,
//       municipality:municipality_id (municipality_name, county_name)`,
//       { count: "exact" } // Get total number of matching rows
//     )
//     .range(start, end);

//   if (error) {
//     throw new Error(error.message);
//   }

//   // Apply filtering in JavaScript if necessary
//   let filteredData = data;
//   if (municipality) {
//     filteredData = filteredData.filter(
//       (store) => store.municipality?.municipality_name === municipality
//     );
//   }
//   if (county) {
//     filteredData = filteredData.filter(
//       (store) => store.municipality?.county_name === county
//     );
//   }

//   return {
//     stores: filteredData,
//     total: count,
//     page,
//     pageSize,
//     totalPages: Math.ceil(count / pageSize),
//   };
// };

// export const getStoresWithMunicipality = async (
//   municipality,
//   county,
//   page = 1,
//   pageSize = 10
// ) => {
//   const start = (page - 1) * pageSize;
//   const end = start + pageSize - 1;

//   let query = supabase.from("stores").select(
//     `store_id, name, store_chain, address, phone_number, email, manager_id,
//       municipality:municipality_id (municipality_name, county_name)`,
//     { count: "exact" } // Fetch total count
//   );

//   // Ensure only stores with a matching county are returned
//   if (county) {
//     query = query.eq("municipality.county_name", county);
//   }
//   if (municipality) {
//     query = query.eq("municipality.municipality_name", municipality);
//   }

//   // Apply pagination
//   query = query.range(start, end);

//   // Execute the query
//   const { data, error, count } = await query;

//   if (error) {
//     throw new Error(error.message);
//   }

//   // Filter out stores where municipality is null (just in case)
//   const filteredStores = data.filter((store) => store.municipality !== null);

//   return {
//     stores: filteredStores,
//     total: count,
//     page,
//     pageSize,
//     totalPages: Math.ceil(count / pageSize),
//   };
// };

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
