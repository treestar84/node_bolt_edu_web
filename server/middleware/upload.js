import multer from 'multer';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'audio' 
      ? join(process.cwd(), 'server/uploads/audio')
      : join(process.cwd(), 'server/uploads/images');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    // Accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for image uploads'), false);
    }
  } else if (file.fieldname === 'audio') {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for audio uploads'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Error handling for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: 'File size exceeds 50MB limit'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        error: 'Too many files',
        message: 'Maximum 10 files allowed per request'
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }
  
  next();
};