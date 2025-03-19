// import { DB_TYPE } from "../config/dbConfig.js";
import Shift from "../models/shiftModel.js";

export const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find();
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
