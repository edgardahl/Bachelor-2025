import Shift from '../models/shiftModel.js';
import { DB_TYPE } from '../config/dbConfig.js';

// ✅ Register referenced models for population
import  '../models/storeModel.js';
import '../models/qualificationModel.js'; // Only needed if you populate qualifications

// Get all shifts
// Get all shifts
// Get all shifts
export const getShifts = async (req, res) => {
  try {
    if (DB_TYPE === 'mongo') {
      const shifts = await Shift.find()
        .populate({
          path: 'applicants',
          select: 'first_name last_name email phone_number qualifications store_id',
          populate: [
            {
              path: 'store_id',  // Populate the store_id for applicants
              select: 'name',
              populate: {
                path: 'manager_ids',  // Populate the manager_ids (multiple managers)
                select: 'first_name last_name email',  // Adjust as needed
              }
            },
            {
              path: 'qualifications',
              select: 'name'
            }
          ]
        })
        .populate({
          path: 'required_qualifications',
          select: 'name'
        })
        .populate({
          path: 'store_id',  // Populate the store_id for the shift itself
          select: 'name',
          populate: {
            path: 'manager_ids',  // Populate the manager_ids for the store
            select: 'first_name last_name email',  // Adjust as needed
          }
        })
        .populate({
          path: 'posted_by_id',
          select: 'first_name last_name email phone_number'
        });

      return res.json(shifts);
    } else {
      return res.json([]); // MySQL placeholder
    }
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// Get shift by ID
export const getShift = async (req, res) => {
  const { id } = req.params;
  try {
    if (DB_TYPE === 'mongo') {
      const shift = await Shift.findById(id)
      .populate({
          path: 'required_qualifications',
          model: 'Qualification',
          select: 'name'
        })
        .populate({
          path: 'applicants',
          select: 'first_name last_name email phone_number qualifications store_id',
          populate: [
            {
              path: 'store_id',
              select: 'name'
            },
            {
              path: 'qualifications',
              select: 'name'
            }
          ]
        })
        .populate({
          path: 'store_id',
          model: 'Store',
          select: 'name'
        })
        

      if (!shift) return res.status(404).json({ error: 'Shift not found' });
      return res.json(shift);
    } else if (DB_TYPE === 'mysql') {
      return res.json({}); // Placeholder
    }
  } catch (error) {
    console.error('Error fetching shift:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new shift
export const createShift = async (req, res) => {
  try {
    if (DB_TYPE === 'mongo') {
      const { title, description, date, start_time, end_time, store_id, required_qualifications, posted_by_id } = req.body;

      // Ensure all required fields are provided
      if (!title || !description || !date || !start_time || !end_time || !store_id || !posted_by_id) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      const newShift = new Shift({
        title,
        description,
        date,
        start_time,
        end_time,
        store_id,
        required_qualifications,
        posted_by_id,
        applicants: [], // No applicants initially
        pending: [],
        claimed_by_id: null
      });

      await newShift.save();
      return res.status(201).json({ message: 'Shift created successfully', shift: newShift });
    } else {
      return res.status(400).json({ error: 'Database type not supported' });
    }
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Update shift
export const updateShift = async (req, res) => {
  const { id } = req.params;
  try {
    if (DB_TYPE === 'mongo') {
      const updated = await Shift.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
      if (!updated) return res.status(404).json({ error: 'Shift not found' });
      return res.json(updated);
    } else if (DB_TYPE === 'mysql') {
      return res.json({ message: 'Shift updated (MySQL placeholder)' });
    }
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete shift
export const deleteShift = async (req, res) => {
  const { id } = req.params;
  try {
    if (DB_TYPE === 'mongo') {
      const deleted = await Shift.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Shift not found' });
      return res.json({ message: 'Shift deleted successfully' });
    } else if (DB_TYPE === 'mysql') {
      return res.json({ message: 'Shift deleted (MySQL placeholder)' });
    }
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply to shift
export const applyToShift = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    if (DB_TYPE === 'mongo') {
      const shift = await Shift.findById(id);
      if (!shift) return res.status(404).json({ error: 'Shift not found' });

      if (shift.applicants.includes(user_id)) {
        return res.status(400).json({ error: 'Already applied' });
      }

      shift.applicants.push(user_id);
      shift.pending.push(user_id);
      await shift.save();

      return res.json({ message: 'Applied successfully', shift });
    } else if (DB_TYPE === 'mysql') {
      return res.json({ message: 'Applied (MySQL placeholder)' });
    }
  } catch (error) {
    console.error('Error applying to shift:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
