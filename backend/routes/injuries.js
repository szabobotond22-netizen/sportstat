const express = require('express');
const router = express.Router();
const Injury = require('../models/Injury');
const Player = require('../models/Player');

// Get all injuries, optionally filtered by playerId or teamId
router.get('/', async (req, res) => {
  try {
    const { playerId, teamId, activeOnly } = req.query;
    const query = {};

    if (playerId) {
      query.player = playerId;
    }

    if (activeOnly === 'true') {
      query.isRecovered = false;
    }

    if (teamId) {
      const players = await Player.find({ team: teamId }).select('_id');
      query.player = { $in: players.map((player) => player._id) };
    }

    const injuries = await Injury.find(query)
      .populate('player', 'name position jerseyNumber team')
      .sort({ startDate: -1 });

    res.json(injuries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one injury
router.get('/:id', async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id).populate('player', 'name position jerseyNumber team');
    if (!injury) return res.status(404).json({ message: 'Injury not found' });
    res.json(injury);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create an injury
router.post('/', async (req, res) => {
  const injury = new Injury({
    player: req.body.player,
    injuryType: req.body.injuryType,
    bodyPart: req.body.bodyPart,
    severity: req.body.severity || 'minor',
    startDate: req.body.startDate,
    expectedReturn: req.body.expectedReturn,
    actualReturn: req.body.actualReturn,
    isRecovered: req.body.isRecovered || false,
    notes: req.body.notes
  });

  try {
    const newInjury = await injury.save();
    res.status(201).json(newInjury);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an injury
router.patch('/:id', async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    if (!injury) return res.status(404).json({ message: 'Injury not found' });

    if (req.body.injuryType) injury.injuryType = req.body.injuryType;
    if (req.body.bodyPart !== undefined) injury.bodyPart = req.body.bodyPart;
    if (req.body.severity) injury.severity = req.body.severity;
    if (req.body.startDate) injury.startDate = req.body.startDate;
    if (req.body.expectedReturn !== undefined) injury.expectedReturn = req.body.expectedReturn;
    if (req.body.actualReturn !== undefined) injury.actualReturn = req.body.actualReturn;
    if (req.body.isRecovered !== undefined) injury.isRecovered = req.body.isRecovered;
    if (req.body.notes !== undefined) injury.notes = req.body.notes;
    injury.updatedAt = Date.now();

    const updatedInjury = await injury.save();
    res.json(updatedInjury);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an injury
router.delete('/:id', async (req, res) => {
  try {
    const injury = await Injury.findById(req.params.id);
    if (!injury) return res.status(404).json({ message: 'Injury not found' });

    await injury.deleteOne();
    res.json({ message: 'Injury deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;