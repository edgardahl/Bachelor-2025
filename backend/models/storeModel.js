import { supabase } from "../config/supabaseClient.js";

// Henter alle butikker (brukt i getAllStoresController)
export const getAllStoresModel = async () => {
  const { data, error } = await supabase
    .from("stores")
    .select(
      "store_id, name, store_chain, municipality_id, address, phone_number, email, manager_id, latitude, longitude"
    )
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// Henter alle butikker med utvidet informasjon via RPC (brukt i getAllStoresWithInfoController)
export const getAllStoresWithInfoModel = async () => {
  const { data, error } = await supabase.rpc("get_all_store_info");
  if (error) throw new Error(error.message);
  return data;
};

// Henter en butikk basert på ID (brukt i getStoreByIdController)
export const getStoreByIdModel = async (storeId) => {
  const { data, error } = await supabase
    .from("stores")
    .select(
      "store_id, name, store_chain, municipality_id, address, phone_number, email, manager_id, latitude, longitude"
    )
    .eq("store_id", storeId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getStoresByNameModel = async (storeName) => {
  const { data, error } = await supabase
    .from("stores")
    .select(
      "store_id, name, store_chain, municipality_id, address, phone_number, email, manager_id, latitude, longitude"
    )
    .ilike("name", storeName); // case-insensitive match på navn

  if (error) {
    throw new Error(error.message);
  }

  return data; // returner alle treff, ikke bare første
};

// Henter butikker med vakt-telling basert på kommune og kjede (brukt i getStoresWithMunicipalityController)
export const getStoresWithMunicipality = async (
  municipalities = [],
  storeChains = [],
  page = 1,
  pageSize = 10000
) => {
  const { data, error } = await supabase.rpc("get_stores_with_shift_count", {
    p_municipality_names: municipalities.length > 0 ? municipalities : null,
    p_store_chains: storeChains.length > 0 ? storeChains : null,
  });

  if (error) throw new Error(error.message);

  // Manuell paginering etter at alle butikker er hentet
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const validPage = Math.max(1, Math.min(page, totalPages));
  const start = (validPage - 1) * pageSize;
  const pagedData = data.slice(start, start + pageSize);

  return {
    stores: pagedData,
    total,
    page: validPage,
    pageSize,
    totalPages,
  };
};

// Henter én butikk med utvidet informasjon via RPC (brukt i getStoreWithInfoController)
export const getStoreWithFullInfoModel = async (storeId) => {
  const { data, error } = await supabase.rpc("get_full_store_info", {
    store_uuid: storeId,
  });
  if (error) throw new Error(error.message);
  return data;
};

// Oppretter ny butikk og geolokaliserer adresse (brukt i createStoreController)
export const createStoreModel = async (storeData) => {
  const {
    store_name: name,
    store_chain,
    municipality_id,
    address: rawAddress,
    postal_code,
    store_phone: phone_number,
    store_email: email,
    manager_id,
  } = storeData;

  const formattedAddress = `${rawAddress}, ${postal_code} ${name}`;
  const searchadress = `${rawAddress}, ${postal_code}`;

  // Henter koordinater fra Nominatim (OpenStreetMap)
  const geocodeRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchadress
    )}`
  );

  const geoData = await geocodeRes.json();
  if (!geoData || geoData.length === 0) {
    const error = new Error(
      "Fant ingen treff på adresse. Sjekk at adressen og postnummeret er gyldige."
    );
    error.field = "address";
    throw error;
  }

  const latitude = parseFloat(geoData[0].lat);
  const longitude = parseFloat(geoData[0].lon);

  const { data, error } = await supabase
    .from("stores")
    .insert([
      {
        name,
        store_chain,
        municipality_id,
        address: formattedAddress,
        phone_number,
        email,
        manager_id,
        latitude,
        longitude,
      },
    ])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// Oppdaterer eksisterende butikk med ny data og nye koordinater (brukt i updateStoreController)
export const updateStoreModel = async (storeId, storeData) => {
  const {
    store_name,
    store_chain,
    municipality_id,
    address: rawAddress,
    postal_code,
    store_phone: phone_number,
    store_email: email,
    manager_id,
  } = storeData;

  const name = store_name;
  const formattedAddress = `${rawAddress}, ${postal_code} ${name}`;
  const searchadress = `${rawAddress}, ${postal_code}`;

  const geocodeRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchadress
    )}`
  );
  const geoData = await geocodeRes.json();

  if (!geoData || geoData.length === 0) {
    const error = new Error(
      "Fant ingen treff på adresse. Sjekk at adressen og postnummeret er gyldige."
    );
    error.field = "address";
    throw error;
  }

  const latitude = parseFloat(geoData[0].lat);
  const longitude = parseFloat(geoData[0].lon);

  const { data, error } = await supabase
    .from("stores")
    .update({
      name,
      store_chain,
      municipality_id,
      address: formattedAddress,
      phone_number,
      email,
      manager_id,
      latitude,
      longitude,
    })
    .eq("store_id", storeId)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// Sletter en butikk basert på ID (brukt i deleteStoreController)
export const deleteStoreModel = async (storeId) => {
  const { error } = await supabase
    .from("stores")
    .delete()
    .eq("store_id", storeId);

  if (error) throw new Error(error.message);
  return true;
};
