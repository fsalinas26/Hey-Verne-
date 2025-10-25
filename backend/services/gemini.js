const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_FLASH_API_KEY;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

class GeminiService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('Warning: GEMINI_FLASH_API_KEY not set in environment');
    }
    this.ai = new GoogleGenAI({
      apiKey: this.apiKey
    });
    this.model = 'gemini-2.5-flash-image';
    
    // Task tracking for compatibility with polling API
    this.tasks = new Map();
  }

  async generateImage(prompt, referenceImagePath) {
    try {
      // Generate unique task ID
      const taskId = `gemini-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Mark task as generating
      this.tasks.set(taskId, { status: 'generating', progress: 0 });

      // Read reference image
      let base64Image = null;
      let mimeType = 'image/jpeg';
      
      if (referenceImagePath) {
        // Handle both URL paths and file paths
        const imagePath = referenceImagePath.startsWith('http') 
          ? path.join(UPLOAD_DIR, referenceImagePath.split('/uploads/')[1])
          : referenceImagePath.startsWith('/uploads/')
            ? path.join(UPLOAD_DIR, referenceImagePath.replace('/uploads/', ''))
            : referenceImagePath;
        
        const imageBuffer = await fs.readFile(imagePath);
        base64Image = imageBuffer.toString('base64');
        
        // Determine mime type from extension
        const ext = path.extname(imagePath).toLowerCase();
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.webp') mimeType = 'image/webp';
      }

      // Enhance prompt for cartoon/illustration style
      const enhancedPrompt = `${prompt} IMPORTANT: Make this a CARTOON illustration - simplified shapes, big eyes, rounded features, bold outlines, flat colors like animated TV shows (Adventure Time, Bluey, Paw Patrol style). Transform any people into cartoon characters. NOT realistic, NOT photographic. Pure cartoon art for young children.`;

      console.log(`🎨 Generating image with Gemini for task ${taskId}...`);

      // Generate image with Gemini
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [
          {
            role: 'user',
            parts: base64Image ? [
              { text: enhancedPrompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image
                }
              }
            ] : [
              { text: enhancedPrompt }
            ]
          }
        ]
      });

      // Extract generated image
      let generatedImageUrl = null;
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          // Save image to uploads directory
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, 'base64');
          const filename = `${taskId}.png`;
          const filepath = path.join(UPLOAD_DIR, filename);
          
          await fs.writeFile(filepath, buffer);
          generatedImageUrl = `/uploads/${filename}`;
          
          console.log(`✅ Image saved: ${filename}`);
          break;
        }
      }

      if (!generatedImageUrl) {
        throw new Error('No image data returned from Gemini');
      }

      // Update task status
      this.tasks.set(taskId, {
        status: 'completed',
        progress: 100,
        url: generatedImageUrl
      });

      return {
        taskId: taskId,
        status: 'completed',
        url: generatedImageUrl
      };
    } catch (error) {
      console.error('Gemini generation error:', error.message);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  async checkTaskStatus(taskId) {
    try {
      const task = this.tasks.get(taskId);
      
      if (!task) {
        return {
          status: 'error',
          error: 'Task not found'
        };
      }

      return {
        status: task.status,
        url: task.url || null,
        progress: task.progress || 0
      };
    } catch (error) {
      console.error('Gemini status check error:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async pollUntilComplete(taskId, maxAttempts = 30, pollInterval = 2000) {
    // Since Gemini generates synchronously, this should return immediately
    const result = await this.checkTaskStatus(taskId);
    
    if (result.status === 'completed') {
      return result.url;
    } else if (result.status === 'failed' || result.status === 'error') {
      throw new Error(result.error || 'Image generation failed');
    }

    throw new Error('Image generation incomplete');
  }

  async generateAndWait(prompt, referenceImagePath) {
    const result = await this.generateImage(prompt, referenceImagePath);
    return result.url;
  }

  // Clean up old tasks (optional, for memory management)
  cleanupOldTasks(maxAge = 3600000) { // 1 hour default
    const now = Date.now();
    for (const [taskId, task] of this.tasks.entries()) {
      const taskTime = parseInt(taskId.split('-')[1]);
      if (now - taskTime > maxAge) {
        this.tasks.delete(taskId);
      }
    }
  }
}

module.exports = new GeminiService();

