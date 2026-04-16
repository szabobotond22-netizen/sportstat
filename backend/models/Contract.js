const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  team: {
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
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  isActive: {
    type: Boolean,
    default: true
  },
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
const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
<<<<<<< HEAD
  playerId: {
=======
  player: {
>>>>>>> kovi/copilot/update-database-code
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
<<<<<<< HEAD
  teamId: {
=======
  team: {
>>>>>>> kovi/copilot/update-database-code
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
<<<<<<< HEAD
    default: 0
  },
  contractType: {
    type: String,
    enum: ['permanent', 'loan', 'trial', 'youth'],
    default: 'permanent'
=======
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR'
>>>>>>> kovi/copilot/update-database-code
  },
  isActive: {
    type: Boolean,
    default: true
  },
<<<<<<< HEAD
  renewalOption: {
    type: Boolean,
    default: false
  },
  releaseClause: Number,
=======
>>>>>>> kovi/copilot/update-database-code
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
