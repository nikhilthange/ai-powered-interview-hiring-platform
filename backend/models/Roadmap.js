const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  skills: [{
    type: String
  }],
  resources: [{
    title: String,
    url: String
  }],
  projects: [{
    title: String,
    description: String
  }]
});

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetRole: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  estimatedDuration: {
    type: String
  },
  milestones: [MilestoneSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
