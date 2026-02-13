import mongoose from 'mongoose';

/**
 * @typedef {Object} LogSchema
 * @property {('info'|'warn'|'error'|'debug')} level - Log severity level
 * @property {string} message - Log message
 * @property {string} [method] - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @property {string} [path] - Request path
 * @property {number} [statusCode] - HTTP response status code
 * @property {number} [responseTime] - Response time in milliseconds
 * @property {string} [ip] - Client IP address
 * @property {string} [userAgent] - Client user agent string
 * @property {string} [userId] - Authenticated user ID if available
 * @property {Object} [metadata] - Additional contextual data
 * @property {string} [correlationId] - Request correlation ID for tracing
 * @property {Date} createdAt - Log creation timestamp (auto-expires after 30 days)
 */

/**
 * Mongoose schema for application logs.
 * Includes TTL index for automatic 30-day retention cleanup.
 * @type {mongoose.Schema<LogSchema>}
 */
const logSchema = new mongoose.Schema({
  level: {
    type: String,
    required: [true, 'Log level is required'],
    enum: {
      values: ['info', 'warn', 'error', 'debug'],
      message: 'Log level must be info, warn, error, or debug'
    },
    index: true
  },
  message: {
    type: String,
    required: [true, 'Log message is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  method: {
    type: String,
    maxlength: [10, 'Method cannot exceed 10 characters']
  },
  path: {
    type: String,
    maxlength: [500, 'Path cannot exceed 500 characters']
  },
  statusCode: {
    type: Number
  },
  responseTime: {
    type: Number
  },
  ip: {
    type: String,
    maxlength: [45, 'IP address cannot exceed 45 characters']
  },
  userAgent: {
    type: String,
    maxlength: [500, 'User agent cannot exceed 500 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  correlationId: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  versionKey: false
});

/**
 * TTL index to automatically delete logs after 30 days.
 * MongoDB's TTL monitor runs every 60 seconds to remove expired documents.
 */
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

/**
 * Compound index for efficient querying by level and date range.
 */
logSchema.index({ level: 1, createdAt: -1 });

const Log = mongoose.model('Log', logSchema);

export default Log;
