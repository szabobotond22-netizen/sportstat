const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  phone: String,
  birthDate: Date,
  nationality: String,
  specialization: {
    type: String,
    enum: ['head_coach', 'assistant', 'goalkeeper_coach', 'fitness_coach', 'technical_director'],
    default: 'head_coach'
  },
  experience: {
    type: Number,
    default: 0
  },
  currentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  joinDate: Date,
  endDate: Date,
  licenses: [String],
  biography: String,
  achievements: [String],
  photo: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Coach', coachSchema);
