import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, enum: ['store_manager', 'store_employee'], required: true },
  phone_number: { type: String, required: true },
  address: { type: String, required: true },
  availability: { type: Boolean, required: true },
  store_id: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  qualifications: [{ type: Schema.Types.ObjectId, ref: 'Qualification' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
