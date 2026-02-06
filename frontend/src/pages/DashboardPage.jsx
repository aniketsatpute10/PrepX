import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../lib/api';
import { useAuth } from '../state/AuthContext';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const roleFilters = [
  { value: 'all', label: 'All roles' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'data', label: 'Data' },
  { value: 'cybersecurity', label: 'Cybersecurity' }
];

export default function DashboardPage() {
  const api = useApi();
  const { user } = useAuth();
  const [role, setRole] = useState('all');
  const [data, setData] = useState({ skills: [], recentQuizAttempts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/dashboard/overview', { params: { role } });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role, api]);

  const salaryChartData = data.skills.map((s) => ({
    name: s.name,
    entry: s.salaryRanges.find((r) => r.level === 'entry')?.max || 0,
    mid: s.salaryRanges.find((r) => r.level === 'mid')?.max || 0,
    senior: s.salaryRanges.find((r) => r.level === 'senior')?.max || 0
  }));

  const demandChartData = data.skills.map((s) => ({
    name: s.name,
    beginner: s.demandRanges.find((d) => d.level === 'beginner')?.demandScore || 0,
    intermediate: s.demandRanges.find((d) => d.level === 'intermediate')?.demandScore || 0,
    advanced: s.demandRanges.find((d) => d.level === 'advanced')?.demandScore || 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            Hi {user?.name?.split(' ')[0] || 'there'}, let&apos;s accelerate your career
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Explore in-demand skills, salary ranges, and interview readiness in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            {roleFilters.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Link to="/quiz" className="btn-primary text-xs md:text-sm">
            Take interview quiz
          </Link>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {loading ? (
        <div className="mt-6 text-sm text-slate-300">Loading personalized insights...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-xs text-slate-400 mb-1">Trending skills</p>
              <p className="text-lg font-semibold mb-3">
                {data.skills.length ? data.skills[0].name : 'React, Node.js, Python'}
              </p>
              <p className="text-xs text-slate-400">
                Based on your selected role, these skills are seeing the highest demand right now.
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-slate-400 mb-1">Interview readiness</p>
              {data.recentQuizAttempts[0] ? (
                <>
                  <p className="text-lg font-semibold mb-1">
                    {data.recentQuizAttempts[0].score}% score
                  </p>
                  <p className="text-xs text-slate-400">
                    Latest quiz: {data.recentQuizAttempts[0].skill} (
                    {data.recentQuizAttempts[0].level})
                  </p>
                  <Link
                    to="/quiz/history"
                    className="inline-block mt-3 text-xs text-primary-300 hover:text-primary-200"
                  >
                    View detailed history →
                  </Link>
                </>
              ) : (
                <p className="text-xs text-slate-400">
                  Take your first quiz to get a personalized readiness score.
                </p>
              )}
            </div>
            <div className="card">
              <p className="text-xs text-slate-400 mb-1">Resume strength</p>
              <p className="text-lg font-semibold mb-3">AI-optimized resumes</p>
              <p className="text-xs text-slate-400">
                Generate ATS-friendly resumes tailored to your skills and target role.
              </p>
              <Link
                to="/resume"
                className="inline-block mt-3 text-xs text-primary-300 hover:text-primary-200"
              >
                Build your AI resume →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400">Salary ranges per skill</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">₹ / year</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderRadius: 12,
                        border: '1px solid #1e293b',
                        fontSize: 11
                      }}
                    />
                    <Bar dataKey="entry" stackId="a" fill="#22c55e" />
                    <Bar dataKey="mid" stackId="a" fill="#0ea5e9" />
                    <Bar dataKey="senior" stackId="a" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400">Skill demand by proficiency</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Demand score</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={demandChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderRadius: 12,
                        border: '1px solid #1e293b',
                        fontSize: 11
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="beginner"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#22c55e40"
                    />
                    <Area
                      type="monotone"
                      dataKey="intermediate"
                      stackId="1"
                      stroke="#0ea5e9"
                      fill="#0ea5e940"
                    />
                    <Area
                      type="monotone"
                      dataKey="advanced"
                      stackId="1"
                      stroke="#a855f7"
                      fill="#a855f740"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

