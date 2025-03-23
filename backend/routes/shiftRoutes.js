import express from 'express';
import {
  getShifts,
  getShift,
  createShift,
  updateShift,
  deleteShift,
  applyToShift
} from '../controllers/shiftController.js';

const router = express.Router();

router.get('/', getShifts);
router.post('/new', createShift);
router.get('/:id', getShift);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);
router.post('/:id/apply', applyToShift);

export default router;
