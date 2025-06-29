import fs from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = join(process.cwd(), 'server/data');
const WORDS_FILE = join(DATA_DIR, 'words.json');
const BOOKS_FILE = join(DATA_DIR, 'books.json');
const API_KEYS_FILE = join(DATA_DIR, 'apiKeys.json');

// Initialize data files if they don't exist
const initializeDataFiles = async () => {
  try {
    // Ensure data directory exists
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }

    // Initialize words file
    try {
      await fs.access(WORDS_FILE);
    } catch {
      await fs.writeFile(WORDS_FILE, JSON.stringify([], null, 2));
    }
    
    // Initialize books file
    try {
      await fs.access(BOOKS_FILE);
    } catch {
      await fs.writeFile(BOOKS_FILE, JSON.stringify([], null, 2));
    }
    
    // Initialize API keys file
    try {
      await fs.access(API_KEYS_FILE);
    } catch {
      await fs.writeFile(API_KEYS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
};

// Words management
export const getWords = async () => {
  try {
    await initializeDataFiles();
    const data = await fs.readFile(WORDS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading words:', error);
    return [];
  }
};

export const saveWords = async (words) => {
  try {
    await initializeDataFiles();
    await fs.writeFile(WORDS_FILE, JSON.stringify(words, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving words:', error);
    return false;
  }
};

export const addWord = async (wordData) => {
  const words = await getWords();
  const newWord = {
    id: uuidv4(),
    ...wordData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  words.push(newWord);
  await saveWords(words);
  return newWord;
};

export const updateWord = async (id, updateData) => {
  const words = await getWords();
  const index = words.findIndex(w => w.id === id);
  
  if (index === -1) {
    return null;
  }
  
  words[index] = {
    ...words[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  await saveWords(words);
  return words[index];
};

export const deleteWord = async (id) => {
  const words = await getWords();
  const filteredWords = words.filter(w => w.id !== id);
  
  if (filteredWords.length === words.length) {
    return false; // Word not found
  }
  
  await saveWords(filteredWords);
  return true;
};

// Books management
export const getBooks = async () => {
  try {
    await initializeDataFiles();
    const data = await fs.readFile(BOOKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading books:', error);
    return [];
  }
};

export const saveBooks = async (books) => {
  try {
    await initializeDataFiles();
    await fs.writeFile(BOOKS_FILE, JSON.stringify(books, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving books:', error);
    return false;
  }
};

export const addBook = async (bookData) => {
  const books = await getBooks();
  const newBook = {
    id: uuidv4(),
    ...bookData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  books.push(newBook);
  await saveBooks(books);
  return newBook;
};

export const updateBook = async (id, updateData) => {
  const books = await getBooks();
  const index = books.findIndex(b => b.id === id);
  
  if (index === -1) {
    return null;
  }
  
  books[index] = {
    ...books[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  await saveBooks(books);
  return books[index];
};

export const deleteBook = async (id) => {
  const books = await getBooks();
  const filteredBooks = books.filter(b => b.id !== id);
  
  if (filteredBooks.length === books.length) {
    return false; // Book not found
  }
  
  await saveBooks(filteredBooks);
  return true;
};

// API Keys management
export const getApiKeys = async () => {
  try {
    await initializeDataFiles();
    const data = await fs.readFile(API_KEYS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading API keys:', error);
    return [];
  }
};

export const saveApiKeys = async (apiKeys) => {
  try {
    await initializeDataFiles();
    await fs.writeFile(API_KEYS_FILE, JSON.stringify(apiKeys, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving API keys:', error);
    return false;
  }
};

export const addApiKey = async (keyData) => {
  const apiKeys = await getApiKeys();
  const newKey = {
    id: uuidv4(),
    key: uuidv4().replace(/-/g, ''),
    name: keyData.name,
    description: keyData.description || '',
    active: true,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usageCount: 0
  };
  apiKeys.push(newKey);
  await saveApiKeys(apiKeys);
  return newKey;
};

export const deleteApiKey = async (id) => {
  const apiKeys = await getApiKeys();
  const filteredKeys = apiKeys.filter(k => k.id !== id);
  
  if (filteredKeys.length === apiKeys.length) {
    return false; // Key not found
  }
  
  await saveApiKeys(filteredKeys);
  return true;
};