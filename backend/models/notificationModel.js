import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  status: { type: String, enum: ['seen', 'not_seen'], required: true },
  receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
