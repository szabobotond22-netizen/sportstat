const express = require('express');
const router = express.Router();
const Stadium = require('../models/Stadium');

// Get all stadiums
router.get('/', async (req, res) => {
  try {
    const stadiums = await Stadium.find().populate('teams');
    res.json(stadiums);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one stadium
router.get('/:id', async (req, res) => {
  try {
    const stadium = await Stadium.findById(req.params.id).populate('teams');
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });
    res.json(stadium);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a stadium
router.post('/', async (req, res) => {
  const stadium = new Stadium({
    name: req.body.name,
    city: req.body.city,
    capacity: req.body.capacity,
    openedYear: req.body.openedYear,
    surface: req.body.surface,
    address: req.body.address,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    photo: req.body.photo,
    teams: req.body.teams,
    averageAttendance: req.body.averageAttendance,
    lastRenovation: req.body.lastRenovation
  });

  try {
    const newStadium = await stadium.save();
    res.status(201).json(newStadium);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a stadium
router.patch('/:id', async (req, res) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });

    const fields = ['name', 'city', 'capacity', 'openedYear', 'surface', 'address',
      'latitude', 'longitude', 'photo', 'teams', 'averageAttendance', 'lastRenovation'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) stadium[field] = req.body[field];
    });
    stadium.updatedAt = Date.now();

    const updatedStadium = await stadium.save();
    res.json(updatedStadium);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a stadium
router.delete('/:id', async (req, res) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) return res.status(404).json({ message: 'Stadium not found' });

    await stadium.deleteOne();
    res.json({ message: 'Stadium deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
