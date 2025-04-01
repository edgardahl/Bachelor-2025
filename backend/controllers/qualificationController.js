import { getAllQualificationsModel } from "../models/qualificationModel.js";
import { supabase } from "../config/supabaseClient.js";

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

// Assign qualifications to a shift
export const assignQualificationsToShift = async (shift_id, qualifications) => {
  const qualificationPromises = qualifications.map(async (qualification_id) => {
    const { error } = await supabase
      .from("shift_qualifications")
      .upsert([{ shift_id: shift_id, qualification_id: qualification_id }], {
        onConflict: ["shift_id", "qualification_id"], // Ensures unique shift-qualification combinations
      });

    if (error) throw new Error(error.message);
  });

  await Promise.all(qualificationPromises);
};

// Route for assigning qualifications separately
export const assignQualificationsController = async (req, res) => {
  const { shiftId, qualifications } = req.body;

  try {
    await assignQualificationsToShift(shiftId, qualifications);
    return res
      .status(201)
      .json({ message: "Qualifications successfully assigned to shift." });
  } catch (error) {
    console.error("Error assigning qualifications to shift:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
