const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['football', 'basketball', 'tennis', 'other']
  },
  city: {
    type: String,
    required: true
  },
  founded: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  logo: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Team', teamSchema);