'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useStoryStore } from '../../lib/store';
import { uploadPhoto, getNextPage, checkImageStatus, trackInteraction, generateBook } from '../../lib/api';
import { vapiClient } from '../../lib/vapi';
import { demoVoiceClient } from '../../lib/demoMode';
import PhotoUpload from '../../components/PhotoUpload';
import StoryPanel from '../../components/StoryPanel';
import VoiceIndicator from '../../components/VoiceIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const {
    photoUrl,
    currentPage,
    currentStoryText,
    currentPrompt,
    suggestedOptions,
    panel1Url,
    panel2Url,
    imagesLoading,
    isCaptainSpeaking,
    setSessionId,
    setPhotoUrl,
    setCurrentPage,
    setStoryContent,
    setPanelUrls,
    setImagesLoading,
    setCaptainSpeaking,
    startInteraction,
    getInteractionTime
  } = useStoryStore();

  const [photoUploading, setPhotoUploading] = useState(false);
  const [vapiInitialized, setVapiInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [imageTaskIds, setImageTaskIds] = useState<{ panel1: string | null }>({
    panel1: null
  });
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize session and start Vapi immediately (skip photo upload for testing)
  useEffect(() => {
    setSessionId(sessionId);
    // Set initial page to 1 immediately
    setCurrentPage(1);
    // Auto-start Vapi after a short delay
    const timer = setTimeout(() => {
      initializeVapi();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Handle photo selection
  const handlePhotoSelected = async (file: File) => {
    setPhotoUploading(true);
    try {
      const response = await uploadPhoto(sessionId, file);
      if (response.success) {
        // Prepend API URL to photo path
        const fullPhotoUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${response.photoUrl}`;
        setPhotoUrl(fullPhotoUrl);
        // Start Vapi after photo is uploaded
        initializeVapi();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Initialize Voice (tries Vapi, falls back to Demo Mode)
  const initializeVapi = useCallback(() => {
    if (vapiInitialized) return;

    const callbacks = {
      onSpeechStart: () => {
        setCaptainSpeaking(true);
        setIsListening(false);
        // Clear any existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
      },
      onSpeechEnd: () => {
        setCaptainSpeaking(false);
        setIsListening(true);
        console.log('🎤 Captain finished speaking - waiting for kid response...');
      },
      onMessage: (message: any) => {
        console.log('📨 Vapi message:', message);
        
        // Track assistant messages
        if (message.type === 'transcript' && message.role === 'assistant') {
          console.log('🤖 Captain says:', message.transcript);
          setLastTranscript(message.transcript);
          setStoryContent(message.transcript, message.transcript, []);
        }
        
        // Track user messages and trigger image generation
        if (message.type === 'transcript' && message.role === 'user') {
          console.log('👦 Kid says:', message.transcript);
          setLastTranscript(message.transcript);
          setIsListening(false);
          
          // Track interaction for analytics
          trackInteraction({
            sessionId,
            pageNumber: currentPage,
            interactionType: 'voice_input',
            userInput: message.transcript,
            responseTimeMs: Date.now()
          }).catch(err => console.log('Track error:', err));
          
          // Generate images for this conversation turn
          generateImagesForConversation(message.transcript);
        }
      },
      onError: (error: any) => {
        console.error('Voice error:', error);
      }
    };

    const firstMessage = "Hi! I'm Captain Verne, and I'll be your space explorer guide today!";

    // Try Vapi first
    vapiClient.initialize(callbacks);
    vapiClient.start(firstMessage)
      .then(() => {
        console.log('✅ Vapi started successfully');
        setVapiInitialized(true);
      })
      .catch(error => {
        console.warn('⚠️ Vapi failed, switching to DEMO MODE:', error);
        setIsDemoMode(true);
        
        // Switch to demo mode
        demoVoiceClient.initialize(callbacks);
        demoVoiceClient.start(firstMessage)
          .then(() => {
            console.log('🎭 Demo mode started successfully');
            setVapiInitialized(true);
          })
          .catch(demoError => {
            console.error('Failed to start demo mode:', demoError);
            alert('Could not start voice. Please check microphone permissions and refresh.');
          });
      });
  }, [vapiInitialized, setCaptainSpeaking, startInteraction, timeoutId]);

  // Generate images based on conversation
  const generateImagesForConversation = async (kidResponse: string) => {
    console.log('🎨 Generating images for conversation turn...');
    console.log('   Session ID:', sessionId);
    console.log('   Current Page:', currentPage);
    console.log('   Kid Response:', kidResponse);
    console.log('   Suggested Options:', suggestedOptions);
    
    try {
      // Call backend to get next page and generate images
      const payload = {
        sessionId,
        currentPage,
        kidResponse,
        responseTime: Date.now(),
        suggestedOptions: suggestedOptions || []
      };
      
      console.log('📤 Sending to backend:', payload);
      
      const nextPageData = await getNextPage(payload);

      console.log('📦 Backend response:', nextPageData);

      if (nextPageData.success) {
        // Update page number first
        setCurrentPage(nextPageData.pageNumber);
        
        // Update story content
        if (nextPageData.storyText) {
          setStoryContent(
            nextPageData.storyText,
            nextPageData.agentPrompt || '',
            nextPageData.suggestedOptions || []
          );
        }
        
        // Handle images if they exist
        if (nextPageData.imageIds && nextPageData.imageIds.panel1) {
          console.log('✅ Image generation initiated:', nextPageData.imageIds);
          
          // Start loading images
          setImagesLoading(true);
          setImageTaskIds(nextPageData.imageIds);
          setPanelUrls(null, null);
          
          // Poll for images
          pollForImages(nextPageData.imageIds, nextPageData.pageNumber);
        }
      } else {
        console.log('⚠️ Backend request failed:', nextPageData);
      }
    } catch (error) {
      console.error('❌ Error generating images:', error);
    }
  };

  // Handle kid's voice response
  const handleKidResponse = async (response: string) => {
    setIsListening(false);
    
    const responseTime = getInteractionTime();

    // Track interaction
    await trackInteraction({
      sessionId,
      pageNumber: currentPage,
      interactionType: 'voice_input',
      userInput: response,
      responseTimeMs: responseTime
    });

    // Get next page
    try {
      const nextPageData = await getNextPage({
        sessionId,
        currentPage,
        kidResponse: response,
        responseTime,
        suggestedOptions
      });

      if (nextPageData.success) {
        setCurrentPage(nextPageData.pageNumber);
        setStoryContent(
          nextPageData.storyText,
          nextPageData.agentPrompt || '',
          nextPageData.suggestedOptions
        );

        // Tell voice client to speak the next story segment
        if (isDemoMode) {
          demoVoiceClient.send(nextPageData.storyText);
        } else {
          vapiClient.send(nextPageData.storyText);
        }

        // If this is the last page, generate book
        if (nextPageData.pageNumber === 5) {
          setTimeout(() => {
            handleStoryComplete();
          }, 5000);
        } else {
          // Start loading images
          if (nextPageData.imageIds.panel1) {
            setImagesLoading(true);
            setImageTaskIds(nextPageData.imageIds);
            setPanelUrls(null, null);
            pollForImages(nextPageData.imageIds, nextPageData.pageNumber);
          }
        }
      }
    } catch (error) {
      console.error('Error getting next page:', error);
    }
  };

  // Handle default path (timeout)
  const handleDefaultPath = () => {
    setIsListening(false);
    handleKidResponse(''); // Empty response triggers default
  };

  // Helper function to get full image URL
  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${apiUrl}${url}`;
  };

  // Poll for image completion
  const pollForImages = async (taskIds: { panel1: string | null }, pageNumber: number) => {
    let attempts = 0;
    const maxAttempts = 30;

    const poll = async () => {
      attempts++;
      
      try {
        const result = await checkImageStatus(
          sessionId,
          pageNumber,
          taskIds.panel1 || undefined,
          undefined // No panel2 anymore
        );

        if (result.success) {
          const panel1Complete = result.images.find((img: any) => img.panel === 'panel1' && img.status === 'completed');

          if (panel1Complete) {
            setPanelUrls(getFullImageUrl(panel1Complete.url), null);
            setImagesLoading(false);
            return;
          }
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          // Timeout - use placeholders
          setImagesLoading(false);
        }
      } catch (error) {
        console.error('Error checking image status:', error);
        setImagesLoading(false);
      }
    };

    poll();
  };

  // Handle story completion
  const handleStoryComplete = async () => {
    try {
      const bookResponse = await generateBook(sessionId);
      if (bookResponse.success) {
        // Stop voice client
        if (isDemoMode) {
          await demoVoiceClient.stop();
        } else {
          await vapiClient.stop();
        }
        // Navigate to book page
        router.push(`/book/${sessionId}`);
      }
    } catch (error) {
      console.error('Error generating book:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (isDemoMode) {
        demoVoiceClient.stop();
      } else {
        vapiClient.stop();
      }
    };
  }, [timeoutId, isDemoMode]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden relative">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} 
      />

      <div className="relative z-10 container mx-auto px-4 py-4 sm:py-8 max-w-5xl min-h-screen flex flex-col">
        {/* Book Title Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-block">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text tracking-tight">
              🚀 Space Adventure
            </h1>
          </div>
          
          {/* Demo Mode Badge */}
          {isDemoMode && (
            <Badge variant="outline" className="mt-3 bg-purple-100 dark:bg-purple-900/50 border-purple-400 text-purple-700 dark:text-purple-200 px-3 py-1 text-xs font-semibold">
              🎭 Demo Mode
            </Badge>
          )}
        </div>

        {/* Book Page Content */}
        <div className="flex-1 flex flex-col">
          {/* Photo Upload Stage - Temporarily disabled for Vapi testing */}
          {false && !photoUrl && (
            <div className="glass-dark rounded-3xl p-8 border border-yellow-400/30 shadow-2xl">
              <PhotoUpload
                onPhotoSelected={handlePhotoSelected}
                loading={photoUploading}
              />
            </div>
          )}

          {/* Welcome Stage - Show while initializing - Book Page Style */}
          {!photoUrl && (
            <div className="relative flex-1 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-4 border-amber-200 dark:border-amber-900 p-8 sm:p-12 overflow-hidden"
                 style={{
                   backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)',
                   backgroundSize: '20px 20px'
                 }}>
              {/* Book spine shadow */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                <div className="text-6xl sm:text-7xl mb-8 animate-float">🚀</div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-6 font-serif">
                  Welcome, Space Explorer!
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-serif">
                  Captain Verne is getting ready to guide you on an amazing space adventure!
                </p>
                <div className="flex justify-center">
                  <VoiceIndicator isActive={isCaptainSpeaking} />
                </div>
              </div>
              
              {/* Page number at bottom */}
              <div className="absolute bottom-6 right-8 text-sm text-muted-foreground font-serif italic">
                Page {currentPage} of 5
              </div>
            </div>
          )}

          {/* Story Stage - Book Page Style */}
          {currentPage > 1 && (
            <div className="relative flex-1 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-4 border-amber-200 dark:border-amber-900 p-6 sm:p-10 overflow-y-auto"
                 style={{
                   backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)',
                   backgroundSize: '20px 20px'
                 }}>
              {/* Book spine shadow */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10 space-y-6 pb-16">
                {/* Story Image */}
                <div className="mb-6">
                  <StoryPanel
                    panel1Url={panel1Url}
                    panel2Url={panel2Url}
                    loading={imagesLoading}
                  />
                </div>

                {/* Story Text */}
                {(currentStoryText || lastTranscript) && (
                  <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-6 sm:p-8 border border-amber-300 dark:border-amber-800">
                    <p className="text-base sm:text-lg md:text-xl leading-relaxed text-foreground font-serif text-justify">
                      {currentStoryText}
                    </p>
                  </div>
                )}

                {/* Voice Indicator */}
                <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-4 border border-amber-300 dark:border-amber-800">
                  <VoiceIndicator
                    isSpeaking={isCaptainSpeaking}
                    isListening={isListening}
                  />
                </div>

                {/* Suggested Options */}
                {suggestedOptions && suggestedOptions.length > 0 && !isCaptainSpeaking && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-800">
                    <h3 className="text-center text-foreground text-lg sm:text-xl font-bold mb-4 font-serif flex items-center justify-center gap-2">
                      <span>💡</span>
                      <span>What would you like to do?</span>
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center mb-4">
                      {suggestedOptions.map((option, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-white dark:bg-slate-800 border-blue-400 text-foreground hover:bg-blue-100 dark:hover:bg-blue-900 px-4 py-2 text-sm sm:text-base font-medium transition-all duration-300 cursor-default shadow-md"
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground text-center font-serif italic">
                      ✨ Or say anything you imagine!
                    </p>
                  </div>
                )}

                {/* End Story Button */}
                <div className="flex justify-center pt-4">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleStoryComplete}
                    className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold shadow-md"
                  >
                    📖 Finish & Get My Book
                  </Button>
                </div>
              </div>
              
              {/* Page number at bottom right */}
              <div className="absolute bottom-6 right-8 text-sm text-muted-foreground font-serif italic">
                Page {currentPage} of 5
              </div>
            </div>
          )}

          {/* Waiting for Vapi to start */}
          {photoUrl && currentPage === 1 && !vapiInitialized && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">🎤</div>
              <p className="text-xl">Connecting to Captain Verne...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

