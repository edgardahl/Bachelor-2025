import mongoose from "mongoose";



const storeSchema = new mongoose.Schema({
  butikknavn: { type: String, required: true }, // Store name
  butikkkjede: {
    type: String,
    enum: ["Coop Obs", "Coop Bygg", "Coop Extra", "Coop Prix"],
    required: true,
  }, // Store chain
  kontaktinfo: {
    telefon: { type: String, required: true }, // Store phone number
    email: { type: String, required: true }, // Store email
  },
  butikksjef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  }, // Store manager
  adresse: { type: String, required: true }, // Store address
  openingHours: {
    monday: { type: String },
    tuesday: { type: String },
    wednesday: { type: String },
    thursday: { type: String },
    friday: { type: String },
    weekend: { type: String },
  }, // Store opening hours for each day
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model for all employees working at the store
  }],
});

// Index for store name for easy querying
storeSchema.index({ butikknavn: 1 });

const Store = mongoose.model("Store", storeSchema);

export default Store;
