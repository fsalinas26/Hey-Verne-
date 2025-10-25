const express = require('express');
const router = express.Router();
const db = require('../services/database');
const storyGenerator = require('../services/storyGenerator');
const geminiService = require('../services/gemini');

// Store in-progress image generation tasks
const imageGenerationTasks = new Map();

// POST /api/story/next-page - Progress to next story page
router.post('/next-page', async (req, res) => {
  try {
    const {
      sessionId,
      currentPage,
      kidResponse,
      responseTime,
      suggestedOptions
    } = req.body;

    if (!sessionId || currentPage === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const nextPage = currentPage + 1;

    // Get session to retrieve photo URL
    const session = await db.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Track the kid's response
    if (kidResponse && currentPage > 1) {
      await db.trackInteraction({
        sessionId,
        pageNumber: currentPage,
        interactionType: 'voice_input',
        userInput: kidResponse,
        responseTimeMs: responseTime || 0
      });
    }

    // Process user response to determine chosen path
    let chosenPlanet = 'Mars'; // Default
    let kidChoice = null;
    let wasDefault = false;

    if (kidResponse && suggestedOptions) {
      const processed = storyGenerator.processUserResponse(
        currentPage,
        kidResponse,
        suggestedOptions
      );
      kidChoice = processed.choice;
      wasDefault = processed.wasDefault;
      
      if (processed.extractedPlanet) {
        chosenPlanet = processed.extractedPlanet;
      }

      // Track choice
      await db.trackChoice({
        sessionId,
        pageNumber: currentPage,
        suggestedOptions,
        kidChoice,
        wasDefault
      });
    }

    // Get next page content
    const pageContent = storyGenerator.getPageContent(nextPage, chosenPlanet);

    // Generate images asynchronously (except for page 1 and 5)
    let panel1TaskId = null;

    if (nextPage >= 2 && nextPage <= 4) {
      const photoPath = session.kid_photo_url || null; // Optional - use if available

      try {
        // Generate dynamic image prompt based on kid's actual response
        const dynamicPrompt = storyGenerator.getDynamicImagePrompt(
          nextPage, 
          kidResponse || '', 
          chosenPlanet
        );
        
        console.log('🎨 Generating DYNAMIC image for page', nextPage);
        console.log('📍 Destination mentioned:', dynamicPrompt.destination);
        console.log('💬 Kid said:', dynamicPrompt.context);
        console.log('🖼️ Image prompt:', dynamicPrompt.prompt.substring(0, 100) + '...');
        
        // Start image generation with Gemini using dynamic prompt
        const result1 = await geminiService.generateImage(dynamicPrompt.prompt, photoPath);
        
        panel1TaskId = result1.taskId;

        console.log('✅ Image task created:', {panel1TaskId});

        // Store task ID for polling (Gemini completes immediately, but keeping for compatibility)
        imageGenerationTasks.set(`${sessionId}-${nextPage}-panel1`, panel1TaskId);
      } catch (error) {
        console.error('❌ Error starting image generation:', error);
        // Continue without images - will use placeholders
      }
    }

    // Create story page record
    await db.createStoryPage({
      sessionId,
      pageNumber: nextPage,
      educationalConcept: pageContent.educationalConcept,
      storyText: pageContent.storyText,
      agentPrompt: pageContent.agentPrompt,
      kidResponse: kidResponse || null,
      kidResponseTimestamp: kidResponse ? new Date().toISOString() : null,
      panel1Url: null, // Will be updated when images complete
      panel2Url: null,
      timeSpentSeconds: Math.floor((responseTime || 0) / 1000)
    });

    res.json({
      success: true,
      pageNumber: nextPage,
      storyText: pageContent.storyText,
      agentPrompt: pageContent.agentPrompt,
      suggestedOptions: pageContent.suggestedOptions || [],
      educationalConcept: pageContent.educationalConcept,
      panel1Status: panel1TaskId ? 'generating' : 'none',
      imageIds: {
        panel1: panel1TaskId
      },
      chosenPlanet
    });
  } catch (error) {
    console.error('Error processing next page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process next page',
      details: error.message
    });
  }
});

// GET /api/story/check-images - Check image generation status
router.get('/check-images', async (req, res) => {
  try {
    const { sessionId, pageNumber, taskId1, taskId2 } = req.query;

    if (!taskId1 && !taskId2) {
      return res.status(400).json({
        success: false,
        error: 'At least one task ID required'
      });
    }

    const results = [];

    if (taskId1) {
      const status1 = await geminiService.checkTaskStatus(taskId1);
      results.push({
        panel: 'panel1',
        taskId: taskId1,
        ...status1
      });

      // If completed, update database
      if (status1.status === 'completed' && status1.url) {
        await db.updateStoryPageImages(sessionId, parseInt(pageNumber), status1.url, null);
      }
    }

    if (taskId2) {
      const status2 = await geminiService.checkTaskStatus(taskId2);
      results.push({
        panel: 'panel2',
        taskId: taskId2,
        ...status2
      });

      // If completed, update database
      if (status2.status === 'completed' && status2.url) {
        const pages = await db.getStoryPages(sessionId);
        const currentPage = pages.find(p => p.page_number === parseInt(pageNumber));
        await db.updateStoryPageImages(
          sessionId, 
          parseInt(pageNumber), 
          currentPage?.panel_1_url || null,
          status2.url
        );
      }
    }

    res.json({
      success: true,
      images: results
    });
  } catch (error) {
    console.error('Error checking image status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check image status'
    });
  }
});

// GET /api/story/content/:pageNumber - Get story content for a specific page
router.get('/content/:pageNumber', async (req, res) => {
  try {
    const pageNumber = parseInt(req.params.pageNumber);
    const chosenPlanet = req.query.planet || 'Mars';

    const content = storyGenerator.getPageContent(pageNumber, chosenPlanet);

    res.json({
      success: true,
      ...content
    });
  } catch (error) {
    console.error('Error fetching story content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch story content'
    });
  }
});

module.exports = router;

