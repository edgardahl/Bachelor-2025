import { supabase } from "../config/supabaseClient.js";
import { getUserQualificationsModel } from "./userModel.js";

// Henter bruker basert på e-post (brukes ved innlogging)
export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, email, password, first_name, role, store_id")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }

  return data;
};

// Henter bruker basert på telefonnummer (for å sjekke duplikater ved registrering)
export const getUserByPhoneNumber = async (phoneNumber) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id")
    .eq("phone_number", phoneNumber)
    .single();

  if (error) {
    console.error("Error checking phone number:", error);
    return null;
  }

  return data;
};

// Henter bruker basert på ID og inkluderer kvalifikasjoner (for /auth/me)
export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, email, first_name, role, store_id")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user by ID:", error);
    return null;
  }

  try {
    const userQualifications = await getUserQualificationsModel([data.user_id]);
    const qualificationIds = userQualifications.map((q) => q.qualification_id);
    return {
      ...data,
      user_qualifications: qualificationIds,
    };
  } catch (err) {
    console.error("Error fetching user qualifications:", err);
    return {
      ...data,
      user_qualifications: [],
    };
  }
};

// Henter kun ID, rolle og butikk (for refresh-token)
export const getUserBasicById = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, role, store_id")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching basic user by ID:", error);
    return null;
  }

  return data;
};

// Registrerer ny bruker i databasen
export const registerUserInDB = async (userData) => {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select("user_id, email, first_name, last_name");

  if (error) {
    console.error("Database error:", error);
    return null;
  }

  return data[0];
};

// Oppretter koblinger i junction table 'user_qualifications' mellom bruker og kvalifikasjoner
export const insertUserQualifications = async (userId, qualifications) => {
  const userQualifications = qualifications.map((qualificationId) => ({
    user_id: userId,
    qualification_id: qualificationId,
  }));

  const { data, error } = await supabase
    .from("user_qualifications")
    .insert(userQualifications);

  if (error) {
    console.error("Error inserting user qualifications:", error);
    return false;
  }

  return true;
};
