const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectDb = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();

// Disable etag-based 304 responses for APIs (avoids empty-body 304 issues with some clients)
app.set('etag', false);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/resume', resumeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Career Accelerator API running' });
});

// Connect DB and start server
const PORT = process.env.PORT || 5000;

// Start server even if MongoDB fails (quiz questions come from Gemini, not DB)
connectDb()
  .then(() => {
    startServer();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    console.warn('⚠️  Server starting without MongoDB - quiz generation will work, but auth/history features may not work');
    startServer();
  });

function startServer() {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📝 Quiz questions are fetched directly from Gemini API`);
  });
}

