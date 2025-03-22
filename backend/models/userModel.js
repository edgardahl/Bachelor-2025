import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // `unique: true` creates a unique index
  phone: { type: String, required: true },
  role: {
    type: String,
    enum: ["Cashier", "Stock Associate", "Floor Manager", "Sales Associate"],
    required: true,
  },
  store: { type: String, required: true },
  shiftPreferences: {
    type: [String],
    enum: ["Morning", "Afternoon", "Evening", "Night", "Full Day"],
  },
  skills: { type: [String] },
  availability: {
    monday: { type: String },
    tuesday: { type: String },
    wednesday: { type: String },
    thursday: { type: String },
    friday: { type: String },
    weekend: { type: String },
  },
  employmentStatus: {
    type: String,
    enum: ["Full-Time", "Part-Time", "Temporary"],
    required: true,
  },
  hireDate: { type: Date, default: Date.now },
});

// Virtual field for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for store
userSchema.index({ store: 1 });

const User = mongoose.model("User", userSchema);

export default User;
