import { getAllQualificationsModel } from "../models/qualificationModel.js";

// Henter alle kvalifikasjoner
export const getAllQualificationsController = async (req, res) => {
  try {
    const qualifications = await getAllQualificationsModel();
    return res.json(qualifications);
  } catch (error) {
    console.error("Error fetching qualifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
