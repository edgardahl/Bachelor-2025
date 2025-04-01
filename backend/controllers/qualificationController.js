import { getAllQualificationsModel } from "../models/qualificationModel.js";

// Get all qualifications
export const getAllQualificationsController = async (req, res) => {
  try {
    const qualifications = await getAllQualificationsModel(); // Call the model function
    return res.json(qualifications); // Return the qualifications
  } catch (error) {
    console.error("Error fetching qualifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
