const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const { generateQuizQuestions } = require('../services/geminiQuizGenerator');

exports.getQuestions = async (req, res) => {
  try {
    // const { skill, role, difficulty, limit = 10 } = req.query;
    const { role, difficulty, skill = 'general', limit } = req.query;

    // Always return fresh JSON; do not allow caching for dynamic quiz generation.
    res.set('Cache-Control', 'no-store, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    // Fetch questions directly from Gemini API - no database lookup
    if (!role || !difficulty) {
      return res.status(400).json({ message: 'Role and difficulty are required' });
    }

    // Use provided skill or derive a default from role
    const skillToUse = skill || (role === 'frontend' ? 'JavaScript' : role === 'backend' ? 'Node.js' : role === 'data' ? 'Python' : role === 'cybersecurity' ? 'Network Security' : role === 'fullstack' ? 'MERN Stack' : 'General');

    const desired = Number(limit);
    console.log(`Fetching ${desired} questions directly from Gemini API for ${role}/${difficulty}/${skillToUse}`);

    const { questions: generated, usedAI, reason } = await generateQuizQuestions({
      role,
      difficulty,
      skill: skillToUse,
      count: desired
    });

    if (!usedAI) {
      return res.status(503).json({ 
        message: 'Gemini API not configured',
        error: reason || 'GEMINI_API_KEY not set or package not installed'
      });
    }

    if (generated.length === 0) {
      return res.status(503).json({ 
        message: 'Failed to generate questions',
        error: reason || 'Gemini API returned no usable questions'
      });
    }

    // Add temporary IDs for frontend compatibility (since we're not storing in DB)
    const questionsWithIds = generated.map((q, idx) => ({
      ...q,
      _id: `temp_${Date.now()}_${idx}` // Temporary ID for frontend
    }));

    console.log(`Successfully generated ${questionsWithIds.length} questions from Gemini API`);
    res.json(questionsWithIds);
  } catch (err) {
    console.error('Error in getQuestions:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
      message: 'Failed to fetch questions from Gemini API',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { answers, skill, role, difficulty, questions: questionData } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'No answers submitted' });
    }

    // Since questions are not stored in DB, we need question data in the request
    // Create a map of questionId -> question for quick lookup
    const questionMap = new Map();
    if (Array.isArray(questionData)) {
      questionData.forEach((q) => {
        questionMap.set(q._id || q.id, q);
      });
    }

    let correct = 0;
    const strengths = [];
    const weaknesses = [];

    answers.forEach((ans) => {
      const q = questionMap.get(ans.questionId);
      if (!q) {
        console.warn(`Question ${ans.questionId} not found in submitted data`);
        return;
      }
      if (q.correctIndex === ans.selectedIndex) {
        correct += 1;
        strengths.push(q.skill);
      } else {
        weaknesses.push(q.skill);
      }
    });

    const total = answers.length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const score = accuracy;

    let level = 'Beginner';
    if (accuracy >= 75) level = 'Advanced';
    else if (accuracy >= 45) level = 'Intermediate';

    const attempt = await QuizAttempt.create({
      user: req.user.id,
      skill,
      role,
      difficulty,
      totalQuestions: total,
      correctAnswers: correct,
      accuracy,
      score,
      strengths: Array.from(new Set(strengths)),
      weaknesses: Array.from(new Set(weaknesses)),
      level
    });

    res.json(attempt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch quiz history' });
  }
};

