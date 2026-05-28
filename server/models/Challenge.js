const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  points: { type: Number, default: 10 },
});

const participantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedTasks: [String],
  score: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'accepted' },
});

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['group', 'public'], default: 'group' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  category: { 
    type: String, 
    enum: ['fitness', 'study', 'coding', 'reading', 'meditation', 'diet', 'other'],
    default: 'other'
  },
  tasks: [taskItemSchema],
  participants: [participantSchema],
  maxParticipants: { type: Number, default: 50 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  duration: { type: Number, default: 30 },
  status: { type: String, enum: ['pending', 'active', 'completed', 'rejected'], default: 'active' },
  isPublic: { type: Boolean, default: false },
  image: { type: String, default: '' },
  benefits: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Challenge', challengeSchema);
