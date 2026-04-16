const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
<<<<<<< HEAD
    unique: true,
    trim: true
  },
=======
    trim: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['football', 'basketball', 'tennis', 'other']
  },
>>>>>>> kovi/copilot/update-database-code
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
<<<<<<< HEAD
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
=======
  isActive: {
    type: Boolean,
    default: false
>>>>>>> kovi/copilot/update-database-code
  },
  createdAt: {
    type: Date,
    default: Date.now
<<<<<<< HEAD
  },
  updatedAt: {
    type: Date,
    default: Date.now
=======
>>>>>>> kovi/copilot/update-database-code
  }
});

module.exports = mongoose.model('Season', seasonSchema);
