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
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-950 text-white overflow-hidden animate-gradient">
      {/* Enhanced Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Floating decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 right-10 text-6xl animate-float">⭐</div>
        <div className="absolute bottom-20 left-10 text-5xl animate-float" style={{ animationDelay: '1s' }}>🌙</div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 sm:py-10 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10 space-y-4">
          <div className="inline-block animate-float">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 text-transparent bg-clip-text drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)] tracking-tight">
              🚀 Space Adventure
            </h1>
          </div>
          
          {/* Progress Badge */}
          {currentPage > 0 && (
            <div className="flex flex-col items-center gap-3">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-500 hover:to-orange-500 px-5 py-2 text-base sm:text-lg font-bold shadow-lg">
                Page {currentPage} of 5
              </Badge>
              {/* Progress Bar */}
              <Progress value={(currentPage / 5) * 100} className="w-64 h-2" />
            </div>
          )}
          
          {/* Demo Mode Badge */}
          {isDemoMode && (
            <Badge variant="outline" className="bg-purple-900/50 border-purple-400 text-purple-200 px-4 py-2 text-sm font-semibold">
              🎭 Demo Mode: Using browser voice
            </Badge>
          )}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Photo Upload Stage - Temporarily disabled for Vapi testing */}
          {false && !photoUrl && (
            <div className="glass-dark rounded-3xl p-8 border border-yellow-400/30 shadow-2xl">
              <PhotoUpload
                onPhotoSelected={handlePhotoSelected}
                loading={photoUploading}
              />
            </div>
          )}

          {/* Welcome Stage - Show while initializing */}
          {!photoUrl && (
            <Card className="relative bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-indigo-900/80 border-2 border-yellow-400/40 shadow-2xl backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse"></div>
              <CardContent className="relative z-10 text-center pt-12 pb-12 px-6">
                <div className="text-7xl sm:text-8xl mb-8 animate-float">🚀</div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-yellow-300 mb-6 drop-shadow-lg">
                  Welcome, Space Explorer!
                </h2>
                <p className="text-lg sm:text-xl text-gray-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Captain Verne is getting ready to guide you on an amazing space adventure!
                </p>
                <div className="flex justify-center">
                  <VoiceIndicator isActive={isCaptainSpeaking} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Story Stage - Show panels when conversation progresses */}
          {currentPage > 1 && (
            <>
              {/* Comic Panels */}
              <div className="mb-6">
                <StoryPanel
                  panel1Url={panel1Url}
                  panel2Url={panel2Url}
                  loading={imagesLoading}
                />
              </div>

              {/* Story Text - Show what Captain Verne said */}
              {(currentStoryText || lastTranscript) && (
                <Card className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 border-2 border-yellow-400/30 backdrop-blur-md shadow-2xl">
                  <CardContent className="p-6 sm:p-10">
                    <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-center text-gray-100 font-medium">
                      {currentStoryText}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Voice Indicator */}
              <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 border-2 border-yellow-400/20 backdrop-blur-sm shadow-xl">
                <CardContent className="p-4">
                  <VoiceIndicator
                    isSpeaking={isCaptainSpeaking}
                    isListening={isListening}
                  />
                </CardContent>
              </Card>

              {/* Suggested Options Display */}
              {suggestedOptions && suggestedOptions.length > 0 && !isCaptainSpeaking && (
                <Card className="bg-gradient-to-br from-blue-900/60 to-purple-900/60 border-2 border-blue-400/30 backdrop-blur-md shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-center text-blue-300 text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
                      <span>💡</span>
                      <span>Suggestions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="flex flex-wrap gap-3 justify-center mb-5">
                      {suggestedOptions.map((option, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-blue-800/40 border-blue-400/50 text-white hover:bg-blue-700/60 px-4 py-2 text-sm sm:text-base font-medium transition-all duration-300 cursor-default shadow-md"
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 text-center font-medium">
                      ✨ Or say anything you want!
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
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

