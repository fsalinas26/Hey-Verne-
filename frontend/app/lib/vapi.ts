// Vapi client wrapper for Hey Verne! - Using official Vapi Web SDK

import Vapi from '@vapi-ai/web';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY || '';
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
    if (!VAPI_PUBLIC_KEY) {
      throw new Error('NEXT_PUBLIC_VAPI_API_KEY is not configured');
    }

    console.log('🔧 Initializing Vapi with key:', VAPI_PUBLIC_KEY.substring(0, 8) + '...');
    
    this.vapi = new Vapi(VAPI_PUBLIC_KEY);
    this.callbacks = callbacks || {};

    // Set up event listeners based on official docs
    if (this.vapi) {
      // Speech events
      this.vapi.on('speech-start', () => {
        console.log('🗣️ Speech started');
        this.callbacks.onSpeechStart?.();
      });

      this.vapi.on('speech-end', () => {
        console.log('🔇 Speech ended');
        this.callbacks.onSpeechEnd?.();
      });

      // Message events
      this.vapi.on('message', (message: any) => {
        console.log('📨 Message received:', message);
        this.callbacks.onMessage?.(message);
      });

      // Call events
      this.vapi.on('call-start', () => {
        console.log('📞 Call started');
        this.callbacks.onCallStart?.();
      });

      this.vapi.on('call-end', () => {
        console.log('📴 Call ended');
        this.callbacks.onCallEnd?.();
      });

      // Error events
      this.vapi.on('error', (error: any) => {
        console.error('❌ Vapi error:', error);
        this.callbacks.onError?.(error);
      });
    }
  }

  async start(firstMessage?: string) {
    if (!this.vapi) {
      throw new Error('Vapi not initialized');
    }

    console.log('🚀 Starting Vapi call...');
    console.log('📋 Assistant ID:', VAPI_ASSISTANT_ID || 'None - using inline config');

    try {
      const config: any = VAPI_ASSISTANT_ID
        ? {
            // Use pre-configured assistant from dashboard
            assistantId: VAPI_ASSISTANT_ID
          }
        : {
            // Inline assistant configuration
            assistant: {
              name: 'Captain Verne',
              firstMessage: firstMessage || "Hi! I'm Captain Verne! Ready for a space adventure?",
              model: {
                provider: 'openai',
                model: 'gpt-4',
                temperature: 0.7,
                messages: [
                  {
                    role: 'system',
                    content: this.getSystemPrompt()
                  }
                ]
              },
              voice: {
                provider: '11labs',
                voiceId: 'rachel', // Female calm voice
                stability: 0.5,
                similarityBoost: 0.75
              },
              transcriber: {
                provider: 'deepgram',
                model: 'nova-2',
                language: 'en-US'
              }
            }
          };

      console.log('📞 Initiating call with config:', config.assistantId ? 'Assistant ID' : 'Inline');
      await this.vapi.start(config);
      console.log('✅ Call started successfully!');
    } catch (error: any) {
      console.error('❌ Failed to start Vapi:');
      console.error('Message:', error?.message || 'Unknown error');
      console.error('Details:', error);
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
    return `You are Captain Verne, a warm and patient space guide for young children (ages 3-5).

Keep sentences very short (5-8 words). Use simple words. Be enthusiastic!

You're teaching: solar system planets, sun is a star, and gravity.

After each story part, ask what to do next. Give 2 simple choices, but accept any creative answer too.

Use fun sounds: "Whoosh!", "Zoom!", "Wow!"

Example: "We're in space! Whoosh! See Mars? It's red! Should we land there or visit Jupiter?"`;
  }
}

export const vapiClient = new VapiClient();

