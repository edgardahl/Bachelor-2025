import {
  getAllUsersModel,
  getUserByIdModel,
  getEmployeesByStoreIdModel,
  getUserQualificationsModel,
  getUserWithPasswordById,
  updateUserPasswordById,
  updateUserByIdModel,
  updateUserQualificationsModel,
} from "../models/userModel.js";

import bcrypt from "bcryptjs";

// Get all users
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsersModel();
    return res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get one user by ID
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

// Update user by ID
export const updateUserByIdController = async (req, res) => {
  const userId = req.user.userId;
  const { first_name, last_name, email, phone_number, availability } = req.body;

  try {
    const updatedUser = await updateUserByIdModel(userId, {
      first_name,
      last_name,
      email,
      phone_number,
      availability,
    });

    if (!updatedUser) {
      return res.status(400).json({ error: "Failed to update user" });
    }

    return res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Both current and new passwords are required." });
  }

  try {
    const user = await getUserWithPasswordById(userId);

    if (!user || !user.password) {
      return res
        .status(404)
        .json({ error: "User not found or missing password." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updated = await updateUserPasswordById(userId, hashedNewPassword);

    if (!updated) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    return res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get employees by store ID
export const getEmployeesByStoreIdController = async (req, res) => {
  const storeId = req.user.storeId;

  try {
    const employees = await getEmployeesByStoreIdModel(storeId);

    if (!employees || employees.length === 0) {
      return res.status(404).json({ error: "No employees found for this store" });
    }

    return res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch qualifications for multiple users
export const getEmployeesQualificationsController = async (req, res) => {
  try {
    const { user_ids } = req.body;

    if (!user_ids || user_ids.length === 0) {
      return res.status(400).json({ error: "No user IDs provided." });
    }

    const qualifications = await getUserQualificationsModel(user_ids);

    if (!qualifications || qualifications.length === 0) {
      return res.status(404).json({ error: "No qualifications found for these users." });
    }

    return res.json(qualifications);
  } catch (error) {
    console.error("Error fetching qualifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update employee qualifications
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
      return res.status(403).json({ error: "You are not authorized to update this employee." });
    }

    const success = await updateUserQualificationsModel(user_id, qualification_ids);

    if (!success) {
      return res.status(500).json({ error: "Failed to update qualifications." });
    }

    return res.json({ message: "Kvalifikasjoner oppdatert." });
  } catch (error) {
    console.error("Error in updateEmployeeQualificationsController:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
