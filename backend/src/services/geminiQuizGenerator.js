// Use REST API directly instead of SDK to avoid model name issues
async function callGeminiAPI(prompt, apiKey) {
  const https = require('https');
  const { URL } = require('url');

  function doPost(version, model) {
    return new Promise((resolve, reject) => {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
      const urlObj = new URL(url);

      const postData = JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode !== 200) {
            const err = new Error(`Gemini API error: ${res.statusCode} - ${data}`);
            err.statusCode = res.statusCode;
            return reject(err);
          }
          try {
            const json = JSON.parse(data);
            resolve(json?.candidates?.[0]?.content?.parts?.[0]?.text || '');
          } catch (err) {
            reject(new Error(`Failed to parse Gemini response: ${err.message}`));
          }
        });
      });

      req.on('error', (err) => reject(new Error(`Gemini API request failed: ${err.message}`)));
      req.write(postData);
      req.end();
    });
  }

  function listModels() {
    return new Promise((resolve, reject) => {
      const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
      const { URL } = require('url');
      const urlObj = new URL(url);
      const https = require('https');

      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET'
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`ListModels error: ${res.statusCode} - ${data}`));
          try {
            const json = JSON.parse(data);
            resolve(json.models || []);
          } catch (err) {
            reject(new Error(`Failed to parse ListModels response: ${err.message}`));
          }
        });
      });

      req.on('error', (err) => reject(new Error(`ListModels request failed: ${err.message}`)));
      req.end();
    });
  }

  // Try preferred model first (use v1 endpoint). If not found, call ListModels and pick a Gemini model.
  const preferredModel = 'gemini-1.5-flash';
  try {
    return await doPost('v1', preferredModel);
  } catch (err) {
    // If model not found, try to discover available models
    if (err && err.statusCode === 404) {
      try {
        const models = await listModels();
        // models have names like 'models/gemini-1.5-flash'
        const gemini = (models || []).find((m) => String(m.name || '').toLowerCase().includes('gemini'));
        if (gemini && gemini.name) {
          const modelName = String(gemini.name).replace(/^models\//, '');
          // try v1 first then v1beta
          try {
            return await doPost('v1', modelName);
          } catch (err2) {
            return await doPost('v1beta', modelName);
          }
        }
        throw new Error('No Gemini models found via ListModels');
      } catch (listErr) {
        throw new Error(`Gemini model discovery failed: ${listErr.message}`);
      }
    }
    throw err;
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeGeneratedQuestions(items, { role, difficulty, skill }) {
  if (!Array.isArray(items)) return [];

  const normalized = [];
  for (const item of items) {
    const question = typeof item?.question === 'string' ? item.question.trim() : '';
    const options = Array.isArray(item?.options)
      ? item.options.map((o) => String(o).trim()).filter(Boolean)
      : [];
    const correctIndex = Number.isInteger(item?.correctIndex) ? item.correctIndex : -1;

    if (!question) continue;
    if (options.length < 4) continue;
    const finalOptions = options.slice(0, 4);
    if (correctIndex < 0 || correctIndex > 3) continue;

    normalized.push({
      role,
      difficulty,
      skill,
      question,
      options: finalOptions,
      correctIndex
    });
  }

  return normalized;
}

async function generateQuizQuestions({ role, difficulty, skill, count }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { questions: [], usedAI: false, reason: 'GEMINI_API_KEY not configured' };
  }

  try {
    console.log(`Calling Gemini REST API directly to generate ${count} questions for ${role}/${difficulty}/${skill}`);

    const prompt = `
You are an expert technical interviewer.
Generate exactly ${count} multiple-choice interview questions in STRICT JSON format.

Constraints:
- Role: ${role}
- Difficulty: ${difficulty} (easy|medium|hard)
- Skill: ${skill}
- Each question must have exactly 4 options.
- correctIndex must be 0..3.
- Make questions practical and interview-style, not trivia.

Return ONLY valid JSON (no markdown), in this shape:
[
  {
    "question": "string",
    "options": ["A","B","C","D"],
    "correctIndex": 0
  }
]
`;

    const text = await callGeminiAPI(prompt, apiKey);

    if (!text) {
      console.warn('Gemini API returned empty response');
      return { questions: [], usedAI: true, reason: 'Empty response from Gemini API' };
    }

    // Gemini sometimes returns leading/trailing text; attempt to extract JSON array.
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    const jsonCandidate = start !== -1 && end !== -1 ? text.slice(start, end + 1) : text;

    const parsed = safeJsonParse(jsonCandidate);
    if (!parsed) {
      console.warn('Failed to parse Gemini response as JSON:', text.substring(0, 200));
      return { questions: [], usedAI: true, reason: 'Invalid JSON response from Gemini' };
    }

    const normalized = normalizeGeneratedQuestions(parsed, { role, difficulty, skill });
    
    console.log(`Gemini returned ${normalized.length} valid questions out of ${parsed?.length || 0} parsed items`);

    return { questions: normalized, usedAI: true };
  } catch (err) {
    console.error('Gemini API error:', err.message || err);
    return { questions: [], usedAI: true, reason: `Gemini API error: ${err.message || 'Unknown error'}` };
  }
}

module.exports = { generateQuizQuestions };

