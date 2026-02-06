const Skill = require('../models/Skill');
const QuizAttempt = require('../models/QuizAttempt');

exports.getOverview = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = role && role !== 'all' ? { role } : {};
    const skills = await Skill.find(filter).sort({ popularityScore: -1 }).limit(12);

    const attempts = await QuizAttempt.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10);

    res.json({
      skills,
      recentQuizAttempts: attempts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
};

