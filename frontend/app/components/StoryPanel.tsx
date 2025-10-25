'use client';

import Image from 'next/image';
import LoadingAnimation from './LoadingAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StoryPanelProps {
  panel1Url: string | null;
  panel2Url?: string | null; // Made optional for backward compatibility
  loading?: boolean;
}

export default function StoryPanel({ panel1Url, panel2Url, loading = false }: StoryPanelProps) {
  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-yellow-400/30 shadow-2xl backdrop-blur-md">
        <CardContent className="p-6 sm:p-10">
          <LoadingAnimation />
        </CardContent>
      </Card>
    );
  }

  // Single image layout
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-4 border-yellow-400 shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(251,191,36,0.5)]">
        <div className="relative aspect-[4/3]">
          {panel1Url ? (
            <Image
              src={panel1Url}
              alt="Story illustration"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/30">
              <div className="text-center px-6">
                <div className="text-7xl sm:text-9xl mb-6 animate-float">🎨</div>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-200 font-bold">
                  Generating your story illustration...
                </p>
              </div>
            </div>
          )}
          {/* Overlay badge */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <Badge className="bg-black/80 text-yellow-400 hover:bg-black/90 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-bold backdrop-blur-md border-2 border-yellow-400/70 shadow-lg">
              ✨ Story Scene
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

