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
