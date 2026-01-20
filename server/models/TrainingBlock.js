const mongoose = require('mongoose');

const ExerciseSetSchema = new mongoose.Schema({
  reps: { type: mongoose.Schema.Types.Mixed }, // String o Number
  rpe: Number,
  weight: Number,
  targetRpe: Number,
  targetReps: String,
  estimated1rm: Number,
  isCompleted: { type: Boolean, default: false }
});

const ExerciseSchema = new mongoose.Schema({
  name: String,
  dayId: String, // Manteniendo IDs string para correlación, aunque Mongo genera _id
  notes: String,
  sets: [ExerciseSetSchema]
});

const TrainingDaySchema = new mongoose.Schema({
  dayName: String,
  weekId: String,
  isCompleted: { type: Boolean, default: false },
  exercises: [ExerciseSchema]
});

const TrainingWeekSchema = new mongoose.Schema({
  weekNumber: Number,
  blockId: String,
  days: [TrainingDaySchema]
});

const TrainingBlockSchema = new mongoose.Schema({
  title: String,
  ownerId: String,
  source: { type: String, enum: ['personal', 'assigned'] },
  assignedBy: String,
  startDate: String,
  weeks: [TrainingWeekSchema]
});

module.exports = mongoose.model('TrainingBlock', TrainingBlockSchema);