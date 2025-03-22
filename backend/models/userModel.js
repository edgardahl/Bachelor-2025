import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fornavn: { type: String, required: true }, // First name
  etternavn: { type: String, required: true }, // Last name
  email: { type: String, required: true, unique: true },
  telefon: { type: String, required: true }, // Phone number
  adresse: { type: String, required: true }, // Address
  rolle: {
    type: String,
    enum: ["butikksjef", "butikkansatt"],
    required: true, // Store manager or store employee
  },
  kompetanse: {
    type: [String],
    enum: ["kasse", "tørrvare", "frukt/grønt", "lager", "bakery", "butikkoppfølging"],
  },
  employmentStatus: {
    type: String,
    enum: ["Deltid", "Tilkalling"],
    required: true, // Part-time or on-call
  },
  fødselsdag: { type: Date, required: true }, // Date of birth
  butikk: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store", // Relational reference to a store
    required: true,
  },
  hireDate: { type: Date, default: Date.now }, // Date of hiring
});

// Virtual field for full name
userSchema.virtual("fullName").get(function () {
  return `${this.fornavn} ${this.etternavn}`;
});

// Index for store
userSchema.index({ butikk: 1 });

const User = mongoose.model("User", userSchema);

export default User;
