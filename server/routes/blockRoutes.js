const express = require('express');
const router = express.Router();
const TrainingBlock = require('../models/TrainingBlock');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

// Obtener bloques del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const blocks = await TrainingBlock.find({ ownerId: req.user._id.toString() });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear bloque
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, source, weeks, startDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    const newBlock = new TrainingBlock({
      title,
      description,
      ownerId: req.user._id.toString(),
      source: source || 'personal',
      startDate: startDate || new Date().toISOString().split('T')[0],
      weeks: weeks || [{
        weekNumber: 1,
        days: [{
          dayName: 'Día 1',
          isCompleted: false,
          exercises: []
        }]
      }]
    });

    await newBlock.save();
    res.status(201).json(newBlock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar bloque
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const block = await TrainingBlock.findOne({ _id: id });
    if (!block) return res.status(404).json({ error: 'Block not found' });

    const isOwner = block.ownerId.toString() === req.user._id.toString();
    const owner = await User.findById(block.ownerId);
    const isCoach = owner && owner.coachId && owner.coachId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isCoach && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Los atletas no pueden editar bloques asignados
    if (isOwner && block.source === 'assigned') {
      return res.status(403).json({ error: 'Cannot edit assigned blocks. Contact your coach for changes.' });
    }

    if (updateData.title !== undefined) block.title = updateData.title;
    if (updateData.description !== undefined) block.description = updateData.description;
    if (updateData.startDate !== undefined) block.startDate = updateData.startDate;
    if (updateData.source !== undefined) block.source = updateData.source;
    if (updateData.assignedBy !== undefined) block.assignedBy = updateData.assignedBy;

    if (updateData.weeks !== undefined) {
      block.weeks = updateData.weeks;
      block.markModified('weeks');
    }

    await block.save();
    res.json(block);
  } catch (err) {
    console.error('Error updating block:', err);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar bloque
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const block = await TrainingBlock.findById(id);
    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    if (block.ownerId === userId) {
      await TrainingBlock.deleteOne({ _id: id });
      return res.json({ success: true });
    }

    const owner = await User.findById(block.ownerId);
    if (owner && owner.coachId && owner.coachId.toString() === userId) {
      await TrainingBlock.deleteOne({ _id: id });
      return res.json({ success: true });
    }

    if (req.user.role === 'admin') {
      await TrainingBlock.deleteOne({ _id: id });
      return res.json({ success: true });
    }

    return res.status(403).json({ error: 'Unauthorized to delete this block' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
