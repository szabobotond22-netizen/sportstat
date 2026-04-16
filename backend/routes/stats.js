const express = require('express');
const router = express.Router();
const PlayerGameStat = require('../models/PlayerGameStat');

// Get all stats, optionally filtered by gameId or playerId
router.get('/', async (req, res) => {
  try {
    const { gameId, playerId, teamId } = req.query;
    const query = {};
    if (gameId) query.gameId = String(gameId);
    if (playerId) query.playerId = String(playerId);
    if (teamId) query.teamId = String(teamId);

    const stats = await PlayerGameStat.find(query)
      .populate('playerId', 'name position jerseyNumber')
      .populate('gameId', 'date homeTeam awayTeam homeTeamGoals awayTeamGoals')
      .populate('teamId', 'name sport city');
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one stat entry
router.get('/:id', async (req, res) => {
  try {
    const stat = await PlayerGameStat.findById(req.params.id)
      .populate('playerId', 'name position jerseyNumber')
      .populate('gameId', 'date homeTeam awayTeam homeTeamGoals awayTeamGoals')
      .populate('teamId', 'name sport city');
    if (!stat) return res.status(404).json({ message: 'Stat not found' });
    res.json(stat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a stat entry
router.post('/', async (req, res) => {
  const stat = new PlayerGameStat({
    gameId: req.body.gameId,
    playerId: req.body.playerId,
    teamId: req.body.teamId,
    position: req.body.position,
    minutesPlayed: req.body.minutesPlayed,
    goals: req.body.goals,
    assists: req.body.assists,
    yellowCards: req.body.yellowCards,
    redCards: req.body.redCards,
    passes: req.body.passes,
    passAccuracy: req.body.passAccuracy,
    tackles: req.body.tackles,
    interceptions: req.body.interceptions,
    fouls: req.body.fouls,
    saves: req.body.saves,
    rating: req.body.rating,
    isSubstitute: req.body.isSubstitute,
    substitutionIn: req.body.substitutionIn,
    substitutionOut: req.body.substitutionOut,
    notes: req.body.notes
  });

  try {
    const newStat = await stat.save();
    res.status(201).json(newStat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a stat entry
router.patch('/:id', async (req, res) => {
  try {
    const stat = await PlayerGameStat.findById(req.params.id);
    if (!stat) return res.status(404).json({ message: 'Stat not found' });

    const fields = ['position', 'minutesPlayed', 'goals', 'assists', 'yellowCards',
      'redCards', 'passes', 'passAccuracy', 'tackles', 'interceptions', 'fouls',
      'saves', 'rating', 'isSubstitute', 'substitutionIn', 'substitutionOut', 'notes'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) stat[field] = req.body[field];
    });

    const updatedStat = await stat.save();
    res.json(updatedStat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a stat entry
router.delete('/:id', async (req, res) => {
  try {
    const stat = await PlayerGameStat.findById(req.params.id);
    if (!stat) return res.status(404).json({ message: 'Stat not found' });

    await stat.deleteOne();
    res.json({ message: 'Stat deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
