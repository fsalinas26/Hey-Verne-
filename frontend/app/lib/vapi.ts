// Vapi client wrapper for Hey Verne!

import Vapi from '@vapi-ai/web';

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY || '';
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';

export interface VapiCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

class VapiClient {
  private vapi: Vapi | null = null;
  private callbacks: VapiCallbacks = {};

  initialize(callbacks?: VapiCallbacks) {
    if (!VAPI_API_KEY) {
      console.warn('Vapi API key not configured');
      return;
    }

    this.vapi = new Vapi(VAPI_API_KEY);
    this.callbacks = callbacks || {};

    // Set up event listeners
    if (this.vapi) {
      this.vapi.on('speech-start', () => {
        console.log('Captain Verne is speaking...');
        this.callbacks.onSpeechStart?.();
      });

      this.vapi.on('speech-end', () => {
        console.log('Captain Verne finished speaking');
        this.callbacks.onSpeechEnd?.();
      });

      this.vapi.on('message', (message: any) => {
        console.log('Vapi message:', message);
        this.callbacks.onMessage?.(message);
      });

      this.vapi.on('error', (error: any) => {
        console.error('Vapi error:', error);
        this.callbacks.onError?.(error);
      });

      this.vapi.on('call-start', () => {
        console.log('Call started');
        this.callbacks.onCallStart?.();
      });

      this.vapi.on('call-end', () => {
        console.log('Call ended');
        this.callbacks.onCallEnd?.();
      });
    }
  }

  async start(customPrompt?: string) {
    if (!this.vapi) {
      throw new Error('Vapi not initialized');
    }

    try {
      if (VAPI_ASSISTANT_ID) {
        // Use pre-configured assistant
        await this.vapi.start({
          assistantId: VAPI_ASSISTANT_ID
        });
      } else {
        // Use inline configuration
        await this.vapi.start({
          assistant: {
            model: {
              provider: 'openai',
              model: 'gpt-4',
              temperature: 0.7,
              maxTokens: 150
            },
            voice: {
              provider: 'elevenlabs',
              voiceId: 'EXAVITQu4vr4xnSDxMaL', // Female calm voice
              stability: 0.75,
              similarityBoost: 0.75,
              speed: 0.9
            },
            transcriber: {
              provider: 'deepgram',
              model: 'nova-2',
              language: 'en'
            },
            firstMessage: customPrompt || "Hi! I'm Captain Verne! Ready for a space adventure?",
            systemPrompt: this.getSystemPrompt()
          }
        });
      }
    } catch (error) {
      console.error('Error starting Vapi call:', error);
      throw error;
    }
  }

  async stop() {
    if (this.vapi) {
      await this.vapi.stop();
    }
  }

  send(message: string) {
    if (this.vapi) {
      this.vapi.send({
        type: 'add-message',
        message: {
          role: 'system',
          content: message
        }
      });
    }
  }

  isActive(): boolean {
    return this.vapi !== null;
  }

  private getSystemPrompt(): string {
    return `You are Captain Verne, a friendly and patient space explorer guide for preschool children (ages 3-5).

CHARACTER:
- Warm, encouraging, and enthusiastic
- Use very simple words and short sentences (5-8 words max)
- Speak slowly and clearly
- Celebrate every response the child gives

TEACHING GOALS:
You're teaching three concepts through adventure:
1. The solar system has 8 planets
2. The sun is a star that gives light and heat
3. Gravity keeps planets in orbit and things from floating away

CONVERSATION RULES:
- Keep each story segment under 20 seconds (3-4 short sentences)
- Always present 2-3 simple choices, but accept creative answers too
- If child says something unexpected, incorporate it positively
- Use sound effects words: "Whoosh!", "Zoom!", "Wow!"
- Repeat important educational concepts naturally
- Never use complex vocabulary

RESPONSE FORMAT:
After telling a story segment, ask: "What should we do next?"
Then suggest 2 options: "Should we [option A] or [option B]?"

EXAMPLE INTERACTIONS:
"We're flying through space! Whoosh! Look, there's Mars! It's red and rocky. Should we land on Mars or visit Jupiter instead?"

If child says something off-script like "I want to see aliens":
"Aliens! How exciting! Maybe aliens live on Mars. Let's go see! Ready for landing?"`;
  }
}

export const vapiClient = new VapiClient();

