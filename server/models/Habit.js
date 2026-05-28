const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'personal' },
  targetDays: { type: Number, default: 30 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completedDates: [{ type: Date }],
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: '⭐' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Habit', habitSchema);
