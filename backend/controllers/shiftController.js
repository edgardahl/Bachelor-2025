import Shift from '../models/shiftModel.js';
import { DB_TYPE } from '../config/dbConfig.js';

// ✅ Register referenced models for population
import  '../models/storeModel.js';
import '../models/qualificationModel.js'; // Only needed if you populate qualifications

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
        path: 'required_qualifications',
        select: 'name'
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
        });

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


// Create shift
export const createShift = async (req, res) => {
  try {
    if (DB_TYPE === 'mongo') {
      const newShift = await Shift.create(req.body);
      return res.status(201).json(newShift);
    } else if (DB_TYPE === 'mysql') {
      return res.status(201).json({ message: 'Shift created (MySQL placeholder)' });
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
