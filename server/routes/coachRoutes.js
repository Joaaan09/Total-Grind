const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TrainingBlock = require('../models/TrainingBlock');
const Progress = require('../models/Progress');
const { authMiddleware } = require('../middleware/authMiddleware');

// Cambiar rol del usuario (athlete <-> coach)
router.put('/role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['athlete', 'coach'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findById(req.user._id);
    user.role = role;
    if (role === 'coach') user.athletes = user.athletes || [];
    await user.save();
    res.json({ success: true, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener atletas del entrenador
router.get('/athletes', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('athletes', 'name email profilePicture');
    if (user.role !== 'coach') return res.status(403).json({ error: 'Only coaches can access this' });
    res.json(user.athletes || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Añadir atleta por email (envía invitación)
router.post('/athletes', authMiddleware, async (req, res) => {
  try {
    const { athleteEmail } = req.body;
    const coach = await User.findById(req.user._id);
    if (coach.role !== 'coach') return res.status(403).json({ error: 'Only coaches can add athletes' });

    const athlete = await User.findOne({ email: athleteEmail.toLowerCase() });
    if (!athlete) return res.status(404).json({ error: 'Athlete not found' });
    if (athlete._id.toString() === coach._id.toString()) return res.status(400).json({ error: 'Cannot add yourself as athlete' });

    const existingRequest = athlete.coachRequests.find(r => r.coachId.toString() === coach._id.toString());
    if (existingRequest) return res.status(400).json({ error: 'Invitation already sent' });

    athlete.coachRequests.push({ coachId: coach._id, coachName: coach.name });
    await athlete.save();
    res.json({ success: true, message: 'Invitación enviada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar atleta
router.delete('/athletes/:athleteId', authMiddleware, async (req, res) => {
  try {
    const { athleteId } = req.params;
    const coach = await User.findById(req.user._id);
    if (coach.role !== 'coach') return res.status(403).json({ error: 'Only coaches can remove athletes' });

    coach.athletes = coach.athletes.filter(id => id.toString() !== athleteId);
    await coach.save();

    const athlete = await User.findById(athleteId);
    if (athlete && athlete.coachId?.toString() === coach._id.toString()) {
      athlete.coachId = null;
      await athlete.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener progreso de un atleta
router.get('/athletes/:athleteId/progress', authMiddleware, async (req, res) => {
  try {
    const { athleteId } = req.params;
    const coach = await User.findById(req.user._id);
    if (coach.role !== 'coach' || !coach.athletes.includes(athleteId)) return res.status(403).json({ error: 'Unauthorized' });
    const progress = await Progress.find({ userId: athleteId });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener bloques de un atleta
router.get('/athletes/:athleteId/blocks', authMiddleware, async (req, res) => {
  try {
    const { athleteId } = req.params;
    const coach = await User.findById(req.user._id);
    if (coach.role !== 'coach' || !coach.athletes.includes(athleteId)) return res.status(403).json({ error: 'Unauthorized' });
    const blocks = await TrainingBlock.find({ ownerId: athleteId });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear/Asignar bloque a un atleta
router.post('/athletes/:athleteId/blocks', authMiddleware, async (req, res) => {
  try {
    const { athleteId } = req.params;
    const coach = await User.findById(req.user._id);
    if (coach.role !== 'coach' || !coach.athletes.includes(athleteId)) return res.status(403).json({ error: 'Unauthorized' });

    const blockData = req.body;
    const newBlock = new TrainingBlock({
      ...blockData,
      ownerId: athleteId,
      source: 'assigned',
      assignedBy: coach.name
    });
    await newBlock.save();
    res.status(201).json(newBlock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
