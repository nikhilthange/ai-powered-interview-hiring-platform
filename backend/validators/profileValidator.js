const { z } = require('zod');

const createOrUpdateProfileSchema = z.object({
  fullName: z.string({ required_error: 'Full name is required' }).trim().min(1, 'Full name cannot be empty'),
  bio: z.string().optional().default(''),
  skills: z.array(z.string().trim()).optional().default([]),
  experienceYears: z.number().min(0).optional().default(0),
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
