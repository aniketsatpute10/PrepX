const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: String, required: true },
    role: {
      type: String,
      enum: ['frontend', 'backend', 'data', 'cybersecurity', 'fullstack', 'other'],
      required: true
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    score: { type: Number, required: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true }
  },
  { timestamps: true }
);

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = QuizAttempt;

