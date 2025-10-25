const express = require('express');
const router = express.Router();
const db = require('../services/database');

// POST /api/book/generate - Generate shareable digital book
router.post('/generate', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required'
      });
    }

    // Get session and all pages
    const session = await db.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const pages = await db.getStoryPages(sessionId);
    const choices = await db.getChoices(sessionId);

    // Generate shareable link
    const shareableLink = `/story/${sessionId}`;
    
    // Update session with shareable link
    await db.updateSessionShareableLink(sessionId, shareableLink);

    // Mark session as completed if not already
    if (session.status !== 'completed') {
      await db.updateSessionStatus(sessionId, 'completed');
    }

    res.json({
      success: true,
      shareableLink,
      sessionId,
      pages: pages.length,
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating book:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate book'
    });
  }
});

// GET /api/book/:sessionId - Get book data for display
router.get('/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    const session = await db.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const pages = await db.getStoryPages(sessionId);
    const choices = await db.getChoices(sessionId);

    // Format book data
    const bookData = {
      sessionId,
      createdAt: session.created_at,
      completedAt: session.completed_at,
      storyType: session.story_type,
      kidPhotoUrl: session.kid_photo_url,
      pages: pages.map(page => ({
        pageNumber: page.page_number,
        storyText: page.story_text,
        educationalConcept: page.educational_concept,
        panel1Url: page.panel_1_url,
        panel2Url: page.panel_2_url,
        kidResponse: page.kid_response
      })),
      choices: choices.map(choice => ({
        pageNumber: choice.page_number,
        choice: choice.kid_choice,
        wasDefault: choice.was_default
      })),
      totalPages: pages.length
    };

    res.json({
      success: true,
      book: bookData
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch book'
    });
  }
});

module.exports = router;

