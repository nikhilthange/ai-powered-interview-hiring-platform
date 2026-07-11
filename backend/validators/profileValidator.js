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

const experienceSchema = z.object({
  company: z.string().optional().default(''),
  position: z.string().optional().default(''),
  startDate: z.string().nullable().optional().default(null).transform(val => val ? new Date(val) : null),
  endDate: z.string().nullable().optional().default(null).transform(val => val ? new Date(val) : null),
  current: z.boolean().optional().default(false),
  description: z.string().optional().default(''),
});

const createOrUpdateProfileSchema = z.object({
  fullName: z.string({ required_error: 'Full name is required' }).trim().min(1, 'Full name cannot be empty').optional(),
  username: z.string().trim().regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and dashes.').optional().nullable(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  headline: z.string().optional(),
  title: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  skills: z.array(z.string().trim()).optional(),
  experienceYears: z.number().min(0).optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  projects: z.array(projectSchema).optional(),
  certificates: z.array(z.string().trim()).optional(),
  isPublic: z.boolean().optional(),
  company: z.object({
    name: z.string().trim().optional(),
    website: z.string().trim().optional(),
    logoUrl: z.string().trim().optional()
  }).optional()
});

const generateRoadmapSchema = z.object({
  targetRole: z.string({ required_error: 'Target role is required' }).trim().min(1, 'Target role cannot be empty')
});

const validateBody = (schema) => (req, res, next) => {
  console.log('=== Zod Validation ===');
  console.log('Schema name:', schema.description || 'createOrUpdateProfileSchema');
  console.log('Input body:', JSON.stringify(req.body, null, 2));
  const result = schema.safeParse(req.body);
  if (!result.success) {
    console.log('VALIDATION FAILED');
    console.log('Errors:', JSON.stringify(result.error.errors, null, 2));
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
  console.log('Validation passed');
  console.log('Parsed body:', JSON.stringify(result.data, null, 2));
  req.body = result.data;
  next();
};

module.exports = {
  validateBody,
  createOrUpdateProfileSchema,
  generateRoadmapSchema
};
