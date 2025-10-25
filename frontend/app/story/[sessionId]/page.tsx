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
  const [imageTaskIds, setImageTaskIds] = useState<{ panel1: string | null; panel2: string | null }>({
    panel1: null,
    panel2: null
  });
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize session and start Vapi immediately (skip photo upload for testing)
  useEffect(() => {
    setSessionId(sessionId);
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
        }
        
        // Track user messages (but don't interrupt the flow!)
        if (message.type === 'transcript' && message.role === 'user') {
          console.log('👦 Kid says:', message.transcript);
          setLastTranscript(message.transcript);
          setIsListening(false);
          
          // Just track it for analytics - Vapi will handle the response
          trackInteraction({
            sessionId,
            pageNumber: currentPage,
            interactionType: 'voice_input',
            userInput: message.transcript,
            responseTimeMs: Date.now()
          }).catch(err => console.log('Track error:', err));
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
        setCurrentPage(1);
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
            setCurrentPage(1);
          })
          .catch(demoError => {
            console.error('Failed to start demo mode:', demoError);
            alert('Could not start voice. Please check microphone permissions and refresh.');
          });
      });
  }, [vapiInitialized, setCaptainSpeaking, startInteraction, timeoutId]);

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
          if (nextPageData.imageIds.panel1 || nextPageData.imageIds.panel2) {
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

  // Poll for image completion
  const pollForImages = async (taskIds: { panel1: string | null; panel2: string | null }, pageNumber: number) => {
    let attempts = 0;
    const maxAttempts = 30;

    const poll = async () => {
      attempts++;
      
      try {
        const result = await checkImageStatus(
          sessionId,
          pageNumber,
          taskIds.panel1 || undefined,
          taskIds.panel2 || undefined
        );

        if (result.success) {
          const panel1Complete = result.images.find((img: any) => img.panel === 'panel1' && img.status === 'completed');
          const panel2Complete = result.images.find((img: any) => img.panel === 'panel2' && img.status === 'completed');

          if (panel1Complete && panel2Complete) {
            setPanelUrls(panel1Complete.url, panel2Complete.url);
            setImagesLoading(false);
            return;
          } else if (panel1Complete) {
            setPanelUrls(panel1Complete.url, null);
          } else if (panel2Complete) {
            setPanelUrls(null, panel2Complete.url);
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
    <main className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black text-white">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2">
            🚀 Space Adventure
          </h1>
          {currentPage > 0 && (
            <p className="text-lg text-gray-300">
              Page {currentPage} of 5
            </p>
          )}
          {isDemoMode && (
            <div className="mt-2 inline-block bg-purple-600/50 px-4 py-2 rounded-full text-sm border border-purple-400">
              🎭 Demo Mode: Using browser voice
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Photo Upload Stage - Temporarily disabled for Vapi testing */}
          {false && !photoUrl && (
            <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-3xl p-8 backdrop-blur-sm border border-yellow-400/30">
              <PhotoUpload
                onPhotoSelected={handlePhotoSelected}
                loading={photoUploading}
              />
            </div>
          )}

          {/* Welcome Stage - Show while initializing */}
          {!photoUrl && (
            <div className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 rounded-2xl p-8 backdrop-blur-sm border border-yellow-400/30 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold text-yellow-300 mb-4">Welcome, Space Explorer!</h2>
              <p className="text-xl text-gray-200 mb-6">
                Captain Verne is getting ready to guide you on an amazing space adventure!
              </p>
              <div className="flex justify-center">
                <VoiceIndicator isActive={isCaptainSpeaking} />
              </div>
            </div>
          )}

          {/* Story Stage */}
          {photoUrl && currentPage > 1 && (
            <>
              {/* Comic Panels */}
              <div className="mb-6">
                <StoryPanel
                  panel1Url={panel1Url}
                  panel2Url={panel2Url}
                  loading={imagesLoading}
                />
              </div>

              {/* Story Text */}
              {currentStoryText && (
                <div className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 rounded-2xl p-6 backdrop-blur-sm border border-yellow-400/30">
                  <p className="text-xl md:text-2xl leading-relaxed text-center">
                    {currentStoryText}
                  </p>
                </div>
              )}

              {/* Voice Indicator */}
              <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-4 backdrop-blur-sm border border-yellow-400/20">
                <VoiceIndicator
                  isSpeaking={isCaptainSpeaking}
                  isListening={isListening}
                />
              </div>

              {/* Suggested Options Display */}
              {suggestedOptions && suggestedOptions.length > 0 && !isCaptainSpeaking && (
                <div className="text-center">
                  <p className="text-gray-300 mb-2">Suggestions:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedOptions.map((option, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-600/50 px-4 py-2 rounded-full text-sm border border-blue-400"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    (You can also say anything you want!)
                  </p>
                </div>
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

