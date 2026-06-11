const { z } = require('zod');

const paginationSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20')
});

module.exports = {
  paginationSchema
};
