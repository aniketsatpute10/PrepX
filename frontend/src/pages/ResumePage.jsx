import React, { useRef, useState } from 'react';
import { useApi } from '../lib/api';
import jsPDF from 'jspdf';

const templates = [
  { value: 'classic', label: 'Classic ATS' },
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' }
];

export default function ResumePage() {
  const api = useApi();
  const [template, setTemplate] = useState('classic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeText, setResumeText] = useState('');
  const previewRef = useRef(null);

  const [form, setForm] = useState({
    personal: { name: '', headline: '', location: '', email: '', phone: '' },
    skills: '',
    projects: '',
    experience: '',
    education: ''
  });

  const handlePersonalChange = (e) => {
    setForm({
      ...form,
      personal: { ...form.personal, [e.target.name]: e.target.value }
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const parseBulletList = (value) =>
    value
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        personal: form.personal,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        projects: parseBulletList(form.projects),
        experience: parseBulletList(form.experience),
        education: parseBulletList(form.education),
        template
      };
      const res = await api.post('/resume/generate', payload);
      setResumeText(res.data.content);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!resumeText) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const lines = doc.splitTextToSize(resumeText, maxWidth);
    let y = margin;

    lines.forEach((line) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 16;
    });

    doc.save('ai-career-resume.pdf');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      <div className="card space-y-4 max-h-[80vh] overflow-y-auto">
        <div>
          <h1 className="text-xl font-semibold">AI resume generator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Provide your details and let AI craft an ATS-friendly resume you can edit and export.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs md:text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Full name</label>
              <input
                name="name"
                value={form.personal.name}
                onChange={handlePersonalChange}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Headline / target role</label>
              <input
                name="headline"
                value={form.personal.headline}
                onChange={handlePersonalChange}
                placeholder="e.g. Frontend Engineer, Data Analyst"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Location</label>
              <input
                name="location"
                value={form.personal.location}
                onChange={handlePersonalChange}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Email</label>
              <input
                name="email"
                value={form.personal.email}
                onChange={handlePersonalChange}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Phone</label>
              <input
                name="phone"
                value={form.personal.phone}
                onChange={handlePersonalChange}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                {templates.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Skills (comma separated)
            </label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="React, TypeScript, Node.js, MongoDB"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Projects (one per line)
              </label>
              <textarea
                name="projects"
                rows={4}
                value={form.projects}
                onChange={handleChange}
                placeholder="- Built a full-stack job tracker...\n- Implemented a dashboard with React..."
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Experience (one bullet per line)
              </label>
              <textarea
                name="experience"
                rows={4}
                value={form.experience}
                onChange={handleChange}
                placeholder="- Frontend Engineer at X - built...\n- Backend Intern at Y - implemented..."
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Education (one bullet per line)
            </label>
            <textarea
              name="education"
              rows={3}
              value={form.education}
              onChange={handleChange}
              placeholder="- B.Tech in Computer Science, XYZ University (2020-2024)"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Generating with AI...' : 'Generate resume with AI'}
          </button>
        </form>
      </div>

      <div className="card max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400">Preview & edit</p>
            <p className="text-sm font-medium">ATS-friendly resume preview</p>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="btn-outline text-xs"
            disabled={!resumeText}
          >
            Download PDF
          </button>
        </div>
        <textarea
          ref={previewRef}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Generated resume will appear here. You can manually edit before exporting."
          className="w-full h-[60vh] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs md:text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
      </div>
    </div>
  );
}

