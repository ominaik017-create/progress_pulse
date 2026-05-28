const mongoose = require('mongoose');

const countdownSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetDate: { type: Date, required: true },
  type: { type: String, enum: ['exam', 'meeting', 'deadline', 'event', 'other'], default: 'other' },
  color: { type: String, default: '#6366f1' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Countdown', countdownSchema);
