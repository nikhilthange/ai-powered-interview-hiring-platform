const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  title: {
    type: String,
    required: [true, 'Please provide a job title.'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a job description.']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Please provide the job location.'],
    trim: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote'],
    required: [true, 'Please specify the job type.']
  },
  experienceLevel: {
    type: String,
    enum: ['Junior', 'Mid', 'Senior'],
    required: [true, 'Please specify the experience level.']
  },
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Compound index for sorting jobs feed by status and creation time
JobSchema.index({ status: 1, createdAt: -1 });

// Text index for searching jobs by title and description keywords
JobSchema.index({ title: 'text', description: 'text' });

// Recruiter job listings
JobSchema.index({ recruiterId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', JobSchema);
