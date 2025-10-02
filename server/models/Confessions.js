const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['about_yourself', 'secret'],
    required: true
  },
  emotionalScore: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  ticketsAwarded: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Confession', confessionSchema);