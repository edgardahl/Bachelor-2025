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
  getPreferredQualifiedShiftsModel,
  getRequestedQualifiedShiftsModel,
} from "../models/shiftModel.js";
import {
  newShiftPublishedNotificationModel,
  notifyStoreManagerOnShiftClaimedModel,
} from "../models/notificationModel.js";
import { getUserByIdModel } from "../models/userModel.js";
import { getShiftQualificationsModel } from "../models/qualificationModel.js";
import { sanitizeShift } from "../utils/sanitizeInput.js";

export const getAllShiftsController = async (req, res) => {
  try {
    const shifts = await getAllShiftsModel();
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

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

export const getClaimedShiftsByUserController = async (req, res) => {
  const userId = req.user.userId;
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
    const shiftQualifications = await getShiftQualificationsModel(shift_id);
    console.log("Shift Qualifications:", shiftQualifications);

    const user = await getUserByIdModel(userId);
    const userQualifications = user.qualifications || [];
    console.log("User Qualifications:", userQualifications);

    const shiftQualificationIds = shiftQualifications.map(
      (q) => q.qualification_id
    );
    const userQualificationIds = userQualifications.map(
      (q) => q.qualification_id
    );

    const hasAllQualifications = shiftQualificationIds.every((id) =>
      userQualificationIds.includes(id)
    );

    if (!hasAllQualifications) {
      return res.status(403).json({
        error:
          "You do not have the required qualifications to claim this shift.",
      });
    }

    const claimedShift = await claimShiftModel(shift_id, userId);

    await notifyStoreManagerOnShiftClaimedModel(shift_id, userId);

    return res.json({
      ...claimedShift,
      claimed_by_first_name: user.first_name,
      claimed_by_last_name: user.last_name,
      claimed_by_email: user.email,
      claimed_by_phone: user.phone_number,
    });
  } catch (error) {
    console.error("Error claiming shift:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createShiftController = async (req, res) => {
  try {
    const shiftData = req.body;

    let sanitizedShiftData;
    try {
      sanitizedShiftData = sanitizeShift(shiftData);
    } catch (sanitizeError) {
      return res
        .status(400)
        .json({ error: { general: sanitizeError.message } });
    }

    if (sanitizedShiftData.errors) {
      console.log("Sanitized data errors:", sanitizedShiftData.errors);
      return res.status(400).json({ error: sanitizedShiftData.errors });
    }

    const newShift = await createShiftModel(shiftData);

    const fullShiftData = {
      ...newShift,
      qualifications: shiftData.qualifications,
    };
    await newShiftPublishedNotificationModel(fullShiftData);

    return res.status(201).json({
      message: "Vakt opprettet!",
      shift: newShift,
    });
  } catch (error) {
    console.error("Feil ved oppretting av vakt:", error);
    return res.status(500).json({
      error: "Noe gikk galt under oppretting av vakten.",
    });
  }
};

export const deleteShiftController = async (req, res) => {
  const { shiftId, shiftStoreId } = req.body;

  if (shiftStoreId !== req.user.storeId) {
    return res.status(403).json({
      error: "Du har ikke tillatelse til å slette denne vakten.",
    });
  }

  try {
    const deletedShift = await deleteShiftModel(shiftId);
    return res.json({
      message: "Vakt slettet.",
      deletedShift,
    });
  } catch (error) {
    console.error("Feil ved sletting av vakt:", error);
    return res.status(500).json({
      error: "Noe gikk galt under sletting av vakten.",
    });
  }
};

export const getShiftsUserIsQualifiedForController = async (req, res) => {
  const user_id = req.user.userId;

  try {
    const shifts = await getShiftsUserIsQualifiedForModel(user_id);
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPreferredQualifiedShiftsController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const shifts = await getPreferredQualifiedShiftsModel(userId);
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching preferred shifts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getRequestedQualifiedShiftsController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await getUserByIdModel(userId);

    const municipalityIds = user?.municipalities?.map((m) => m.municipality_id);

    if (!municipalityIds || municipalityIds.length === 0) {
      return res
        .status(400)
        .json({ error: "User has no associated municipalities." });
    }

    const shifts = await getRequestedQualifiedShiftsModel(
      userId,
      municipalityIds
    );
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching requested municipality shifts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
