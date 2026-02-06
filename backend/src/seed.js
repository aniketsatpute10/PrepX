const dotenv = require('dotenv');
dotenv.config();

const connectDb = require('./config/db');
const Skill = require('./models/Skill');
const Question = require('./models/Question');

async function seed() {
  await connectDb();

  console.log('Seeding skills and questions...');

  await Skill.deleteMany({});
  await Question.deleteMany({});

  const skills = await Skill.insertMany([
    {
      name: 'React',
      role: 'frontend',
      popularityScore: 92,
      salaryRanges: [
        { level: 'entry', min: 400000, max: 700000 },
        { level: 'mid', min: 700000, max: 1200000 },
        { level: 'senior', min: 1200000, max: 2200000 }
      ],
      demandRanges: [
        { level: 'beginner', demandScore: 60 },
        { level: 'intermediate', demandScore: 80 },
        { level: 'advanced', demandScore: 90 }
      ]
    },
    {
      name: 'Node.js',
      role: 'backend',
      popularityScore: 88,
      salaryRanges: [
        { level: 'entry', min: 450000, max: 750000 },
        { level: 'mid', min: 800000, max: 1300000 },
        { level: 'senior', min: 1300000, max: 2300000 }
      ],
      demandRanges: [
        { level: 'beginner', demandScore: 55 },
        { level: 'intermediate', demandScore: 78 },
        { level: 'advanced', demandScore: 88 }
      ]
    },
    {
      name: 'Python for Data Science',
      role: 'data',
      popularityScore: 94,
      salaryRanges: [
        { level: 'entry', min: 500000, max: 800000 },
        { level: 'mid', min: 900000, max: 1500000 },
        { level: 'senior', min: 1500000, max: 2600000 }
      ],
      demandRanges: [
        { level: 'beginner', demandScore: 65 },
        { level: 'intermediate', demandScore: 82 },
        { level: 'advanced', demandScore: 92 }
      ]
    },
    {
      name: 'Network Security',
      role: 'cybersecurity',
      popularityScore: 85,
      salaryRanges: [
        { level: 'entry', min: 450000, max: 750000 },
        { level: 'mid', min: 850000, max: 1400000 },
        { level: 'senior', min: 1400000, max: 2400000 }
      ],
      demandRanges: [
        { level: 'beginner', demandScore: 58 },
        { level: 'intermediate', demandScore: 79 },
        { level: 'advanced', demandScore: 89 }
      ]
    }
  ]);

  await Question.insertMany([
    {
      skill: 'React',
      role: 'frontend',
      difficulty: 'easy',
      question: 'What is the purpose of React hooks?',
      options: [
        'To add state and lifecycle to functional components',
        'To directly modify the DOM',
        'To style components using CSS-in-JS',
        'To manage build-time optimizations'
      ],
      correctIndex: 0
    },
    {
      skill: 'React',
      role: 'frontend',
      difficulty: 'medium',
      question: 'Which hook is used to perform side effects in functional components?',
      options: ['useState', 'useEffect', 'useContext', 'useMemo'],
      correctIndex: 1
    },
    {
      skill: 'Node.js',
      role: 'backend',
      difficulty: 'easy',
      question: 'Node.js runs on which JavaScript engine?',
      options: ['SpiderMonkey', 'Chakra', 'V8', 'JavaScriptCore'],
      correctIndex: 2
    },
    {
      skill: 'Node.js',
      role: 'backend',
      difficulty: 'medium',
      question: 'Which library is commonly used for building REST APIs in Node.js?',
      options: ['Express', 'Lodash', 'Mongoose', 'React'],
      correctIndex: 0
    },
    {
      skill: 'Python for Data Science',
      role: 'data',
      difficulty: 'easy',
      question: 'Which library is primarily used for data manipulation in Python?',
      options: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'],
      correctIndex: 1
    }
  ]);

  console.log('Seeding completed.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

