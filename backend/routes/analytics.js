const express = require('express');
const router = express.Router();
const db = require('../services/database');

// POST /api/analytics/track - Track an interaction
router.post('/track', async (req, res) => {
  try {
    const {
      sessionId,
      pageNumber,
      interactionType,
      userInput,
      responseTimeMs
    } = req.body;

    if (!sessionId || !interactionType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    await db.trackInteraction({
      sessionId,
      pageNumber: pageNumber || null,
      interactionType,
      userInput: userInput || null,
      responseTimeMs: responseTimeMs || 0
    });

    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track interaction'
    });
  }
});

// GET /api/analytics/dashboard - Get aggregated analytics for dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get basic session stats
    const sessionStats = await db.getSessionStats();
    const allSessions = await db.getAllSessions();

    // Calculate metrics for different audiences
    const metrics = {
      // Overall stats
      totalSessions: sessionStats.total_sessions || 0,
      completedSessions: sessionStats.completed_sessions || 0,
      completionRate: sessionStats.total_sessions > 0 
        ? (sessionStats.completed_sessions / sessionStats.total_sessions).toFixed(2)
        : 0,
      avgSessionTime: sessionStats.avg_session_time || 0,

      // Parents metrics
      parentMetrics: await calculateParentMetrics(allSessions),

      // Teachers metrics
      teacherMetrics: await calculateTeacherMetrics(allSessions),

      // Psychologists metrics
      psychologistMetrics: await calculatePsychologistMetrics(allSessions)
    };

    res.json({
      success: true,
      ...metrics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// GET /api/analytics/session/:sessionId - Get detailed analytics for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    const session = await db.getSession(sessionId);
    const interactions = await db.getInteractions(sessionId);
    const choices = await db.getChoices(sessionId);
    const pages = await db.getStoryPages(sessionId);

    // Calculate session-specific metrics
    const sessionMetrics = {
      totalInteractions: interactions.length,
      voiceInputs: interactions.filter(i => i.interaction_type === 'voice_input').length,
      silencePeriods: interactions.filter(i => i.interaction_type === 'silence').length,
      avgResponseTime: calculateAvgResponseTime(interactions),
      choicesMade: choices.length,
      defaultChoices: choices.filter(c => c.was_default).length,
      creativeChoices: choices.filter(c => !c.was_default).length,
      pagesCompleted: pages.length,
      timeSpentPerPage: pages.map(p => ({
        page: p.page_number,
        timeSpent: p.time_spent_seconds
      }))
    };

    res.json({
      success: true,
      session,
      metrics: sessionMetrics,
      interactions,
      choices,
      pages
    });
  } catch (error) {
    console.error('Error fetching session analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session analytics'
    });
  }
});

// Helper functions for calculating metrics

async function calculateParentMetrics(sessions) {
  const allInteractions = [];
  const allChoices = [];
  
  for (const session of sessions) {
    const interactions = await db.getInteractions(session.id);
    const choices = await db.getChoices(session.id);
    allInteractions.push(...interactions);
    allChoices.push(...choices);
  }

  // Analyze favorite choices
  const choiceCounts = {};
  allChoices.forEach(choice => {
    const c = choice.kid_choice;
    choiceCounts[c] = (choiceCounts[c] || 0) + 1;
  });

  const favoriteChoices = Object.entries(choiceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([choice, count]) => ({ choice, count }));

  // Calculate average response time
  const responseTimes = allInteractions
    .filter(i => i.response_time_ms > 0)
    .map(i => i.response_time_ms);
  
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  return {
    favoriteChoices,
    avgResponseTime: Math.round(avgResponseTime),
    totalEngagement: allInteractions.length,
    engagementLevel: avgResponseTime < 5000 ? 'High' : avgResponseTime < 10000 ? 'Medium' : 'Low'
  };
}

async function calculateTeacherMetrics(sessions) {
  const allPages = [];
  const allInteractions = [];
  
  for (const session of sessions) {
    const pages = await db.getStoryPages(session.id);
    const interactions = await db.getInteractions(session.id);
    allPages.push(...pages);
    allInteractions.push(...interactions);
  }

  // Educational concept coverage
  const conceptCoverage = {
    solar_system_planets: 0,
    sun_is_a_star: 0,
    gravity: 0
  };

  allPages.forEach(page => {
    if (page.educational_concept && conceptCoverage[page.educational_concept] !== undefined) {
      conceptCoverage[page.educational_concept]++;
    }
  });

  // Language complexity in responses
  const responses = allInteractions
    .filter(i => i.interaction_type === 'voice_input' && i.user_input)
    .map(i => i.user_input);

  const avgWordCount = responses.length > 0
    ? responses.reduce((sum, r) => sum + r.split(' ').length, 0) / responses.length
    : 0;

  return {
    conceptCoverage,
    avgWordCount: avgWordCount.toFixed(1),
    totalResponses: responses.length,
    vocabularyLevel: avgWordCount < 3 ? 'Simple' : avgWordCount < 6 ? 'Moderate' : 'Complex'
  };
}

async function calculatePsychologistMetrics(sessions) {
  const allChoices = [];
  const allInteractions = [];
  
  for (const session of sessions) {
    const choices = await db.getChoices(session.id);
    const interactions = await db.getInteractions(session.id);
    allChoices.push(...choices);
    allInteractions.push(...interactions);
  }

  // Decision-making patterns
  const defaultChoiceCount = allChoices.filter(c => c.was_default).length;
  const creativeChoiceCount = allChoices.length - defaultChoiceCount;
  
  const decisionPattern = creativeChoiceCount > defaultChoiceCount 
    ? 'Adventurous' 
    : creativeChoiceCount === defaultChoiceCount 
    ? 'Balanced' 
    : 'Cautious';

  // Silence periods (hesitation indicators)
  const silencePeriods = allInteractions.filter(i => 
    i.interaction_type === 'silence' || i.interaction_type === 'default_path'
  ).length;

  const hesitationRate = allInteractions.length > 0
    ? (silencePeriods / allInteractions.length).toFixed(2)
    : 0;

  return {
    decisionPattern,
    creativeChoices: creativeChoiceCount,
    defaultChoices: defaultChoiceCount,
    silencePeriods,
    hesitationRate,
    confidenceLevel: hesitationRate < 0.2 ? 'High' : hesitationRate < 0.4 ? 'Medium' : 'Low'
  };
}

function calculateAvgResponseTime(interactions) {
  const responseTimes = interactions
    .filter(i => i.response_time_ms > 0)
    .map(i => i.response_time_ms);
  
  return responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;
}

module.exports = router;

