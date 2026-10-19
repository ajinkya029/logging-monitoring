const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  level: { type: String, enum: ['debug', 'info', 'warn', 'error', 'fatal'], required: true, index: true },
  message: { type: String, required: true, trim: true, maxlength: 10000 },
  service: { type: String, required: true, trim: true, maxlength: 120, index: true },
  environment: { type: String, trim: true, maxlength: 80, default: 'development', index: true },
  requestId: { type: String, trim: true, maxlength: 200 },
  traceId: { type: String, trim: true, maxlength: 200 },
  host: { type: String, trim: true, maxlength: 255 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true, versionKey: false });

logSchema.index({ timestamp: -1, level: 1, service: 1 });
logSchema.index({ message: 'text', service: 'text' });

module.exports = mongoose.model('Log', logSchema);
