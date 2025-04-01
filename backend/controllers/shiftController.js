import {
  getAllShiftsModel,
  getShiftsByStoreModel,
  getShiftByIdModel,
  getClaimedShiftsModel,
  claimShiftModel,
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

// Get all claimed shifts
export const getClaimedShiftsController = async (req, res) => {
  try {
    const claimedShifts = await getClaimedShiftsModel();
    return res.json(claimedShifts);
  } catch (error) {
    console.error("Error fetching claimed shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Claim a shift
export const claimShiftController = async (req, res) => {
  const { shift_id } = req.params; // Extract shift_id from request parameters
  const userId = req.user.userId; // User ID from the request (added by verifyToken middleware)

  try {
    const claimedShift = await claimShiftModel(shift_id, userId);
    return res.json(claimedShift);
  } catch (error) {
    console.error("Error claiming shift:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new shift
export const createShiftController = async (req, res) => {
  const shiftData = req.body; // Shift data from request body
  const userId = req.user.userId; // User ID from the request (added by verifyToken middleware)

  try {
    // Pass both shiftData and userId to the model
    const newShift = await createShiftModel(shiftData, userId);

    // Send response back to the client with the created shift
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
