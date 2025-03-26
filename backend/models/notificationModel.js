import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema({
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    status: {
      type: String,
      enum: ['seen', 'not_seen'],
      required: true,
      default: 'not_seen'
    },
    receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  }, { timestamps: true });
  

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
