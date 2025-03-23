import mongoose from 'mongoose';
const { Schema } = mongoose;

const storeSchema = new Schema({
  name: { type: String, required: true },
  store_chain: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  address: { type: String, required: true },
  manager_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Store = mongoose.model('Store', storeSchema);
export default Store;
