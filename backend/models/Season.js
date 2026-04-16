const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['football', 'basketball', 'tennis', 'other']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  league: {
    type: String,
    required: true,
    enum: ['NB1', 'NB2', 'NB3', 'friendly', 'cup']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'finished'],
    default: 'upcoming'
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  totalMatches: {
    type: Number,
    default: 30
  },
  isActive: {
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

module.exports = mongoose.model('Season', seasonSchema);
