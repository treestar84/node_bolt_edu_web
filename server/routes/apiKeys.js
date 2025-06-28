import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { getApiKeys, addApiKey, deleteApiKey } from '../data/store.js';

const router = express.Router();

// Get all API keys (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const apiKeys = getApiKeys();
    
    // Don't expose the actual key values in the list
    const safeKeys = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      description: key.description,
      active: key.active,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      usageCount: key.usageCount,
      keyPreview: `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 4)}`
    }));
    
    res.json({
      success: true,
      data: safeKeys,
      count: safeKeys.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create new API key (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'API key name is required'
      });
    }
    
    const newKey = await addApiKey({
      name: name.trim(),
      description: description ? description.trim() : ''
    });
    
    res.status(201).json({
      success: true,
      data: newKey,
      message: 'API key created successfully',
      warning: 'Save this key securely - it will not be shown again!'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Delete API key (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const deleted = await deleteApiKey(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Not found',
        message: 'API key not found'
      });
    }
    
    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;