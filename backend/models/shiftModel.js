import mongoose from 'mongoose';

const { Schema } = mongoose;

const shiftSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  required_qualifications: [{ type: Schema.Types.ObjectId, ref: 'Qualification' }],
  posted_by_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  pending: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  claimed_by_id: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Shift = mongoose.model('Shift', shiftSchema);

export default Shift;
