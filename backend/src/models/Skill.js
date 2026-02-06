const mongoose = require('mongoose');

const salaryRangeSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ['entry', 'mid', 'senior'], required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  { _id: false }
);

const demandRangeSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    demandScore: { type: Number, min: 0, max: 100, required: true }
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['frontend', 'backend', 'data', 'cybersecurity', 'fullstack', 'other'],
      required: true
    },
    popularityScore: { type: Number, min: 0, max: 100, required: true },
    salaryRanges: [salaryRangeSchema],
    demandRanges: [demandRangeSchema]
  },
  { timestamps: true }
);

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;

