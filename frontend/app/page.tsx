'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSession } from './lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartAdventure = async () => {
    setLoading(true);
    try {
      const response = await createSession('space');
      if (response.success) {
        router.push(`/story/${response.sessionId}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to start adventure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stories = [
    { emoji: '🚀', title: 'Space Adventure', description: 'Explore planets and stars', active: true },
    { emoji: '🌊', title: 'Ocean Exploration', description: 'Dive into the deep blue', active: false },
    { emoji: '🌲', title: 'Forest Mystery', description: 'Discover nature\'s secrets', active: false },
    { emoji: '🏰', title: 'Castle Quest', description: 'Medieval adventures await', active: false },
    { emoji: '🦕', title: 'Dinosaur Discovery', description: 'Journey to prehistoric times', active: false },
    { emoji: '🎪', title: 'Circus Show', description: 'Join the amazing circus', active: false },
    { emoji: '🏜️', title: 'Desert Safari', description: 'Explore sandy wonders', active: false },
    { emoji: '🎨', title: 'Art Studio', description: 'Create colorful masterpieces', active: false },
    { emoji: '🔬', title: 'Science Lab', description: 'Experiment and discover', active: false },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-20 space-y-6">
          <div className="inline-block animate-float">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text tracking-tight drop-shadow-sm">
              Hey Verne!
            </h1>
          </div>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-foreground font-bold">
            ✨ AI Storytelling for Kids ✨
          </p>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Choose your adventure and become the hero of your own story. Talk, explore, and learn through play!
          </p>
        </div>

        {/* Story Cards Grid - 3x3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {stories.map((story, index) => (
            <Card
              key={index}
              onClick={story.active ? handleStartAdventure : undefined}
              className={`group relative overflow-hidden transition-all duration-300 ${
                story.active
                  ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] border-2 border-primary/20 hover:border-primary/40 bg-card/80 backdrop-blur-sm'
                  : 'opacity-60 cursor-not-allowed bg-muted/30'
              }`}
            >
              {/* Shine effect on hover for active cards */}
              {story.active && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full" 
                     style={{ transition: 'transform 0.8s ease-in-out' }} />
              )}
              
              {/* Badge for active/inactive story */}
              <div className="absolute -top-2 -right-2 z-10">
                {story.active ? (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg font-semibold px-3 py-1">
                    ✨ Available
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="shadow-md font-medium px-3 py-1">
                    🔜 Coming Soon
                  </Badge>
                )}
              </div>

              <CardHeader className="text-center pb-6 pt-8">
                <div className={`text-7xl sm:text-8xl mb-4 transition-all duration-300 ${
                  story.active ? 'group-hover:scale-125 group-hover:rotate-6' : ''
                }`}>
                  {story.emoji}
                </div>
                <CardTitle className={`text-2xl font-bold ${!story.active && 'text-muted-foreground'}`}>
                  {story.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-center px-6">
                <CardDescription className="text-base leading-relaxed">
                  {story.description}
                </CardDescription>
              </CardContent>

              <CardFooter className="flex justify-center pb-6 pt-4 px-6">
                {story.active ? (
                  <Button 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <span className="animate-pulse">✨</span> Starting...
                      </>
                    ) : (
                      <>Start Adventure →</>
                    )}
                  </Button>
                ) : (
                  <Button 
                    disabled 
                    variant="secondary"
                    className="w-full"
                    size="lg"
                  >
                    🔒 Locked
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <Card className="mb-12 sm:mb-16 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-pink-950/50 border-2 border-primary/10 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-2 pt-8 sm:pt-10">
            <CardTitle className="text-3xl sm:text-4xl text-center font-black bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              How It Works
            </CardTitle>
            <p className="text-center text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-4">
              Three simple steps to start your magical learning adventure
            </p>
          </CardHeader>
          <CardContent className="pb-10 px-6 sm:px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-center">
              <div className="space-y-4 group">
                <div className="text-7xl sm:text-8xl group-hover:scale-110 transition-transform duration-300">🎤</div>
                <h4 className="text-xl sm:text-2xl font-bold text-foreground">Talk & Explore</h4>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Use your voice to guide the story and make exciting choices
                </p>
              </div>
              <div className="space-y-4 group">
                <div className="text-7xl sm:text-8xl group-hover:scale-110 transition-transform duration-300">🎨</div>
                <h4 className="text-xl sm:text-2xl font-bold text-foreground">You're the Hero</h4>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  See yourself in the adventure with beautiful AI-generated images
                </p>
              </div>
              <div className="space-y-4 group">
                <div className="text-7xl sm:text-8xl group-hover:scale-110 transition-transform duration-300">📚</div>
                <h4 className="text-xl sm:text-2xl font-bold text-foreground">Learn & Play</h4>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Educational fun designed for ages 3-5 by learning experts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer with Analytics Link */}
        <div className="text-center pb-8 space-y-4">
          <Button variant="outline" size="lg" asChild className="shadow-md hover:shadow-lg transition-shadow">
            <a href="/stats" className="flex items-center gap-2">
              📊 View Analytics Dashboard
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">
            Track progress and insights for parents, teachers, and psychologists
          </p>
        </div>
      </div>
    </main>
  );
}

