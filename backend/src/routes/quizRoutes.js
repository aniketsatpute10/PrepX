const express = require('express');
const { getQuestions, submitQuiz, getHistory } = require('../controllers/quizController');
const auth = require('../middleware/auth');

const router = express.Router();

// Quiz question generation is public (no auth needed)
router.get('/questions', getQuestions);
// But submission and history require auth
router.post('/submit', auth, submitQuiz);
router.get('/history', auth, getHistory);

module.exports = router;

