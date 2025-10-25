const axios = require('axios');

const RUNWAY_API_URL = 'https://api.dev.runwayml.com/v1';
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

class RunwayService {
  constructor() {
    this.apiKey = RUNWAY_API_KEY;
    if (!this.apiKey) {
      console.warn('Warning: RUNWAY_API_KEY not set in environment');
    }
  }

  async generateImage(prompt, referenceImageUrl) {
    try {
      const response = await axios.post(
        `${RUNWAY_API_URL}/text_to_image`,
        {
          prompt: prompt,
          referenceImages: referenceImageUrl ? [referenceImageUrl] : [],
          width: 1024,
          height: 768,
          numberOfImages: 1,
          stylePreset: 'children-book-illustration'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        taskId: response.data.taskId || response.data.id,
        status: 'generating'
      };
    } catch (error) {
      console.error('RunwayML generation error:', error.response?.data || error.message);
      throw new Error('Image generation failed');
    }
  }

  async checkTaskStatus(taskId) {
    try {
      const response = await axios.get(
        `${RUNWAY_API_URL}/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const data = response.data;
      
      if (data.status === 'completed' || data.status === 'SUCCEEDED') {
        return {
          status: 'completed',
          url: data.output?.[0]?.url || data.output?.url || null
        };
      } else if (data.status === 'failed' || data.status === 'FAILED') {
        return {
          status: 'failed',
          error: data.error || 'Image generation failed'
        };
      } else {
        return {
          status: 'generating',
          progress: data.progress || 0
        };
      }
    } catch (error) {
      console.error('RunwayML status check error:', error.response?.data || error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async pollUntilComplete(taskId, maxAttempts = 30, pollInterval = 2000) {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.checkTaskStatus(taskId);
      
      if (result.status === 'completed') {
        return result.url;
      } else if (result.status === 'failed' || result.status === 'error') {
        throw new Error(result.error || 'Image generation failed');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Image generation timeout');
  }

  async generateAndWait(prompt, referenceImageUrl) {
    const { taskId } = await this.generateImage(prompt, referenceImageUrl);
    const imageUrl = await this.pollUntilComplete(taskId);
    return imageUrl;
  }
}

module.exports = new RunwayService();

