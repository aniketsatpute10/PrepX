import React, { useEffect, useState } from 'react';
import { useApi } from '../lib/api';

export default function QuizHistoryPage() {
  const api = useApi();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/quiz/history');
        setAttempts(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [api]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Quiz history</h1>
        <p className="text-xs text-slate-400 mt-1">
          Track how your interview readiness has improved over time.
        </p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-300">Loading attempts...</p>
      ) : attempts.length === 0 ? (
        <p className="text-sm text-slate-400">No quiz attempts yet. Take your first quiz!</p>
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => (
            <div key={a._id} className="card flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">
                  {a.skill} • {a.role} • {a.difficulty}
                </p>
                <p className="text-sm font-medium">
                  {a.score}% score • {a.level}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-4 text-xs text-slate-300">
                <div>
                  <p className="text-[11px] text-slate-500">Accuracy</p>
                  <p>{a.accuracy}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Correct</p>
                  <p>
                    {a.correctAnswers}/{a.totalQuestions}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

