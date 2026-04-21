const express = require('express');
const router = express.Router();
const TrainingBlock = require('../models/TrainingBlock');
const Progress = require('../models/Progress');
const { authMiddleware } = require('../middleware/authMiddleware');

// PUT /api/days/:dayId - Actualizar un día específico (sesión de entrenamiento)
router.put('/:dayId', authMiddleware, async (req, res) => {
  try {
    const { dayId } = req.params;
    const dayData = req.body;
    const userId = req.user._id.toString();

    const blocks = await TrainingBlock.find({ ownerId: userId });

    let found = false;
    let targetBlock = null;

    for (const block of blocks) {
      for (const week of block.weeks) {
        for (let i = 0; i < week.days.length; i++) {
          const day = week.days[i];
          if (day._id.toString() === dayId || day.id === dayId) {
            week.days[i].exercises = dayData.exercises;
            week.days[i].isCompleted = dayData.isCompleted !== undefined ? dayData.isCompleted : true;
            week.days[i].athleteNotes = dayData.athleteNotes;
            if (dayData.description !== undefined) {
              week.days[i].description = dayData.description;
            }
            found = true;
            targetBlock = block;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }

    if (found && targetBlock) {
      targetBlock.markModified('weeks');
      await targetBlock.save();

      // Generar datos de progreso para levantamientos de competición
      const today = new Date().toISOString().split('T')[0];
      const COMPETITION_LIFTS = ['Comp SQ', 'Comp BP', 'Comp DL'];

      for (const exercise of dayData.exercises) {
        if (!COMPETITION_LIFTS.includes(exercise.name)) continue;
        if (!exercise.sets || exercise.sets.length === 0) continue;

        let bestE1RM = 0;
        let actualMax = 0;

        for (const set of exercise.sets) {
          if (set.weight && set.reps) {
            const weight = Number(set.weight);
            const reps = Number(set.reps);

            if (!isNaN(weight) && !isNaN(reps) && reps > 0 && weight > 0) {
              if (weight > actualMax) actualMax = weight;

              const rpe = Number(set.rpe) || 10;
              const e1rm = Math.round(weight * (1 + (reps + (10 - rpe)) / 30));
              if (e1rm > bestE1RM) bestE1RM = e1rm;
            }
          }
        }

        if (bestE1RM > 0 || actualMax > 0) {
          let progress = await Progress.findOne({ userId, exerciseName: exercise.name });
          if (!progress) {
            progress = new Progress({ userId, exerciseName: exercise.name, history: [] });
          }

          const existingEntryIndex = progress.history.findIndex(h => h.date === today);
          if (existingEntryIndex >= 0) {
            const entry = progress.history[existingEntryIndex];
            if (bestE1RM > (entry.estimatedMax || 0)) entry.estimatedMax = bestE1RM;
            if (actualMax > (entry.actualMax || 0)) entry.actualMax = actualMax;
          } else {
            progress.history.push({ date: today, estimatedMax: bestE1RM, actualMax });
          }

          progress.markModified('history');
          await progress.save();
        }
      }

      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Day not found' });
    }
  } catch (err) {
    console.error('Error updating day:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
