const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TrainingBlock = require('../models/TrainingBlock');
const Progress = require('../models/Progress');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Estadísticas generales del sistema
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAthletes = await User.countDocuments({ role: 'athlete' });
    const totalCoaches = await User.countDocuments({ role: 'coach' });
    const totalBlocks = await TrainingBlock.countDocuments();
    res.json({ totalUsers, totalAthletes, totalCoaches, totalBlocks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todos los usuarios
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role profilePicture createdAt coachId')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear usuario
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Todos los campos son requeridos' });
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    if (role === 'admin') return res.status(400).json({ error: 'No se puede crear usuarios admin via API' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ error: 'Ya existe un usuario con este email' });

    const user = new User({ email: email.toLowerCase(), password, name, role: role || 'athlete' });
    await user.save();

    res.status(201).json({ success: true, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Obtener detalle de un usuario (bloques, progreso, mejores marcas)
router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').populate('coachId', 'name email');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const blocks = await TrainingBlock.find({ ownerId: id });
    const progress = await Progress.find({ userId: id });

    const COMPETITION_LIFTS = ['Comp SQ', 'Comp BP', 'Comp DL'];
    const bestLifts = {};

    for (const lift of COMPETITION_LIFTS) {
      const liftProgress = progress.find(p => p.exerciseName === lift);
      if (liftProgress && liftProgress.history.length > 0) {
        let bestEstimated = 0;
        let bestActual = 0;
        for (const entry of liftProgress.history) {
          if (entry.estimatedMax > bestEstimated) bestEstimated = entry.estimatedMax;
          if (entry.actualMax > bestActual) bestActual = entry.actualMax;
        }
        bestLifts[lift] = { estimated: bestEstimated, actual: bestActual };
      } else {
        bestLifts[lift] = { estimated: 0, actual: 0 };
      }
    }

    const totalEstimated = (bestLifts['Comp SQ']?.estimated || 0) + (bestLifts['Comp BP']?.estimated || 0) + (bestLifts['Comp DL']?.estimated || 0);
    const totalActual = (bestLifts['Comp SQ']?.actual || 0) + (bestLifts['Comp BP']?.actual || 0) + (bestLifts['Comp DL']?.actual || 0);

    res.json({ user, blocks, progress, bestLifts: { ...bestLifts, Total: { estimated: totalEstimated, actual: totalActual } } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modificar usuario
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (role === 'admin') return res.status(400).json({ error: 'Cannot set admin role via API' });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role && ['athlete', 'coach'].includes(role)) user.role = role;

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar contraseña de usuario
router.post('/users/:id/change-password', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Cannot change admin password' });

    user.password = password;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar usuario y todos sus datos
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Cannot delete admin user' });

    await TrainingBlock.deleteMany({ ownerId: id });
    await Progress.deleteMany({ userId: id });

    if (user.role === 'coach') {
      await User.updateMany({ coachId: id }, { $set: { coachId: null } });
    }
    if (user.coachId) {
      await User.updateOne({ _id: user.coachId }, { $pull: { athletes: id } });
    }

    await User.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener atletas de un entrenador
router.get('/users/:id/athletes', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const coach = await User.findById(id);
    if (!coach) return res.status(404).json({ error: 'Coach not found' });
    if (coach.role !== 'coach') return res.status(400).json({ error: 'User is not a coach' });

    const athletes = await User.find({ coachId: id }).select('_id name email profilePicture createdAt');
    res.json(athletes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Asignar atleta a un entrenador
router.post('/users/:id/athletes', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { athleteId } = req.body;
    if (!athleteId) return res.status(400).json({ error: 'athleteId is required' });

    const coach = await User.findById(id);
    if (!coach || coach.role !== 'coach') return res.status(400).json({ error: 'Invalid coach' });

    const athlete = await User.findById(athleteId);
    if (!athlete || athlete.role !== 'athlete') return res.status(400).json({ error: 'Invalid athlete' });

    if (athlete.coachId && athlete.coachId.toString() !== id) {
      await User.updateOne({ _id: athlete.coachId }, { $pull: { athletes: athleteId } });
    }

    athlete.coachId = id;
    await athlete.save();
    await User.updateOne({ _id: id }, { $addToSet: { athletes: athleteId } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quitar atleta de un entrenador
router.delete('/users/:id/athletes/:athleteId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id, athleteId } = req.params;
    const athlete = await User.findById(athleteId);
    if (!athlete) return res.status(404).json({ error: 'Athlete not found' });
    if (athlete.coachId?.toString() !== id) return res.status(400).json({ error: 'Athlete does not belong to this coach' });

    athlete.coachId = undefined;
    await athlete.save();
    await User.updateOne({ _id: id }, { $pull: { athletes: athleteId } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un bloque específico
router.get('/blocks/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const block = await TrainingBlock.findById(id);
    if (!block) return res.status(404).json({ error: 'Block not found' });
    res.json(block);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear bloque para un usuario
router.post('/blocks', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { ownerId, title, startDate } = req.body;
    if (!ownerId || !title) return res.status(400).json({ error: 'ownerId and title are required' });

    const owner = await User.findById(ownerId);
    if (!owner) return res.status(404).json({ error: 'User not found' });

    const newBlock = new TrainingBlock({
      title,
      ownerId,
      source: 'assigned',
      assignedBy: req.user._id.toString(),
      startDate: startDate || new Date().toISOString().split('T')[0],
      weeks: [{ weekNumber: 1, days: [{ dayName: 'Día 1', isCompleted: false, exercises: [] }] }]
    });

    await newBlock.save();
    res.status(201).json(newBlock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
