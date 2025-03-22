import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    store: { type: String, required: true },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    shiftDate: { type: Date, required: true },
    shiftType: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening", "Night", "Full Day"],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    break: { type: String, required: true }, // e.g., "30m", "1h"
    status: {
      type: String,
      enum: ["Available", "Taken", "Pending"],
      default: "Available",
    },
    qualificationsRequired: { type: [String], required: true }, // e.g., ["Cashier", "Stock Management"]
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Manager who created the shift
      required: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Employee who claimed the shift
      default: null,
    },
    shiftNotes: { type: String, default: "" }, // Optional notes for the shift
    shiftPreferences: {
      type: [String],
      enum: ["Morning", "Afternoon", "Evening", "Night", "Full Day"],
    },
  },
  { timestamps: true }
);

// Index for store
shiftSchema.index({ store: 1 });

// Create the Shift model
const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;
