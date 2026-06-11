const { z } = require('zod');

const createJobSchema = z.object({
  title: z.string({ required_error: 'Job title is required' }).trim().min(1, 'Job title cannot be empty'),
  description: z.string({ required_error: 'Job description is required' }).min(1, 'Job description cannot be empty'),
  requirements: z.array(z.string().trim()).optional().default([]),
  location: z.string({ required_error: 'Location is required' }).trim().min(1, 'Location cannot be empty'),
  jobType: z.enum(['Full-time', 'Part-time', 'Contract', 'Remote'], {
    invalid_type_error: 'Job type must be Full-time, Part-time, Contract, or Remote'
  }),
  experienceLevel: z.enum(['Junior', 'Mid', 'Senior'], {
    invalid_type_error: 'Experience level must be Junior, Mid, or Senior'
  }),
  salaryRange: z.object({
    min: z.number().min(0).optional().default(0),
    max: z.number().min(0).optional().default(0)
  }).optional().default({ min: 0, max: 0 })
});

const updateJobSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().min(1).optional(),
  requirements: z.array(z.string().trim()).optional(),
  location: z.string().trim().min(1).optional(),
  jobType: z.enum(['Full-time', 'Part-time', 'Contract', 'Remote']).optional(),
  experienceLevel: z.enum(['Junior', 'Mid', 'Senior']).optional(),
  salaryRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  status: z.enum(['Active', 'Closed']).optional()
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
  createJobSchema,
  updateJobSchema
};
