import { getShiftsUserIsQualifiedForModel } from "../models/shiftModel.js";

// Get all shifts that a specific user is qualified for
export const getShiftsUserIsQualifiedForController = async (req, res) => {
  const { user_id } = req.params;  // The user_id will be passed as a URL parameter

  try {
    const shifts = await getShiftsUserIsQualifiedForModel(user_id);
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
