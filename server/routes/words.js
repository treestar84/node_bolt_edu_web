import express from 'express';
import { authenticateApiKey } from '../middleware/auth.js';
import { getWords, addWord, updateWord, deleteWord } from '../data/store.js';

const router = express.Router();

// Get all words (public endpoint)
router.get('/', async (req, res) => {
  try {
    const words = await getWords();
    res.json({
      success: true,
      data: words,
      count: words.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get word by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const words = await getWords();
    const word = words.find(w => w.id === req.params.id);
    
    if (!word) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Word not found'
      });
    }
    
    res.json({
      success: true,
      data: word
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create new word (requires API key)
router.post('/', authenticateApiKey, async (req, res) => {
  try {
    const { name, nameEn, imageUrl, audioKo, audioEn, category } = req.body;
    
    // Validation
    if (!name || !nameEn || !imageUrl || !audioKo || !audioEn || !category) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'All fields are required: name, nameEn, imageUrl, audioKo, audioEn, category'
      });
    }
    
    const wordData = {
      name: name.trim(),
      nameEn: nameEn.trim(),
      imageUrl: imageUrl.trim(),
      audioKo: audioKo.trim(),
      audioEn: audioEn.trim(),
      category: category.trim()
    };
    
    const newWord = await addWord(wordData);
    
    res.status(201).json({
      success: true,
      data: newWord,
      message: 'Word created successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create multiple words (batch creation)
router.post('/batch', authenticateApiKey, async (req, res) => {
  try {
    const { words } = req.body;
    
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Words array is required and must not be empty'
      });
    }
    
    const createdWords = [];
    const errors = [];
    
    for (let i = 0; i < words.length; i++) {
      const wordData = words[i];
      const { name, nameEn, imageUrl, audioKo, audioEn, category } = wordData;
      
      // Validation for each word
      if (!name || !nameEn || !imageUrl || !audioKo || !audioEn || !category) {
        errors.push({
          index: i,
          error: 'Missing required fields',
          data: wordData
        });
        continue;
      }
      
      try {
        const newWord = await addWord({
          name: name.trim(),
          nameEn: nameEn.trim(),
          imageUrl: imageUrl.trim(),
          audioKo: audioKo.trim(),
          audioEn: audioEn.trim(),
          category: category.trim()
        });
        createdWords.push(newWord);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
          data: wordData
        });
      }
    }
    
    res.status(201).json({
      success: true,
      data: {
        created: createdWords,
        errors: errors,
        summary: {
          total: words.length,
          created: createdWords.length,
          failed: errors.length
        }
      },
      message: `Batch operation completed: ${createdWords.length} created, ${errors.length} failed`
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update word (requires API key)
router.put('/:id', authenticateApiKey, async (req, res) => {
  try {
    const { name, nameEn, imageUrl, audioKo, audioEn, category } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (nameEn) updateData.nameEn = nameEn.trim();
    if (imageUrl) updateData.imageUrl = imageUrl.trim();
    if (audioKo) updateData.audioKo = audioKo.trim();
    if (audioEn) updateData.audioEn = audioEn.trim();
    if (category) updateData.category = category.trim();
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'At least one field must be provided for update'
      });
    }
    
    const updatedWord = await updateWord(req.params.id, updateData);
    
    if (!updatedWord) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Word not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedWord,
      message: 'Word updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Delete word (requires API key)
router.delete('/:id', authenticateApiKey, async (req, res) => {
  try {
    const deleted = await deleteWord(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Word not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Word deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;