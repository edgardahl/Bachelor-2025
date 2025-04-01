// controllers/userController.js
import { getAllUsersModel, getUserByIdModel } from "../models/userModel.js";

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


