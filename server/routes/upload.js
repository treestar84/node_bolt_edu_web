import express from 'express';
import { authenticateApiKey } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Upload single image
router.post('/image', authenticateApiKey, upload.single('image'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'No image file provided'
      });
    }
    
    const fileUrl = `/uploads/images/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Upload single audio file
router.post('/audio', authenticateApiKey, upload.single('audio'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'No audio file provided'
      });
    }
    
    const fileUrl = `/uploads/audio/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      },
      message: 'Audio uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Upload multiple files (batch upload)
router.post('/batch', authenticateApiKey, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'audio', maxCount: 10 }
]), handleUploadError, (req, res) => {
  try {
    const uploadedFiles = {
      images: [],
      audio: []
    };
    
    if (req.files.images) {
      uploadedFiles.images = req.files.images.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/images/${file.filename}`
      }));
    }
    
    if (req.files.audio) {
      uploadedFiles.audio = req.files.audio.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/audio/${file.filename}`
      }));
    }
    
    const totalFiles = uploadedFiles.images.length + uploadedFiles.audio.length;
    
    if (totalFiles === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'No files provided'
      });
    }
    
    res.json({
      success: true,
      data: uploadedFiles,
      summary: {
        totalFiles,
        images: uploadedFiles.images.length,
        audio: uploadedFiles.audio.length
      },
      message: `${totalFiles} files uploaded successfully`
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;