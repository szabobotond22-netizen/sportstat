const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  salary: {
    type: Number,
    default: 0
  },
  contractType: {
    type: String,
    enum: ['permanent', 'loan', 'trial', 'youth'],
    default: 'permanent'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  renewalOption: {
    type: Boolean,
    default: false
  },
  releaseClause: Number,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contract', contractSchema);
