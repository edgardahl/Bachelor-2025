import {
  getAllShiftsModel,
  getShiftsByStoreModel,
  getShiftByIdModel,
  createShiftModel,
  deleteShiftModel,
  getShiftsUserIsQualifiedForModel,
} from "../models/shiftModel.js";

// Get all shifts
export const getAllShiftsController = async (req, res) => {
  try {
    const shifts = await getAllShiftsModel();
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all shifts from a store
export const getShiftsByStoreController = async (req, res) => {
  const { store_id } = req.params;

  try {
    const shifts = await getShiftsByStoreModel(store_id);
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single shift by ID
export const getShiftByIdController = async (req, res) => {
  const { shift_id } = req.params;

  try {
    const shift = await getShiftByIdModel(shift_id);
    return res.json(shift);
  } catch (error) {
    console.error("Error fetching shift:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new shift
export const createShiftController = async (req, res) => {
  const shiftData = req.body;

  try {
    const newShift = await createShiftModel(shiftData);
    return res.status(201).json(newShift);
  } catch (error) {
    console.error("Error creating shift:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a shift
export const deleteShiftController = async (req, res) => {
  const { shift_id } = req.params;

  try {
    const deletedShift = await deleteShiftModel(shift_id);
    return res.json({ message: "Shift deleted successfully", deletedShift });
  } catch (error) {
    console.error("Error deleting shift:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all shifts that a specific user is qualified for
export const getShiftsUserIsQualifiedForController = async (req, res) => {
  const { user_id } = req.params; // The user_id will be passed as a URL parameter

  try {
    const shifts = await getShiftsUserIsQualifiedForModel(user_id);
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
