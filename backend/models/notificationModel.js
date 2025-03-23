const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    status: { type: String, enum: ['seen', 'not_seen'], required: true },
    receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
