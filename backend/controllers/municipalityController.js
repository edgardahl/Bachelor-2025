// controllers/municipalityController.js
import { getAllMunicipalitiesModel } from "../models/municipalityModel.js";

// Get all municipalities
export const getAllMunicipalitiesController = async (req, res) => {
  try {
    const municipalities = await getAllMunicipalitiesModel();
    return res.json(municipalities);
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
