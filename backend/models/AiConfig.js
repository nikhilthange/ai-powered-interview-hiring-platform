const mongoose = require('mongoose');

const aiConfigSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['mock', 'nvidia'],
    default: process.env.MOCK_AI === 'true' ? 'mock' : 'nvidia'
  },
  totalRequests: { type: Number, default: 0 },
  totalErrors: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 0 },
  lastApiCall: { type: Date, default: null },
  lastError: { type: String, default: '' },
}, { timestamps: true });

aiConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('AiConfig', aiConfigSchema);
