import mongoose from 'mongoose';
const { Schema } = mongoose;

const storeSchema = new Schema({
  name: { type: String, required: true },
  store_chain: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  address: { type: String, required: true },
  manager_ids: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],  // Updated to an array
}, { timestamps: true });

const Store = mongoose.model('Store', storeSchema);
export default Store;
