const { z } = require('zod');

const educationSchema = z.object({
  institution: z.string().optional().default(''),
  degree: z.string().optional().default(''),
  field: z.string().optional().default(''),
  startYear: z.number().nullable().optional().default(null),
  endYear: z.number().nullable().optional().default(null),
});

const projectSchema = z.object({
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  url: z.string().optional().default(''),
  technologies: z.array(z.string()).optional().default([]),
});

const createOrUpdateProfileSchema = z.object({
  fullName: z.string({ required_error: 'Full name is required' }).trim().min(1, 'Full name cannot be empty'),
  bio: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  location: z.string().optional().default(''),
  headline: z.string().optional().default(''),
  title: z.string().optional().default(''),
  website: z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  github: z.string().optional().default(''),
  portfolio: z.string().optional().default(''),
  skills: z.array(z.string().trim()).optional().default([]),
  experienceYears: z.number().min(0).optional().default(0),
  education: z.array(educationSchema).optional().default([]),
  projects: z.array(projectSchema).optional().default([]),
  company: z.object({
    name: z.string().trim().optional().default(''),
    website: z.string().trim().optional().default(''),
    logoUrl: z.string().trim().optional().default('')
  }).optional()
});

const generateRoadmapSchema = z.object({
  targetRole: z.string({ required_error: 'Target role is required' }).trim().min(1, 'Target role cannot be empty')
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  req.body = result.data;
  next();
};

module.exports = {
  validateBody,
  createOrUpdateProfileSchema,
  generateRoadmapSchema
};
