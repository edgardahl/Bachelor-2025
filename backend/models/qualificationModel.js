import mongoose from 'mongoose';

const { Schema } = mongoose;

const qualificationSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true }
  }, { timestamps: true });
  

const Qualification = mongoose.model('Qualification', qualificationSchema);
export default Qualification;
