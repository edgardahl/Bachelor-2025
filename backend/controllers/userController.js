// controllers/userController.js
import { getAllUsersModel, getUserByIdModel, getEmployeesByStoreIdModel, getUserQualificationsModel } from "../models/userModel.js";
import jwt from 'jsonwebtoken';

// Get all users
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsersModel();  // Call the model function
    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get one user by ID
export const getUserByIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await getUserByIdModel(id);  // Call the model function
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get employees by store ID for store managers
export const getEmployeesByStoreIdController = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get the token from Authorization header

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    // Decode the token to get the store_id from the access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const storeId = decoded.storeId; // Extract storeId from the decoded token

    const employees = await getEmployeesByStoreIdModel(storeId);

    if (!employees || employees.length === 0) {
      return res.status(404).json({ error: 'No employees found for this store' });
    }

    return res.json(employees); // Return the list of employees
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get qualifications for multiple users (employees)
export const getEmployeesQualificationsController = async (req, res) => {
  try {
    const { user_ids } = req.body; // The request body should include a list of user_ids

    if (!user_ids || user_ids.length === 0) {
      return res.status(400).json({ error: "No user IDs provided." });
    }

    const qualifications = await getUserQualificationsModel(user_ids); // Fetch qualifications for multiple users

    // Check if qualifications are found
    if (!qualifications || qualifications.length === 0) {
      return res.status(404).json({ error: "No qualifications found for these users." });
    }

    return res.json(qualifications); // Return the qualifications as response
  } catch (error) {
    console.error("Error fetching qualifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};







