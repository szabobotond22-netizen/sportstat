const mongoose = require('mongoose');

const injurySchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  injuryType: {
    type: String,
    required: true,
    trim: true
  },
  bodyPart: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'severe'],
    default: 'minor'
  },
  startDate: {
    type: Date,
    required: true
  },
  expectedReturn: Date,
  actualReturn: Date,
  isRecovered: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('Injury', injurySchema);
const mongoose = require('mongoose');

const injurySchema = new mongoose.Schema({
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
  injuryName: {
    type: String,
    required: true,
    enum: ['strain', 'fracture', 'ligament', 'concussion', 'muscular', 'contusion', 'other']
  },
  description: String,
  injuryDate: {
    type: Date,
    required: true
  },
  estimatedReturnDate: Date,
  actualReturnDate: Date,
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'moderate'
  },
  status: {
    type: String,
    enum: ['active', 'recovering', 'recovered', 'chronic'],
    default: 'active'
=======
  injuryType: {
    type: String,
    required: true,
    trim: true
  },
  bodyPart: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'severe'],
    default: 'minor'
  },
  startDate: {
    type: Date,
    required: true
  },
  expectedReturn: Date,
  actualReturn: Date,
  isRecovered: {
    type: Boolean,
    default: false
>>>>>>> kovi/copilot/update-database-code
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

module.exports = mongoose.model('Injury', injurySchema);
