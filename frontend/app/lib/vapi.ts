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
      this.vapi.on('error', async (error: any) => {
        console.error('❌ Vapi error event fired!');
        console.error('Error type:', typeof error);
        console.error('Full error object:', error);
        console.error('Error.type:', error?.type);
        console.error('Error.stage:', error?.stage);
        
        // Extract detailed error from Response object
        if (error?.error instanceof Response) {
          const response: any = error.error;
          console.error('📍 Response status:', response.status);
          console.error('📍 Response statusText:', response.statusText);
          console.error('📍 Response.data:', response.data);
          console.error('📍 Response.error:', response.error);
          
          // The error data is in response.error (custom property from Vapi SDK)
          if (response.error) {
            console.error('🔴 VAPI ERROR DETAILS:', JSON.stringify(response.error, null, 2));
            
            // Extract validation messages
            if (response.error.message) {
              console.error('🔴 VALIDATION ERRORS:');
              if (Array.isArray(response.error.message)) {
                response.error.message.forEach((msg: string, idx: number) => {
                  console.error(`  ❌ ${idx + 1}. ${msg}`);
                });
              } else {
                console.error('  ❌', response.error.message);
              }
            }
            
            console.error('🔴 Error Type:', response.error.error);
            console.error('🔴 Status Code:', response.error.statusCode);
          } else {
            // Try to read the response body if error property not available
            try {
              const clonedResponse = response.clone();
              const errorData = await clonedResponse.json();
              console.error('🔴 VAPI ERROR DETAILS (from body):', JSON.stringify(errorData, null, 2));
              
              if (errorData?.error?.message && Array.isArray(errorData.error.message)) {
                console.error('🔴 VALIDATION ERRORS:');
                errorData.error.message.forEach((msg: string, idx: number) => {
                  console.error(`  ❌ ${idx + 1}. ${msg}`);
                });
              }
            } catch (e) {
              console.error('Could not parse error response:', e);
            }
          }
        }
        
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
    console.log('🔑 API Key (first 20 chars):', VAPI_PUBLIC_KEY.substring(0, 20) + '...');

    try {
      // Configure assistant - either use ID or inline config (no wrapper!)
      const config: any = VAPI_ASSISTANT_ID
        ? {
            assistantId: VAPI_ASSISTANT_ID
          }
        : {
            // Inline assistant configuration - passed directly without 'assistant' wrapper
            name: 'Captain Verne',
            firstMessage: firstMessage || "Hi! I'm Captain Verne! Ready to explore space with me?",
            model: {
              provider: 'openai',
              model: 'gpt-4',
              temperature: 0.7,
              systemPrompt: this.getSystemPrompt()
            },
            voice: {
              provider: '11labs',
              voiceId: '21m00Tcm4TlvDq8ikWAM' // Rachel - calm female voice
            },
            transcriber: {
              provider: 'deepgram',
              model: 'nova-2',
              language: 'en-US'
            }
          };

      console.log('📞 Initiating call with config:', JSON.stringify(config, null, 2));
      
      const result = await this.vapi.start(config);
      console.log('✅ Call started successfully!', result);
    } catch (error: any) {
      console.error('❌ Failed to start Vapi:');
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error status:', error?.status || error?.statusCode);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.data);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      console.error('Raw error:', error);
      
      // Try to extract more info from Response object
      if (error instanceof Response) {
        console.error('Response status:', error.status);
        console.error('Response statusText:', error.statusText);
        try {
          const clonedResponse = error.clone();
          const errorData = await clonedResponse.json();
          console.error('🔴 DETAILED ERROR FROM VAPI:', JSON.stringify(errorData, null, 2));
          console.error('Validation errors:', errorData?.error?.message);
        } catch (e) {
          try {
            const text = await error.text();
            console.error('Response body (text):', text);
          } catch (e2) {
            console.error('Could not read response body');
          }
        }
      }
      
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
    return `You are Captain Verne, a warm and enthusiastic space guide for young children (ages 3-5).

CONVERSATION RULES:
- Keep sentences VERY short (5-8 words max)
- Use simple, exciting words kids understand
- Always ASK A QUESTION at the end to keep the conversation going
- Wait for the child's response before continuing
- Be patient and encouraging with every response

YOUR MISSION:
You're taking kids on a space adventure! Teach them about:
- Solar system planets (Mercury, Venus, Mars, Jupiter, Saturn, etc.)
- The sun is a star
- Gravity and why things float in space

INTERACTION STYLE:
1. Start with: "Hi! I'm Captain Verne! Ready to explore space with me?"
2. After they respond, ask: "Where should we go first? Mars or Jupiter?"
3. React to their choice excitedly: "Wow! Great choice! Let's go to [planet]! Zoom!"
4. Teach ONE fun fact about that place
5. Always end with a question: "What should we do now?" or "Want to visit another planet?"
6. Keep the conversation flowing - ALWAYS ask what they want to do next

Use fun sounds: "Whoosh!", "Zoom!", "Wow!", "Beep beep!"

REMEMBER: After EVERY response, ask a new question to keep the adventure going!`;
  }
}

export const vapiClient = new VapiClient();

