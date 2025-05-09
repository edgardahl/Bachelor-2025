import {
  getAllUsersModel,
  getUserByIdModel,
  getEmployeesByStoreIdModel,
  getUserWithPasswordById,
  getAvailableEmployeesInMunicipality,
  updateUserPasswordById,
  updateUserByIdModel,
  updateUserQualificationsModel,
} from "../models/userModel.js";

import { getStoreByIdModel } from "../models/storeModel.js";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabaseClient.js";
import { sanitizeUserUpdate, sanitizePasswordUpdate } from "../utils/sanitizeInput.js";

// Henter alle brukere
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsersModel();
    return res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Henter en bruker med ID
export const getUserByIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await getUserByIdModel(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Oppdaterer bruker med ID
export const updateUserByIdController = async (req, res) => {
  const userId = req.user.userId;
  const rawData = req.body;

  const sanitized = sanitizeUserUpdate(rawData);
  if (sanitized.errors) {
    return res.status(400).json({ error: sanitized.errors });
  }
  const { email, phone_number } = sanitized;

  try {
    const currentUser = await getUserByIdModel(userId);

    if (email && email !== currentUser.email) {
      const { data: emailUsers, error: emailError } = await supabase
        .from("users")
        .select("user_id")
        .eq("email", email)
        .neq("user_id", userId);

      if (emailError) {
        console.error("Error checking email duplication:", emailError);
        return res
          .status(500)
          .json({ error: "Intern serverfeil ved sjekk av e-post." });
      }

      if (emailUsers.length > 0) {
        return res
          .status(400)
          .json({ error: { email: "E-postadressen er allerede i bruk." } });
      }
      
    }

    if (phone_number && phone_number !== currentUser.phone_number) {
      const { data: phoneUsers, error: phoneError } = await supabase
        .from("users")
        .select("user_id")
        .eq("phone_number", phone_number)
        .neq("user_id", userId);

      if (phoneError) {
        console.error("Error checking phone duplication:", phoneError);
        return res
          .status(500)
          .json({ error: "Intern serverfeil ved sjekk av telefonnummer." });
      }

      if (phoneUsers.length > 0) {
        return res
          .status(400)
          .json({ error: { phone_number: "Telefonnummeret er allerede i bruk." } });
      }
      
    }

    const updatedUser = await updateUserByIdModel(
      userId,
      {
        first_name: sanitized.first_name,
        last_name: sanitized.last_name,
        email: sanitized.email,
        phone_number: sanitized.phone_number,
        availability: sanitized.availability,
        municipality_id: sanitized.municipality_id,
      },
      sanitized.work_municipality_ids
    );

    if (!updatedUser) {
      return res.status(400).json({ error: "Oppdatering av bruker feilet." });
    }

    return res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Intern serverfeil." });
  }
};

// Endrer passord
export const changePassword = async (req, res) => {
  const userId = req.user.userId;

  const result = sanitizePasswordUpdate(req.body);
  if (result.errors) {
    return res.status(400).json({ error: result.errors });
  }

  const { currentPassword, newPassword } = result;

  try {
    const user = await getUserWithPasswordById(userId);

    if (!user || !user.password) {
      return res
        .status(404)
        .json({ error: "Bruker ikke funnet eller mangler passord." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Nåværende passord er feil." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updated = await updateUserPasswordById(userId, hashedNewPassword);

    if (!updated) {
      return res.status(500).json({ error: "Kunne ikke oppdatere passordet." });
    }

    return res.json({ message: "Passordet ble oppdatert." });
  } catch (error) {
    console.error("Feil ved oppdatering av passord:", error);
    res.status(500).json({ error: "Intern serverfeil" });
  }
};

// Henter ansatte for en butikk
export const getEmployeesByStoreIdController = async (req, res) => {
  const storeId = req.user.storeId;

  try {
    const employees = await getEmployeesByStoreIdModel(storeId);

    if (!employees || employees.length === 0) {
      return res
        .status(404)
        .json({ error: "No employees found for this store" });
    }

    return res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Henter alle tilgjengelige ansatte
export const getAvailableEmployeesController = async (req, res) => {
  try {
    const manager = await getUserByIdModel(req.user.userId);

    if (!manager || !manager.store_id) {
      return res
        .status(400)
        .json({ error: "Manager does not have a store set." });
    }

    const store = await getStoreByIdModel(manager.store_id);

    if (!store || !store.municipality_id) {
      return res
        .status(400)
        .json({ error: "Store does not have a municipality set." });
    }

    const matchingEmployees = await getAvailableEmployeesInMunicipality(
      store.municipality_id
    );

    res.json(matchingEmployees);
  } catch (error) {
    console.error("Error fetching available employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Oppdaterer kvalifikasjoner for en ansatt
export const updateEmployeeQualificationsController = async (req, res) => {
  const managerStoreId = req.user.storeId;
  const { user_id, qualification_ids } = req.body;

  if (!user_id || !Array.isArray(qualification_ids)) {
    return res
      .status(400)
      .json({ error: "user_id and qualification_ids are required." });
  }

  try {
    const employee = await getUserByIdModel(user_id);
    if (!employee || employee.store_id !== managerStoreId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this employee." });
    }

    const success = await updateUserQualificationsModel(
      user_id,
      qualification_ids
    );

    if (!success) {
      return res
        .status(500)
        .json({ error: "Failed to update qualifications." });
    }

    return res.json({ message: "Kvalifikasjoner oppdatert." });
  } catch (error) {
    console.error("Error in updateEmployeeQualificationsController:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
