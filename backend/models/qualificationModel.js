import mongoose from 'mongoose';

const { Schema } = mongoose;

const qualificationSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

const Qualification = mongoose.model('Qualification', qualificationSchema);
export default Qualification;
