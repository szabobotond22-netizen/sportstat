const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Get all players or players by team
router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;
    const query = teamId ? { team: teamId } : {};
    const players = await Player.find(query).populate('team');
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one player
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('team');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a player
router.post('/', async (req, res) => {
  const player = new Player({
    name: req.body.name,
    position: req.body.position,
    jerseyNumber: req.body.jerseyNumber,
    team: req.body.team,
    age: req.body.age,
    nationality: req.body.nationality,
    stats: req.body.stats
  });

  try {
    const newPlayer = await player.save();
    res.status(201).json(newPlayer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a player
router.patch('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });

    if (req.body.name) player.name = req.body.name;
    if (req.body.position) player.position = req.body.position;
    if (req.body.jerseyNumber !== undefined) player.jerseyNumber = req.body.jerseyNumber;
    if (req.body.team) player.team = req.body.team;
    if (req.body.age) player.age = req.body.age;
    if (req.body.nationality) player.nationality = req.body.nationality;

    // Update stats individually
    if (req.body.stats) {
      if (req.body.stats.gamesPlayed !== undefined) player.stats.gamesPlayed = req.body.stats.gamesPlayed;
      if (req.body.stats.goals !== undefined) player.stats.goals = req.body.stats.goals;
      if (req.body.stats.assists !== undefined) player.stats.assists = req.body.stats.assists;
      if (req.body.stats.points !== undefined) player.stats.points = req.body.stats.points;
      if (req.body.stats.faults !== undefined) player.stats.faults = req.body.stats.faults;
      if (req.body.stats.yellowCards !== undefined) player.stats.yellowCards = req.body.stats.yellowCards;
      if (req.body.stats.redCards !== undefined) player.stats.redCards = req.body.stats.redCards;
      if (req.body.stats.passes !== undefined) player.stats.passes = req.body.stats.passes;
      if (req.body.stats.actions !== undefined) player.stats.actions = req.body.stats.actions;
      if (req.body.stats.tackles !== undefined) player.stats.tackles = req.body.stats.tackles;
      if (req.body.stats.saves !== undefined) player.stats.saves = req.body.stats.saves;
      if (req.body.stats.minutesPlayed !== undefined) player.stats.minutesPlayed = req.body.stats.minutesPlayed;
      if (req.body.stats.rating !== undefined) player.stats.rating = req.body.stats.rating;
    }

    const updatedPlayer = await player.save();
    res.json(updatedPlayer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a player
router.delete('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });

    await player.remove();
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;