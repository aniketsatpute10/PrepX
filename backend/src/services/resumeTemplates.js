// HTML Resume Templates with Professional Styling

const templates = {
  classic: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.5;
          color: #333;
          background: white;
          padding: 40px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
          text-align: center;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .name { font-size: 28px; font-weight: bold; color: #2c3e50; }
        .headline { font-size: 14px; color: #666; margin-top: 5px; }
        .contact {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
        }
        .contact span { margin: 0 10px; }
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #2c3e50;
          border-bottom: 1px solid #bdc3c7;
          padding-bottom: 8px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .entry { margin-bottom: 12px; }
        .entry-title { font-weight: bold; color: #2c3e50; }
        .entry-meta { font-size: 12px; color: #666; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag {
          background: #ecf0f1;
          padding: 4px 10px;
          border-radius: 3px;
          font-size: 12px;
          color: #2c3e50;
        }
        ul { padding-left: 20px; }
        li { margin-bottom: 6px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="name">${data.personal.name}</div>
          <div class="headline">${data.personal.headline}</div>
          <div class="contact">
            ${data.personal.location ? `<span>${data.personal.location}</span>` : ''}
            ${data.personal.email ? `<span>${data.personal.email}</span>` : ''}
            ${data.personal.phone ? `<span>${data.personal.phone}</span>` : ''}
          </div>
        </div>

        ${data.skills && data.skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-list">
              ${data.skills.map(skill => `<div class="skill-tag">${skill}</div>`).join('')}
            </div>
          </div>
        ` : ''}

        ${data.experience && data.experience.length > 0 ? `
          <div class="section">
            <div class="section-title">Professional Experience</div>
            ${data.experience.map(exp => `
              <div class="entry">
                <div class="entry-title">${exp}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.projects && data.projects.length > 0 ? `
          <div class="section">
            <div class="section-title">Projects</div>
            ${data.projects.map(project => `
              <div class="entry">
                <div class="entry-title">${project}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.education && data.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${data.education.map(edu => `
              <div class="entry">
                <div class="entry-title">${edu}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `,

  modern: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #2d3748;
          background: white;
          padding: 40px;
        }
        .container { max-width: 850px; margin: 0 auto; }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .name { font-size: 32px; font-weight: 700; margin-bottom: 5px; }
        .headline { font-size: 16px; opacity: 0.9; margin-bottom: 15px; }
        .contact {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          font-size: 13px;
          opacity: 0.95;
        }
        .section { margin-bottom: 25px; }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #667eea;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding-bottom: 10px;
          border-bottom: 2px solid #667eea;
          margin-bottom: 15px;
        }
        .entry { margin-bottom: 15px; }
        .entry-title { font-weight: 600; color: #2d3748; font-size: 13px; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag {
          background: #edf2f7;
          color: #667eea;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid #667eea;
        }
        li { margin-left: 15px; font-size: 12px; margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="name">${data.personal.name}</div>
          <div class="headline">${data.personal.headline}</div>
          <div class="contact">
            ${data.personal.location ? `<span>📍 ${data.personal.location}</span>` : ''}
            ${data.personal.email ? `<span>✉️ ${data.personal.email}</span>` : ''}
            ${data.personal.phone ? `<span>📱 ${data.personal.phone}</span>` : ''}
          </div>
        </div>

        ${data.skills && data.skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Technical Skills</div>
            <div class="skills-list">
              ${data.skills.map(skill => `<div class="skill-tag">${skill}</div>`).join('')}
            </div>
          </div>
        ` : ''}

        ${data.experience && data.experience.length > 0 ? `
          <div class="section">
            <div class="section-title">Professional Experience</div>
            ${data.experience.map(exp => `
              <div class="entry">
                <div class="entry-title">▸ ${exp}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.projects && data.projects.length > 0 ? `
          <div class="section">
            <div class="section-title">Featured Projects</div>
            ${data.projects.map(project => `
              <div class="entry">
                <div class="entry-title">▸ ${project}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.education && data.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${data.education.map(edu => `
              <div class="entry">
                <div class="entry-title">▸ ${edu}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `,

  minimal: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.7;
          color: #1a1a1a;
          background: white;
          padding: 50px 40px;
        }
        .container { max-width: 750px; margin: 0 auto; }
        .header { margin-bottom: 30px; }
        .name { font-size: 26px; font-weight: normal; letter-spacing: 2px; }
        .headline { font-size: 12px; color: #666; margin-top: 8px; letter-spacing: 1px; }
        .contact { font-size: 11px; color: #999; margin-top: 12px; }
        .contact span { margin-right: 15px; }
        .section { margin-bottom: 25px; }
        .section-title {
          font-size: 11px;
          font-weight: bold;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 12px;
          padding-top: 15px;
        }
        .section-title:not(:first-of-type) { border-top: 1px solid #ddd; }
        .entry { margin-bottom: 10px; }
        .entry-title { font-size: 12px; font-weight: bold; color: #1a1a1a; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { font-size: 11px; color: #666; }
        li { margin-left: 15px; font-size: 11px; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="name">${data.personal.name}</div>
          <div class="headline">${data.personal.headline}</div>
          <div class="contact">
            ${data.personal.location ? `<span>${data.personal.location}</span>` : ''}
            ${data.personal.email ? `<span>${data.personal.email}</span>` : ''}
            ${data.personal.phone ? `<span>${data.personal.phone}</span>` : ''}
          </div>
        </div>

        ${data.skills && data.skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-list">
              ${data.skills.join(' • ')}
            </div>
          </div>
        ` : ''}

        ${data.experience && data.experience.length > 0 ? `
          <div class="section">
            <div class="section-title">Experience</div>
            ${data.experience.map(exp => `
              <div class="entry">
                <div class="entry-title">${exp}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.projects && data.projects.length > 0 ? `
          <div class="section">
            <div class="section-title">Projects</div>
            ${data.projects.map(project => `
              <div class="entry">
                <div class="entry-title">${project}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${data.education && data.education.length > 0 ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${data.education.map(edu => `
              <div class="entry">
                <div class="entry-title">${edu}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `
};

function generateResumeHTML(data, templateType = 'classic') {
  const template = templates[templateType] || templates.classic;
  return template(data);
}

module.exports = { generateResumeHTML, templates };
