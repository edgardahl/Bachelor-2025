import mongoose from 'mongoose';
const { Schema } = mongoose;

const storeSchema = new Schema({
    name: { type: String, required: true, trim: true },
    store_chain: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone_number: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    manager_ids: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }]
  }, { timestamps: true });  
  

const Store = mongoose.model('Store', storeSchema);
export default Store;
