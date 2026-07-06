const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  institution: { type: String, default: '', trim: true },
  degree: { type: String, default: '', trim: true },
  field: { type: String, default: '', trim: true },
  startYear: { type: Number, default: null },
  endYear: { type: Number, default: null },
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true },
  url: { type: String, default: '', trim: true },
  technologies: [{ type: String, trim: true }],
});

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Please provide your full name.'],
    trim: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  headline: {
    type: String,
    default: '',
    trim: true
  },
  title: {
    type: String,
    default: '',
    trim: true
  },
  linkedin: {
    type: String,
    default: '',
    trim: true
  },
  github: {
    type: String,
    default: '',
    trim: true
  },
  portfolio: {
    type: String,
    default: '',
    trim: true
  },
  website: {
    type: String,
    default: '',
    trim: true
  },
  
  // Candidate-specific attributes
  resumeUrl: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  experienceYears: {
    type: Number,
    default: 0
  },
  education: [EducationSchema],
  projects: [ProjectSchema],
  careerRoadmap: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Recruiter-specific attributes
  company: {
    name: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    logoUrl: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

ProfileSchema.index({ skills: 1 });
ProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('Profile', ProfileSchema);
