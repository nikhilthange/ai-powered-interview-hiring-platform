const { z } = require('zod');

const scheduleInterviewSchema = z.object({
  applicationId: z.string({ required_error: 'Application ID is required' }),
  scheduledAt: z.string({ required_error: 'Scheduled time is required' }).refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Scheduled time must be a valid date string' }
  ),
  meetLink: z.string().url('Must be a valid URL').optional().default('')
});

const updateInterviewSchema = z.object({
  status: z.enum(['Scheduled', 'Completed', 'Cancelled']).optional(),
  aiInterviewFeedback: z.string().optional()
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
  scheduleInterviewSchema,
  updateInterviewSchema
};
