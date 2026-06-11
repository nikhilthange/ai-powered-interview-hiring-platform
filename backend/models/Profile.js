const mongoose = require('mongoose');

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
  careerRoadmap: {
    type: mongoose.Schema.Types.Mixed, // Stores the JSON output of the roadmap generator
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

// Index skills for quick filters
ProfileSchema.index({ skills: 1 });
ProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('Profile', ProfileSchema);
