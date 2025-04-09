import {
  getAllShiftsModel,
  getShiftsByStoreModel,
  getShiftByIdModel,
  getClaimedShiftsByUserModel,
  claimShiftModel,
  createShiftModel,
  deleteShiftModel,
  getShiftsUserIsQualifiedForModel,
  getShiftByPostedByModel,
} from "../models/shiftModel.js";
import { getUserByIdModel } from "../models/userModel.js";
import { getShiftQualificationsModel } from "../models/qualificationModel.js";
import { getUserQualificationsModel } from "../models/userModel.js";

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
    console.log("Fetched shift:", shift);
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

export const claimShiftController = async (req, res) => {
  const { shift_id } = req.params;
  const userId = req.user.userId;

  console.log("Shift ID:", shift_id);
  console.log("User ID:", userId);

  if (!shift_id) {
    return res.status(400).json({ error: "Shift ID is required." });
  }

  try {
    // Fetch required qualifications for the shift
    const shiftQualifications = await getShiftQualificationsModel(shift_id);
    console.log("Shift Qualifications:", shiftQualifications);

    // Fetch user and their qualifications
    const user = await getUserByIdModel(userId);
    const userQualifications = user.qualifications || [];
    console.log("User Qualifications:", userQualifications);

    // Extract qualification IDs
    const shiftQualificationIds = shiftQualifications.map((q) => q.qualification_id);
    const userQualificationIds = userQualifications.map((q) => q.qualification_id);

    // Check if user has ALL required qualifications
    const hasAllQualifications = shiftQualificationIds.every((id) =>
      userQualificationIds.includes(id)
    );

    if (!hasAllQualifications) {
      return res.status(403).json({
        error: "You do not have the required qualifications to claim this shift.",
      });
    }

 // Claim the shift using the model
 const claimedShift = await claimShiftModel(shift_id, userId);


    return res.json({
      ...claimedShift,
      claimed_by_first_name: user.first_name,
      claimed_by_last_name: user.last_name,
      claimed_by_email: user.email,
      claimed_by_phone: user.phone_number, // fixed this
    });
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
  // Extract shift info from request body
  const { shiftId, shiftStoreId } = req.body;

  // Check if the store ID in the request matches the store ID in the JWT
  if (shiftStoreId !== req.user.storeId) {
    console.error("Store ID mismatch:", shiftStoreId, req.user.storeId);
    return res
      .status(403)
      .json({ error: "You do not have permission to delete this shift." });
  }

  try {
    // Call the delete model with the shift ID
    const deletedShift = await deleteShiftModel(shiftId);

    // Return success response if the shift is deleted
    return res.json({
      message: "Shift deleted successfully",
      deletedShift,
    });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return res.status(500).json({ error: "Internal server error" });
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
