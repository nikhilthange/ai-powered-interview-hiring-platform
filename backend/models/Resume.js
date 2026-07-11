const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Resume',
    trim: true
  },
  template: {
    type: String,
    enum: ['classic', 'modern', 'minimal', 'professional'],
    default: 'classic'
  },
  content: {
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      website: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' }
    },
    summary: { type: String, default: '' },
    experience: [{
      id: { type: String, required: true },
      company: { type: String, default: '' },
      position: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      current: { type: Boolean, default: false },
      description: { type: String, default: '' }
    }],
    education: [{
      id: { type: String, required: true },
      institution: { type: String, default: '' },
      degree: { type: String, default: '' },
      field: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      current: { type: Boolean, default: false },
      description: { type: String, default: '' }
    }],
    projects: [{
      id: { type: String, required: true },
      title: { type: String, default: '' },
      technologies: { type: String, default: '' }, // comma separated
      url: { type: String, default: '' },
      description: { type: String, default: '' }
    }],
    skills: [{
      id: { type: String, required: true },
      category: { type: String, default: '' },
      items: { type: String, default: '' } // comma separated
    }],
    certifications: [{
      id: { type: String, required: true },
      title: { type: String, default: '' },
      issuer: { type: String, default: '' },
      date: { type: String, default: '' },
      url: { type: String, default: '' }
    }],
    achievements: [{
      id: { type: String, required: true },
      title: { type: String, default: '' },
      date: { type: String, default: '' },
      description: { type: String, default: '' }
    }],
    languages: [{
      id: { type: String, required: true },
      language: { type: String, default: '' },
      proficiency: { type: String, default: '' }
    }],
    interests: [{
      id: { type: String, required: true },
      items: { type: String, default: '' } // comma separated
    }],
    references: [{
      id: { type: String, required: true },
      name: { type: String, default: '' },
      position: { type: String, default: '' },
      company: { type: String, default: '' },
      contactInfo: { type: String, default: '' }
    }],
    customSections: [{
      id: { type: String, required: true },
      title: { type: String, default: '' },
      items: [{
        id: { type: String, required: true },
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        date: { type: String, default: '' },
        description: { type: String, default: '' }
      }]
    }],
    sectionOrder: {
      type: [String],
      default: ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'languages', 'interests', 'references']
    }
  }
}, {
  timestamps: true
});

ResumeSchema.index({ userId: 1 });

module.exports = mongoose.model('Resume', ResumeSchema);
