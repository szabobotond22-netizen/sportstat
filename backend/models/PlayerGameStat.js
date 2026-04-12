const mongoose = require('mongoose');

const playerGameStatSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  position: String,
  minutesPlayed: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },
  passes: { type: Number, default: 0 },
  passAccuracy: { type: Number, default: 0 },
  tackles: { type: Number, default: 0 },
  interceptions: { type: Number, default: 0 },
  fouls: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 10 },
  isSubstitute: { type: Boolean, default: false },
  substitutionIn: Number,
  substitutionOut: Number,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlayerGameStat', playerGameStatSchema);
