const mongoose = require('mongoose');

const injurySchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
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
