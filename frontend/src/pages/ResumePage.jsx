import React, { useRef, useState, useEffect } from 'react';
import { useApi } from '../lib/api';

const templates = [
  { value: 'classic', label: 'Classic ATS' },
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' }
];

const STORAGE_KEY = 'prepx_resume_form';
const GENERATED_STORAGE_KEY = 'prepx_generated_resumes';

export default function ResumePage() {
  const api = useApi();
  const [template, setTemplate] = useState('classic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeHtml, setResumeHtml] = useState('');
  const [resumePlainText, setResumePlainText] = useState('');
  const [cached, setCached] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [previewMode, setPreviewMode] = useState('visual'); // 'visual' or 'text'
  const previewRef = useRef(null);

  const [form, setForm] = useState({
    personal: { name: '', headline: '', location: '', email: '', phone: '' },
    skills: '',
    projects: '',
    experience: '',
    education: ''
  });

  // Load form from localStorage on mount
  useEffect(() => {
    const savedForm = localStorage.getItem(STORAGE_KEY);
    if (savedForm) {
      try {
        setForm(JSON.parse(savedForm));
      } catch (e) {
        console.error('Failed to load saved form:', e);
      }
    }
  }, []);

  // Save form to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

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

  // Validate form before submission
  const validateForm = () => {
    const errors = [];

    if (!form.personal.name.trim()) {
      errors.push('Full name is required');
    }

    if (!form.personal.headline.trim()) {
      errors.push('Headline/target role is required');
    }

    const skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skills.length === 0) {
      errors.push('At least one skill is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setCached(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
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
      setResumeHtml(res.data.html);
      setResumePlainText(res.data.plainText);
      setCached(res.data.cached || false);
      setPreviewMode('visual');

      // Save generated resume
      const generatedResumes = JSON.parse(localStorage.getItem(GENERATED_STORAGE_KEY) || '[]');
      generatedResumes.unshift({
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        template,
        html: res.data.html,
        personalName: form.personal.name
      });
      // Keep only last 5 generated resumes
      localStorage.setItem(GENERATED_STORAGE_KEY, JSON.stringify(generatedResumes.slice(0, 5)));
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate resume';
      setError(errorMsg);
      console.error('Resume generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!resumeHtml) return;

    try {
      // Dynamically load html2pdf
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        const element = document.createElement('div');
        element.innerHTML = resumeHtml;
        
        const opt = {
          margin: 10,
          filename: `${form.personal.name || 'resume'}-${new Date().getTime()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        window.html2pdf().set(opt).from(element).save();
      };
      document.head.appendChild(script);
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('Failed to generate PDF');
    }
  };

  const handleReset = () => {
    setForm({
      personal: { name: '', headline: '', location: '', email: '', phone: '' },
      skills: '',
      projects: '',
      experience: '',
      education: ''
    });
    setResumeHtml('');
    setResumePlainText('');
    setError('');
    setValidationErrors([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleClearResume = () => {
    setResumeHtml('');
    setResumePlainText('');
    setCached(false);
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
              <label className="block text-[11px] text-slate-400 mb-1">Full name *</label>
              <input
                name="name"
                value={form.personal.name}
                onChange={handlePersonalChange}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Headline / target role *</label>
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
                placeholder="e.g. New York, USA"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Email</label>
              <input
                name="email"
                type="email"
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
              Skills (comma separated) *
            </label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="React, TypeScript, Node.js, MongoDB"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              {form.skills.split(',').filter((s) => s.trim()).length} skill(s)
            </p>
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

          {validationErrors.length > 0 && (
            <div className="p-3 bg-red-950/30 border border-red-800 rounded-lg">
              <p className="text-xs text-red-300 font-medium mb-1">Please fix these errors:</p>
              <ul className="text-xs text-red-400 space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/30 border border-red-800 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Generating with AI...' : 'Generate resume with AI'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-outline"
              disabled={loading}
            >
              Reset
            </button>
          </div>

          {cached && (
            <p className="text-xs text-green-400 text-center">✓ Loaded from cache</p>
          )}
        </form>
      </div>

      <div className="card max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400">Preview & export</p>
            <p className="text-sm font-medium">
              {previewMode === 'visual' ? 'Professional resume preview' : 'Plain text version'}
            </p>
          </div>
          <div className="flex gap-2">
            {resumeHtml && (
              <div className="flex gap-1 bg-slate-900 p-1 rounded-lg">
                <button
                  onClick={() => setPreviewMode('visual')}
                  className={`text-xs px-2 py-1 rounded ${
                    previewMode === 'visual' ? 'bg-primary-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Visual
                </button>
                {resumePlainText && (
                  <button
                    onClick={() => setPreviewMode('text')}
                    className={`text-xs px-2 py-1 rounded ${
                      previewMode === 'text' ? 'bg-primary-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Text
                  </button>
                )}
              </div>
            )}
            <button
              onClick={handleDownloadPdf}
              className="btn-outline text-xs"
              disabled={!resumeHtml}
            >
              Download PDF
            </button>
            {resumeHtml && (
              <button
                onClick={handleClearResume}
                className="btn-outline text-xs text-red-400 hover:text-red-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {previewMode === 'visual' && resumeHtml ? (
          <div
            ref={previewRef}
            className="bg-white p-6 rounded-lg text-black text-sm max-h-[60vh] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: resumeHtml }}
          />
        ) : (
          <textarea
            ref={previewRef}
            value={resumePlainText}
            onChange={(e) => setResumePlainText(e.target.value)}
            placeholder={
              resumeHtml
                ? 'Plain text version will appear here'
                : 'Generated resume will appear here.'
            }
            className="w-full h-[60vh] rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs md:text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        )}
      </div>
    </div>
  );
}

