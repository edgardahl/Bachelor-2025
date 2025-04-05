import {
  getAllShiftsModel,
  getShiftsByStoreModel,
  getShiftByIdModel,
  getClaimedShiftsByUserModel,
  claimShiftModel,
  createShiftModel,
  deleteShiftModel,
  getShiftsUserIsQualifiedForModel,
  getShiftByPostedByModel
} from "../models/shiftModel.js";
import { getShiftQualificationsModel } from "../models/qualificationModel.js";
import { getUserQualificationsModel } from "../models/userModel.js";
import { assignQualificationsToShift } from "./qualificationController.js";

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

// Get shift by Posted_by
export const getShiftByPostedByController = async (req, res) => {
  const { posted_by } = req.params;
  try {
    const shifts = await getShiftByPostedByModel(posted_by);
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


// Route to get claimed shifts by user ID
export const getClaimedShiftsByUserController = async (req, res) => {
  const userId = req.user.userId; // assuming verifyToken sets req.user
  console.log("User ID from token:", userId);

  try {
    const shifts = await getClaimedShiftsByUserModel(userId);
    return res.json({ data: shifts });
  } catch (error) {
    console.error("Error fetching claimed shifts for user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Claim a shift
export const claimShiftController = async (req, res) => {
  const { shift_id } = req.params; // Extract shift_id from request parameters
  const userId = req.user.userId; // User ID from the request (added by verifyToken middleware)

  try {
    // Fetch required qualifications for the shift
    const shiftQualifications = await getShiftQualificationsModel(shift_id);

    // Fetch qualifications the user has
    const userQualifications = await getUserQualificationsModel(userId);

    // Extract qualification IDs for comparison
    const shiftQualificationIds = shiftQualifications.map(
      (q) => q.qualification_id
    );
    const userQualificationIds = userQualifications.map(
      (q) => q.qualification_id
    );

    // Check if the user has exactly the required qualifications
    const hasAllQualifications =
      shiftQualificationIds.every((qualificationId) =>
        userQualificationIds.includes(qualificationId)
      ) && shiftQualificationIds.length === userQualificationIds.length;

    // If the user doesn't have the required qualifications, return an error
    if (!hasAllQualifications) {
      return res.status(403).json({
        error:
          "You don't have the required qualifications to claim this shift.",
      });
    }

    // Proceed with claiming the shift
    const claimedShift = await claimShiftModel(shift_id, userId);
    return res.json(claimedShift);
  } catch (error) {
    console.error("Error claiming shift:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new shift
export const createShiftController = async (req, res) => {
  try {
    const shiftData = req.body;
    const newShift = await createShiftModel(shiftData);

    return res.status(201).json(newShift);
  } catch (error) {
    console.error("Error creating shift:", error);
    return res.status(500).json({ error: "Internal server error" });
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
  const user_id = req.user.userId; // assuming verifyToken sets req.user
  
  try {
    const shifts = await getShiftsUserIsQualifiedForModel(user_id);
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
