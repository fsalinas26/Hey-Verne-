const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../services/database');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const sessionId = req.params.sessionId || uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${sessionId}-photo${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/sessions/create - Create new session
router.post('/create', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const storyType = req.body.storyType || 'space';

    await db.createSession(sessionId, storyType);

    res.json({
      sessionId,
      createdAt: new Date().toISOString(),
      success: true
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session'
    });
  }
});

// POST /api/sessions/:sessionId/upload-photo - Upload kid's photo
router.post('/:sessionId/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No photo uploaded'
      });
    }

    const sessionId = req.params.sessionId;
    const photoUrl = `/uploads/${req.file.filename}`;

    await db.updateSessionPhoto(sessionId, photoUrl);

    // Track interaction
    await db.trackInteraction({
      sessionId,
      pageNumber: 1,
      interactionType: 'photo_upload',
      userInput: 'Photo uploaded',
      responseTimeMs: 0
    });

    res.json({
      success: true,
      photoUrl,
      sessionId
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photo'
    });
  }
});

// GET /api/sessions/:sessionId - Get session details
router.get('/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await db.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const pages = await db.getStoryPages(sessionId);
    const choices = await db.getChoices(sessionId);
    const interactions = await db.getInteractions(sessionId);

    res.json({
      session,
      pages,
      choices,
      interactions,
      success: true
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session'
    });
  }
});

// PUT /api/sessions/:sessionId/complete - Mark session as complete
router.put('/:sessionId/complete', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    await db.updateSessionStatus(sessionId, 'completed');

    res.json({
      success: true,
      sessionId
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete session'
    });
  }
});

module.exports = router;

