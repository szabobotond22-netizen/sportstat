const express = require('express');
const router = express.Router();
const Coach = require('../models/Coach');

// Get all coaches
router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;
    const query = teamId ? { currentTeam: String(teamId) } : {};
    const coaches = await Coach.find(query).populate('currentTeam');
    res.json(coaches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one coach
router.get('/:id', async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id).populate('currentTeam');
    if (!coach) return res.status(404).json({ message: 'Coach not found' });
    res.json(coach);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a coach
router.post('/', async (req, res) => {
  const coach = new Coach({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    birthDate: req.body.birthDate,
    nationality: req.body.nationality,
    specialization: req.body.specialization,
    experience: req.body.experience,
    currentTeam: req.body.currentTeam,
    joinDate: req.body.joinDate,
    endDate: req.body.endDate,
    licenses: req.body.licenses,
    biography: req.body.biography,
    achievements: req.body.achievements,
    photo: req.body.photo
  });

  try {
    const newCoach = await coach.save();
    res.status(201).json(newCoach);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a coach
router.patch('/:id', async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) return res.status(404).json({ message: 'Coach not found' });

    const fields = ['name', 'email', 'phone', 'birthDate', 'nationality', 'specialization',
      'experience', 'currentTeam', 'joinDate', 'endDate', 'licenses', 'biography',
      'achievements', 'photo', 'isActive'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) coach[field] = req.body[field];
    });
    coach.updatedAt = Date.now();

    const updatedCoach = await coach.save();
    res.json(updatedCoach);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a coach
router.delete('/:id', async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) return res.status(404).json({ message: 'Coach not found' });

    await coach.deleteOne();
    res.json({ message: 'Coach deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
