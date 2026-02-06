const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    role: {
      type: String,
      enum: ['frontend', 'backend', 'data', 'cybersecurity', 'fullstack', 'other'],
      required: true
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true }
  },
  { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;

