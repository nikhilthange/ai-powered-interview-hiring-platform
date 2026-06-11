const { z } = require('zod');

const submitApplicationSchema = z.object({
  coverLetter: z.string().optional().default(''),
  resumeText: z.string().optional().default(''),
  existingResumeUrl: z.string().optional().default('')
});

const updateApplicationStatusSchema = z.object({
  status: z.enum(['Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of: Applied, Reviewing, Shortlisted, Interview Scheduled, Rejected, Hired'
  })
});

const mockInterviewSchema = z.object({
  jobDescription: z.string({ required_error: 'Job description is required' }).min(1, 'Job description cannot be empty'),
  resumeText: z.string().optional().default('')
});

const mockInterviewFeedbackSchema = z.object({
  qaPairs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  }), { required_error: 'Question-answer pairs are required' }).min(1, 'At least one Q&A pair is required')
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
  submitApplicationSchema,
  updateApplicationStatusSchema,
  mockInterviewSchema,
  mockInterviewFeedbackSchema
};
