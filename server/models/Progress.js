const mongoose = require('mongoose');

const HistoryEntrySchema = new mongoose.Schema({
  date: String,
  estimatedMax: Number, // e1RM calculated from reps
  actualMax: Number     // Real max weight lifted (1 rep)
});

const ProgressSchema = new mongoose.Schema({
  userId: String,
  exerciseName: String,
  history: [HistoryEntrySchema]
});

module.exports = mongoose.model('Progress', ProgressSchema);