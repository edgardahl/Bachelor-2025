// models/municipalityModel.js
import { supabase } from "../config/supabaseClient.js";

// Get all municipalities
export const getAllMunicipalitiesModel = async () => {
  const { data, error } = await supabase
    .from("municipality")
    .select("municipality_id, municipality_name");

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
