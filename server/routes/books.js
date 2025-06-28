import express from 'express';
import { authenticateApiKey } from '../middleware/auth.js';
import { getBooks, addBook, updateBook, deleteBook } from '../data/store.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all books (public endpoint)
router.get('/', async (req, res) => {
  try {
    const books = await getBooks();
    res.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get book by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const books = await getBooks();
    const book = books.find(b => b.id === req.params.id);
    
    if (!book) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create new book (requires API key)
router.post('/', authenticateApiKey, async (req, res) => {
  try {
    const { title, coverImage, pages } = req.body;
    
    // Validation
    if (!title || !coverImage || !Array.isArray(pages) || pages.length !== 4) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Title, coverImage, and exactly 4 pages are required'
      });
    }
    
    // Validate each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page.imageUrl || !page.audio) {
        return res.status(400).json({
          error: 'Bad request',
          message: `Page ${i + 1} must have imageUrl and audio`
        });
      }
    }
    
    const bookData = {
      title: title.trim(),
      coverImage: coverImage.trim(),
      pages: pages.map((page, index) => ({
        id: uuidv4(),
        imageUrl: page.imageUrl.trim(),
        audio: page.audio.trim(),
        text: page.text ? page.text.trim() : undefined
      }))
    };
    
    const newBook = await addBook(bookData);
    
    res.status(201).json({
      success: true,
      data: newBook,
      message: 'Book created successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create complete book with all content (one-shot API)
router.post('/complete', authenticateApiKey, async (req, res) => {
  try {
    const { 
      title, 
      coverImage, 
      page1Image, page1Audio, page1Text,
      page2Image, page2Audio, page2Text,
      page3Image, page3Audio, page3Text,
      page4Image, page4Audio, page4Text
    } = req.body;
    
    // Validation
    if (!title || !coverImage || 
        !page1Image || !page1Audio ||
        !page2Image || !page2Audio ||
        !page3Image || !page3Audio ||
        !page4Image || !page4Audio) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Title, coverImage, and all page images and audio are required'
      });
    }
    
    const bookData = {
      title: title.trim(),
      coverImage: coverImage.trim(),
      pages: [
        {
          id: uuidv4(),
          imageUrl: page1Image.trim(),
          audio: page1Audio.trim(),
          text: page1Text ? page1Text.trim() : undefined
        },
        {
          id: uuidv4(),
          imageUrl: page2Image.trim(),
          audio: page2Audio.trim(),
          text: page2Text ? page2Text.trim() : undefined
        },
        {
          id: uuidv4(),
          imageUrl: page3Image.trim(),
          audio: page3Audio.trim(),
          text: page3Text ? page3Text.trim() : undefined
        },
        {
          id: uuidv4(),
          imageUrl: page4Image.trim(),
          audio: page4Audio.trim(),
          text: page4Text ? page4Text.trim() : undefined
        }
      ]
    };
    
    const newBook = await addBook(bookData);
    
    res.status(201).json({
      success: true,
      data: newBook,
      message: 'Complete book created successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update book (requires API key)
router.put('/:id', authenticateApiKey, async (req, res) => {
  try {
    const { title, coverImage, pages } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (coverImage) updateData.coverImage = coverImage.trim();
    if (pages && Array.isArray(pages)) {
      // Validate pages if provided
      if (pages.length !== 4) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'Exactly 4 pages are required'
        });
      }
      
      updateData.pages = pages.map((page, index) => ({
        id: page.id || uuidv4(),
        imageUrl: page.imageUrl ? page.imageUrl.trim() : '',
        audio: page.audio ? page.audio.trim() : '',
        text: page.text ? page.text.trim() : undefined
      }));
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'At least one field must be provided for update'
      });
    }
    
    const updatedBook = await updateBook(req.params.id, updateData);
    
    if (!updatedBook) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedBook,
      message: 'Book updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Delete book (requires API key)
router.delete('/:id', authenticateApiKey, async (req, res) => {
  try {
    const deleted = await deleteBook(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;