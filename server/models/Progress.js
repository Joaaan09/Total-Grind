const mongoose = require('mongoose');

const HistoryEntrySchema = new mongoose.Schema({
  date: String,
  estimatedMax: Number, // e1RM calculado a partir de repeticiones
  actualMax: Number     // Peso máximo real levantado (1 rep)
});

const ProgressSchema = new mongoose.Schema({
  userId: String,
  exerciseName: String,
  history: [HistoryEntrySchema]
});

module.exports = mongoose.model('Progress', ProgressSchema);