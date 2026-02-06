import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../lib/api';
import { useAuth } from '../state/AuthContext';

const difficulties = [
  { value: 'easy', label: 'Beginner' },
  { value: 'medium', label: 'Intermediate' },
  { value: 'hard', label: 'Advanced' }
];

export default function QuizPage() {
  const api = useApi();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    skill: '',
    role: user?.role || 'frontend',
    difficulty: 'easy'
  });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let interval;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && timerRunning && questions.length) {
      handleSubmit();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning, timeLeft, questions.length]);

  const startQuiz = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setAnswers({});
    try {
      const res = await api.get('/quiz/questions', {
        params: {
          role: filters.role,
          difficulty: filters.difficulty,
          skill: filters.skill || undefined,
          limit: 8
        }
      });
      setQuestions(res.data);
      setTimeLeft(res.data.length * 45); // 45s per question
      setTimerRunning(true);
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message?.includes('CONNECTION_REFUSED')) {
        setError('Cannot connect to backend server. Make sure it is running on port 5000.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to start quiz');
      }
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qid, index) => {
    setAnswers((prev) => ({ ...prev, [qid]: index }));
  };

  const handleSubmit = async () => {
    if (!questions.length) return;
    setSubmitLoading(true);
    setTimerRunning(false);
    setError('');
    try {
      const payload = {
        skill: filters.skill || questions[0]?.skill,
        role: filters.role,
        difficulty: filters.difficulty,
        questions: questions, // Send full question data since we're not storing in DB
        answers: questions.map((q) => ({
          questionId: q._id,
          selectedIndex:
            typeof answers[q._id] === 'number'
              ? answers[q._id]
              : // unanswered questions count as incorrect
                -1
        }))
      };
      const res = await api.post('/quiz/submit', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitLoading(false);
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Interview readiness quiz</h1>
          <p className="text-xs text-slate-400 mt-1">
            Timed quiz with categorized questions. Get instant score, accuracy and strengths.
          </p>
        </div>
        <Link
          to="/quiz/history"
          className="text-xs text-primary-300 hover:text-primary-200 underline-offset-2"
        >
          View quiz history →
        </Link>
      </div>

      <form
        onSubmit={startQuiz}
        className="card grid grid-cols-1 md:grid-cols-4 gap-3 items-end text-xs md:text-sm"
      >
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Role</label>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="data">Data</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="fullstack">Fullstack</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Skill (optional)</label>
          <input
            value={filters.skill}
            onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            placeholder="e.g. React, Node.js"
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Difficulty</label>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            {difficulties.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary w-full md:w-auto" disabled={loading}>
          {loading ? 'Loading questions...' : questions.length ? 'Restart quiz' : 'Start quiz'}
        </button>
      </form>

      {error && (
        <div className="card bg-red-950/20 border-red-500/40">
          <p className="text-xs text-red-400 font-medium mb-1">Error loading quiz</p>
          <p className="text-xs text-red-300">{error}</p>
          {error.includes('CONNECTION_REFUSED') && (
            <p className="text-xs text-red-200 mt-2">
              Make sure the backend server is running on port 5000
            </p>
          )}
        </div>
      )}

      {loading && !questions.length && (
        <div className="card text-center py-8">
          <p className="text-sm text-slate-300">Loading questions...</p>
        </div>
      )}

      {!loading && !error && questions.length === 0 && (
        <div className="card bg-amber-950/20 border-amber-500/40">
          <p className="text-xs text-amber-400 font-medium mb-1">No questions available</p>
          <p className="text-xs text-amber-300">
            No questions found for {filters.role} / {filters.difficulty}
            {filters.skill && ` / ${filters.skill}`}. Try a different combination or check if Gemini
            API key is configured for AI generation.
          </p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <p>{questions.length} questions • ~{questions.length * 0.75} min</p>
            <p>
              Time left:{' '}
              <span className={timeLeft < 30 ? 'text-red-400' : 'text-emerald-400'}>
                {mins}:{secs.toString().padStart(2, '0')}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q._id} className="card">
                <p className="text-[11px] text-slate-500 mb-1">
                  Question {idx + 1} • {q.skill} • {q.difficulty}
                </p>
                <p className="text-sm mb-3">{q.question}</p>
                <div className="space-y-2 text-xs">
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      className={`flex items-start gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                        answers[q._id] === i
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q._id}
                        className="mt-0.5 accent-primary-500"
                        checked={answers[q._id] === i}
                        onChange={() => handleAnswerChange(q._id, i)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={submitLoading || !questions.length}
            >
              {submitLoading ? 'Submitting...' : 'Submit quiz'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="card mt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-slate-400">Quiz result</p>
              <p className="text-lg font-semibold">
                {result.score}% • {result.level}
              </p>
            </div>
            <div className="flex gap-4 text-xs text-slate-300">
              <div>
                <p className="text-[11px] text-slate-500">Accuracy</p>
                <p className="font-medium">{result.accuracy}%</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Correct</p>
                <p className="font-medium">
                  {result.correctAnswers}/{result.totalQuestions}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[11px] text-slate-500 mb-1">Strengths</p>
              <div className="flex flex-wrap gap-1">
                {result.strengths.length ? (
                  result.strengths.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">No strong areas yet.</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 mb-1">Weak areas</p>
              <div className="flex flex-wrap gap-1">
                {result.weaknesses.length ? (
                  result.weaknesses.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/40"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">Great job – no weak tags detected.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

