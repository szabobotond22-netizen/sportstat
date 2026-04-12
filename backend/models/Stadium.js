const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  city: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  openedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  surface: {
    type: String,
    enum: ['grass', 'artificial', 'hybrid'],
    default: 'grass'
  },
  address: String,
  latitude: Number,
  longitude: Number,
  photo: String,
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  averageAttendance: {
    type: Number,
    default: 0
  },
  lastRenovation: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Stadium', stadiumSchema);
