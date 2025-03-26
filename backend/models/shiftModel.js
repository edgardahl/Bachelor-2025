import mongoose from 'mongoose';

const { Schema } = mongoose;

const shiftSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  store_id: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  required_qualifications: [{ type: Schema.Types.ObjectId, ref: 'Qualification' }],
  posted_by_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  pending: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  claimed_by_id: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Shift = mongoose.model('Shift', shiftSchema);

export default Shift;
