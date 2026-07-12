const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // A recruiter can have only one company profile for now
  },
  name: {
    type: String,
    required: [true, 'Please provide the company name'],
    trim: true
  },
  logo: {
    type: String,
    default: 'default-company-logo.png'
  },
  coverImage: {
    type: String,
    default: 'default-company-cover.png'
  },
  about: {
    type: String,
    required: [true, 'Please provide information about the company']
  },
  website: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'Please specify the industry'],
    trim: true
  },
  location: {
    type: String,
    trim: true,
    default: 'Remote'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  employeeCount: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },
  culture: {
    type: String
  },
  benefits: [{
    type: String,
    trim: true
  }],
  officePhotos: [{
    type: String
  }],
  socialLinks: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true }
  },
  followersCount: {
    type: Number,
    default: 0
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for jobs belonging to this company
CompanySchema.virtual('jobs', {
  ref: 'Job',
  foreignField: 'companyId',
  localField: '_id'
});

CompanySchema.index({ name: 'text', about: 'text', industry: 'text', location: 'text' });

module.exports = mongoose.model('Company', CompanySchema);
