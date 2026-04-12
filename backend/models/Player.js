const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true
  },
  jerseyNumber: {
    type: Number,
    min: 1,
    max: 99
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  age: {
    type: Number,
    min: 16,
    max: 50
  },
  nationality: String,
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    faults: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    passes: { type: Number, default: 0 },
    actions: { type: Number, default: 0 },
    tackles: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 10 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', playerSchema);