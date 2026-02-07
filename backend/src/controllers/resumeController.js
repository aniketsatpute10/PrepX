const OpenAI = require('openai');
const crypto = require('crypto');
const { generateResumeHTML } = require('../services/resumeTemplates');

// Simple in-memory cache for resumes (can be replaced with Redis for production)
const resumeCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

// Generate a cache key from the input data
function generateCacheKey(personal, skills, projects, experience, education, template) {
  const data = JSON.stringify({ personal, skills, projects, experience, education, template });
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Check and retrieve from cache
function getCachedResume(cacheKey) {
  const cached = resumeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }
  if (cached) {
    resumeCache.delete(cacheKey); // Remove expired cache
  }
  return null;
}

// Store in cache
function setCacheResume(cacheKey, content) {
  resumeCache.set(cacheKey, { content, timestamp: Date.now() });
}

// Validate input data
function validateInput(personal, skills, projects, experience, education) {
  const errors = [];

  if (!personal?.name || personal.name.trim().length === 0) {
    errors.push('Full name is required');
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    errors.push('At least one skill is required');
  }

  if (!personal?.headline || personal.headline.trim().length === 0) {
    errors.push('Headline/target role is required');
  }

  return errors;
}

// Format data efficiently for the prompt
function formatResumeData(personal, skills, projects, experience, education) {
  const sections = [];

  sections.push(`NAME: ${personal.name || 'N/A'}`);
  sections.push(`HEADLINE: ${personal.headline || 'N/A'}`);

  if (personal.location) sections.push(`LOCATION: ${personal.location}`);
  if (personal.email) sections.push(`EMAIL: ${personal.email}`);
  if (personal.phone) sections.push(`PHONE: ${personal.phone}`);

  if (skills && skills.length > 0) {
    sections.push(`\nKEYS SKILLS: ${skills.join(', ')}`);
  }

  if (experience && experience.length > 0) {
    sections.push(`\nEXPERIENCE:\n${experience.map((e, i) => `${i + 1}. ${e}`).join('\n')}`);
  }

  if (projects && projects.length > 0) {
    sections.push(`\nPROJECTS:\n${projects.map((p, i) => `${i + 1}. ${p}`).join('\n')}`);
  }

  if (education && education.length > 0) {
    sections.push(`\nEDUCATION:\n${education.map((e, i) => `${i + 1}. ${e}`).join('\n')}`);
  }

  return sections.join('\n');
}

exports.generateResume = async (req, res) => {
  try {
    const { personal, skills, projects, experience, education, template } = req.body;

    // Validate input
    const validationErrors = validateInput(personal, skills, projects, experience, education);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join('; ') });
    }

    // Check cache
    const cacheKey = generateCacheKey(personal, skills, projects, experience, education, template);
    const cachedResume = getCachedResume(cacheKey);
    if (cachedResume) {
      return res.json({ 
        html: cachedResume.html,
        plainText: cachedResume.plainText,
        template: template || 'classic', 
        cached: true 
      });
    }

    const client = getOpenAIClient();

    // Generate plain text version using AI (if available)
    let plainTextVersion = '';
    if (client) {
      const formattedData = formatResumeData(personal, skills, projects, experience, education);
      const prompt = `Generate a professional, ATS-optimized resume in plain text. Use only the following data:

${formattedData}

Template: ${template || 'classic'}

Output only the formatted resume, no explanations.`;

      const completion = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1000
      });

      plainTextVersion = completion.choices[0]?.message?.content || '';
    }

    // Generate HTML resume
    const htmlResume = generateResumeHTML({
      personal,
      skills,
      projects,
      experience,
      education
    }, template || 'classic');

    // Cache the result
    setCacheResume(cacheKey, { html: htmlResume, plainText: plainTextVersion });

    res.json({ 
      html: htmlResume, 
      plainText: plainTextVersion,
      template: template || 'classic', 
      cached: false 
    });
  } catch (err) {
    console.error('Resume generation error:', err.message);
    res.status(500).json({ 
      message: 'Failed to generate resume',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

