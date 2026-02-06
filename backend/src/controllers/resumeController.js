const OpenAI = require('openai');

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

exports.generateResume = async (req, res) => {
  try {
    const { personal, skills, projects, experience, education, template } = req.body;

    const client = getOpenAIClient();

    // If no API key configured, return a mocked resume for development.
    if (!client) {
      const mock = `MOCK RESUME (no OPENAI_API_KEY set)\n\nName: ${personal?.name || 'Your Name'}\nRole: ${
        personal?.headline || 'Desired Role'
      }\n\nSkills:\n${(skills || []).join(', ')}\n\nExperience:\n${(experience || [])
        .map((e) => `- ${e.title} at ${e.company}`)
        .join('\n')}`;
      return res.json({ content: mock, template: template || 'classic' });
    }

    const prompt = `
You are an expert ATS-optimized resume writer.
Generate a concise, modern, ATS-friendly resume in plain text using the following data.

Personal:
${JSON.stringify(personal, null, 2)}

Skills:
${JSON.stringify(skills, null, 2)}

Projects:
${JSON.stringify(projects, null, 2)}

Experience:
${JSON.stringify(experience, null, 2)}

Education:
${JSON.stringify(education, null, 2)}

Template style: ${template || 'classic'}

Return ONLY the resume body, no explanations.
`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 900
    });

    const resumeText = completion.choices[0]?.message?.content || '';

    res.json({ content: resumeText, template: template || 'classic' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate resume' });
  }
};

