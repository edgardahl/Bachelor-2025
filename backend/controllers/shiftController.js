import Shift from "../models/shiftModel.js";

// Get all shifts
export const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().populate('employee createdBy claimedBy');
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get one shift by ID
export const getShift = async (req, res) => {
  const { id } = req.params;
  try {
    const shift = await Shift.findById(id).populate('employee createdBy claimedBy');
    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }
    return res.json(shift);
  } catch (error) {
    console.error("Error fetching shift:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new shift
export const createShift = async (req, res) => {
  const {
    store,
    employee,
    shiftDate,
    shiftType,
    startTime,
    endTime,
    break: breakDuration,
    status,
    qualificationsRequired,
    createdBy,
    shiftNotes,
    shiftPreferences,
  } = req.body;

  try {
    const newShift = await Shift.create({
      store,
      employee,
      shiftDate,
      shiftType,
      startTime,
      endTime,
      break: breakDuration,
      status,
      qualificationsRequired,
      createdBy,
      shiftNotes,
      shiftPreferences,
    });

    return res.status(201).json(newShift);
  } catch (error) {
    console.error("Error creating shift:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update shift by ID
export const updateShift = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedShift = await Shift.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedShift) {
      return res.status(404).json({ error: "Shift not found" });
    }

    return res.json(updatedShift);
  } catch (error) {
    console.error("Error updating shift:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete shift by ID
export const deleteShift = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedShift = await Shift.findByIdAndDelete(id);

    if (!deletedShift) {
      return res.status(404).json({ error: "Shift not found" });
    }

    return res.json({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error("Error deleting shift:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
