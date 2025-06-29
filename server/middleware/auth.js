import jwt from 'jsonwebtoken';
import { getApiKeys } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Admin authentication middleware
export const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin token required'
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

// API key authentication middleware
export const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required in X-API-Key header'
    });
  }
  
  try {
    const apiKeys = await getApiKeys();
    const keyData = apiKeys.find(key => key.key === apiKey && key.active);
    
    if (!keyData) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or inactive API key'
      });
    }
    
    // Update last used timestamp
    keyData.lastUsed = new Date().toISOString();
    keyData.usageCount = (keyData.usageCount || 0) + 1;
    
    req.apiKey = keyData;
    next();
  } catch (error) {
    console.error('Error authenticating API key:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Error validating API key'
    });
  }
};

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};