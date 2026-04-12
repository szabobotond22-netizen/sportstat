const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  homeTeamGoals: { type: Number, default: 0 },
  awayTeamGoals: { type: Number, default: 0 },
  date: {
    type: Date,
    required: true
  },
  stadium: String,
  referee: String,
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'finished', 'cancelled'],
    default: 'scheduled'
  },
  sport: {
    type: String,
    required: true,
    enum: ['football', 'basketball', 'tennis', 'other'],
    default: 'football'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);