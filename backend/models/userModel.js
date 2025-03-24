import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, 
  role: { type: String, enum: ['store_manager', 'store_employee'], required: true },
  phone_number: { type: String, required: true },
  address: { type: String, required: true },
  availability: { type: Boolean, required: true },
  store_id: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  qualifications: [{ type: Schema.Types.ObjectId, ref: 'Qualification' }]
}, { timestamps: true });

// ✅ Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// ✅ Method to compare passwords later during login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
