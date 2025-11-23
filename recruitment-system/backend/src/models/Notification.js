const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['interview', 'offer', 'rejection', 'general'], required: true },
  title: String,
  message: String,
  isRead: { type: Boolean, default: false },
  relatedJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  relatedApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
