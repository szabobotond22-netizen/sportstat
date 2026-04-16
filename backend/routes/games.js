const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// Get all games or games by team
router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;
    let query = {};
    if (teamId) {
      query = {
        $or: [
          { homeTeam: teamId },
          { awayTeam: teamId }
        ]
      };
    }
    const games = await Game.find(query).populate('homeTeam awayTeam');
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one game
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('homeTeam awayTeam');
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a game
router.post('/', async (req, res) => {
  const game = new Game({
    homeTeam: req.body.homeTeam,
    awayTeam: req.body.awayTeam,
    homeTeamGoals: req.body.homeTeamGoals || 0,
    awayTeamGoals: req.body.awayTeamGoals || 0,
    date: req.body.date,
    stadium: req.body.stadium,
    referee: req.body.referee,
    status: req.body.status || 'scheduled',
    sport: req.body.sport || 'football'
  });

  try {
    const newGame = await game.save();
    res.status(201).json(newGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a game
router.patch('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    if (req.body.homeTeam) game.homeTeam = req.body.homeTeam;
    if (req.body.awayTeam) game.awayTeam = req.body.awayTeam;
    if (req.body.date) game.date = req.body.date;
    if (req.body.stadium) game.stadium = req.body.stadium;
    if (req.body.referee) game.referee = req.body.referee;
    if (req.body.homeTeamGoals !== undefined) game.homeTeamGoals = req.body.homeTeamGoals;
    if (req.body.awayTeamGoals !== undefined) game.awayTeamGoals = req.body.awayTeamGoals;
    if (req.body.status) game.status = req.body.status;
    if (req.body.sport) game.sport = req.body.sport;

    const updatedGame = await game.save();
    res.json(updatedGame);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a game
router.delete('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    await game.deleteOne();
    res.json({ message: 'Game deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;