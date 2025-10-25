// Demo Mode for Hey Verne! - Works without external APIs
// Uses browser's built-in speech synthesis

export class DemoVoiceClient {
  private synth: SpeechSynthesis | null = null;
  private callbacks: any = {};
  private recognition: any = null;
  private isActive: boolean = false;

  initialize(callbacks: any) {
    this.callbacks = callbacks;
    
    // Use browser's speech synthesis
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }

    // Use browser's speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('📝 Heard:', transcript);
        
        this.callbacks.onMessage?.({
          type: 'transcript',
          role: 'user',
          transcript: transcript
        });
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Timeout - trigger default
          setTimeout(() => {
            this.callbacks.onMessage?.({
              type: 'transcript',
              role: 'user',
              transcript: '' // Empty triggers default path
            });
          }, 500);
        }
      };

      this.recognition.onend = () => {
        console.log('Recognition ended');
        this.callbacks.onSpeechEnd?.();
      };
    }
  }

  async start(firstMessage?: string) {
    console.log('🎭 DEMO MODE: Using browser speech synthesis');
    this.isActive = true;
    
    // Start with first message
    if (firstMessage) {
      await this.speak(firstMessage);
    }
    
    this.callbacks.onCallStart?.();
  }

  async speak(text: string) {
    if (!this.synth) {
      console.warn('Speech synthesis not available');
      return;
    }

    return new Promise<void>((resolve) => {
      this.callbacks.onSpeechStart?.();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to use a female voice
      const voices = this.synth!.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.includes('Female') || 
        v.name.includes('Samantha') || 
        v.name.includes('Victoria') ||
        v.name.includes('Karen')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.rate = 0.9; // Slightly slower for kids
      utterance.pitch = 1.1; // Slightly higher pitch
      
      utterance.onend = () => {
        this.callbacks.onSpeechEnd?.();
        
        // After speaking, start listening
        setTimeout(() => {
          this.startListening();
        }, 500);
        
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('Speech error:', error);
        this.callbacks.onSpeechEnd?.();
        resolve();
      };

      this.synth!.speak(utterance);
    });
  }

  startListening() {
    if (!this.recognition) {
      console.warn('Speech recognition not available');
      // Fallback: simulate response after 10 seconds
      setTimeout(() => {
        this.callbacks.onMessage?.({
          type: 'transcript',
          role: 'user',
          transcript: '' // Triggers default path
        });
      }, 10000);
      return;
    }

    try {
      this.recognition.start();
      console.log('🎤 Listening...');
    } catch (error) {
      console.error('Recognition start error:', error);
    }
  }

  send(message: string) {
    // In demo mode, immediately speak the message
    this.speak(message);
  }

  async stop() {
    this.isActive = false;
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.recognition) {
      this.recognition.stop();
    }
    this.callbacks.onCallEnd?.();
  }

  isActiveClient(): boolean {
    return this.isActive;
  }
}

export const demoVoiceClient = new DemoVoiceClient();

