import dns from 'dns';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import config from './config/config.js';
import logService from './services/log-service.js';
import authRoutes from './endpoints/authentication.js';
import testimonialRoutes from './endpoints/testimonial.js';
import projectRoutes from './endpoints/project.js';
import logRoutes from './endpoints/log.js';
import healthRoutes from './endpoints/health.js';

// Use Google DNS to resolve SRV records (fixes Node.js c-ares lookup failures on some networks)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Request logging middleware
app.use(logService.createRequestLoggerMiddleware());

mongoose.connect(config.mongoUri, { dbName: config.dbName })
.then(() => {
  console.log(`Connected to MongoDB database: ${config.dbName}`);
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// API Routes
const apiVersion = `/v${config.version}`;

// Base endpoint
app.get(apiVersion, (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    version: config.version,
    timestamp: new Date().toISOString()
  });
});

app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/testimonial`, testimonialRoutes);
app.use(`${apiVersion}/projects`, projectRoutes);
app.use(`${apiVersion}/logs`, logRoutes);
app.use(`${apiVersion}/health`, healthRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logService.logError(error, {
    method: req.method,
    path: req.originalUrl || req.path,
    ip: req.ip || req.socket?.remoteAddress,
    userId: req.user?.userId,
    correlationId: req.correlationId
  });
  
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: config.env === 'production' ? 'Something went wrong' : error.message,
    ...(config.env === 'development' && { stack: error.stack })
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

export default app;