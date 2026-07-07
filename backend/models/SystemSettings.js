const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  appName: { type: String, default: 'HireMate' },
  logo: { type: String, default: '' },
  maintenanceMode: { type: Boolean, default: false },
  smtp: {
    host: { type: String, default: '' },
    port: { type: Number, default: 587 },
    user: { type: String, default: '' },
    pass: { type: String, default: '' },
  },
  jwtExpiry: { type: String, default: '15m' },
  uploadLimit: { type: Number, default: 5 },
  aiProvider: { type: String, default: 'mock' },
}, { timestamps: true });

SystemSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
