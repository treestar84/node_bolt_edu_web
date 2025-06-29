import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Import routes
import authRoutes from './routes/auth.js';
import wordsRoutes from './routes/words.js';
import booksRoutes from './routes/books.js';
import uploadRoutes from './routes/upload.js';
import apiKeyRoutes from './routes/apiKeys.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 API requests per windowMs
  message: {
    error: 'Too many API requests from this IP, please try again later.'
  }
});

app.use(limiter);
app.use('/api', apiLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/words', wordsRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/keys', apiKeyRoutes);

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Toddler Learning App API',
    version: '1.0.0',
    description: 'API for managing words, books, and content in the toddler learning application',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      auth: {
        'POST /auth/login': 'Admin login',
        'POST /auth/logout': 'Admin logout',
        'GET /auth/verify': 'Verify admin token'
      },
      words: {
        'GET /words': 'Get all words',
        'POST /words': 'Create new word (requires API key)',
        'PUT /words/:id': 'Update word (requires API key)',
        'DELETE /words/:id': 'Delete word (requires API key)',
        'POST /words/batch': 'Create multiple words (requires API key)'
      },
      books: {
        'GET /books': 'Get all books',
        'POST /books': 'Create new book (requires API key)',
        'PUT /books/:id': 'Update book (requires API key)',
        'DELETE /books/:id': 'Delete book (requires API key)',
        'POST /books/complete': 'Create complete book with all content (requires API key)'
      },
      upload: {
        'POST /upload/image': 'Upload image file (requires API key)',
        'POST /upload/audio': 'Upload audio file (requires API key)',
        'POST /upload/batch': 'Upload multiple files (requires API key)'
      },
      keys: {
        'GET /keys': 'Get API keys (admin only)',
        'POST /keys': 'Create API key (admin only)',
        'DELETE /keys/:id': 'Delete API key (admin only)'
      }
    },
    authentication: {
      admin: 'Bearer token in Authorization header',
      api: 'X-API-Key header'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'File too large',
      message: 'The uploaded file exceeds the maximum size limit'
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Initialize server
const initializeServer = async () => {
  try {
    // Ensure uploads directory exists
    const uploadsDir = join(__dirname, 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.mkdir(join(uploadsDir, 'images'), { recursive: true });
      await fs.mkdir(join(uploadsDir, 'audio'), { recursive: true });
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 API Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

initializeServer();

export default app;