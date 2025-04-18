import { supabase } from "../config/supabaseClient.js";

// Fetch all stores
export const getAllStoresModel = async () => {
  const { data, error } = await supabase
    .from("stores")
    .select(
      "store_id, name, store_chain, municipality_id, address, phone_number, email, manager_id, latitude, longitude"
    );

  if (error) {
    throw new Error(error.message);
  }
  return data;
};


// Get all enriched store data from RPC
export const getAllStoresWithInfoModel = async () => {
  const { data, error } = await supabase.rpc("get_all_store_info");

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
      "store_id, name, store_chain, municipality_id, address, phone_number, email, manager_id, latitude, longitude"
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
  municipalities = [],
  counties = [],
  page = 1,
  pageSize = 10000
) => {
  // Fetch all stores without pagination for filtering
  const { data, error } = await supabase.from("stores").select(
    `store_id, name, store_chain, address, phone_number, email, manager_id,
      municipality:municipality_id (municipality_name, county_name)`
  );

  if (error) {
    throw new Error(error.message);
  }

  // Filter stores based on selected municipalities and counties
  let filteredData = data;
  if (municipalities.length > 0) {
    filteredData = filteredData.filter(
      (store) =>
        store.municipality?.municipality_name &&
        municipalities.includes(store.municipality.municipality_name)
    );
  }
  if (counties.length > 0) {
    filteredData = filteredData.filter(
      (store) =>
        store.municipality?.county_name &&
        counties.includes(store.municipality.county_name)
    );
  }

  // Calculate total pages
  const totalFiltered = filteredData.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);

  // Ensure the page is within range
  const validPage = Math.max(1, Math.min(page, totalPages));

  // Apply pagination
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



// Create a new store
export const createStoreModel = async (storeData) => {
  const { name, store_chain, municipality_id, address, phone_number, email, manager_id } = storeData;

  // Fetch coordinates using OpenStreetMap Nominatim
  const geocodeRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );
  
  const geoData = await geocodeRes.json();
  console.log("GeoData Response: ", geoData);  // Log the full response

  if (!geoData || geoData.length === 0) {
    throw new Error("Could not geocode address.");
  }

  const latitude = parseFloat(geoData[0].lat);
  const longitude = parseFloat(geoData[0].lon);

  // Log the data to be inserted
  console.log("Data to be inserted: ", {
    name,
    store_chain,
    municipality_id,
    address,
    phone_number,
    email,
    manager_id,
    latitude,
    longitude,
  });

  const { data, error } = await supabase
  .from("stores")
  .insert([
    {
      name,
      store_chain,
      municipality_id,
      address,
      phone_number,
      email,
      manager_id,
      latitude,
      longitude,
    },
  ])
  .select();  // This tells Supabase to return the inserted row

if (error) {
  console.error("Insert Error: ", error);
  throw new Error(error.message);
}

console.log("Store successfully inserted: ", data[0]);  // Data contains the inserted row now
return data[0];  // Return the inserted row

};
