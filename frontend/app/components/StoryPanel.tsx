'use client';

import Image from 'next/image';
import LoadingAnimation from './LoadingAnimation';

interface StoryPanelProps {
  panel1Url: string | null;
  panel2Url: string | null;
  loading?: boolean;
}

export default function StoryPanel({ panel1Url, panel2Url, loading = false }: StoryPanelProps) {
  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-8 border-4 border-yellow-400/30">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Panel 1 */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border-4 border-yellow-400 overflow-hidden shadow-2xl">
        {panel1Url ? (
          <Image
            src={panel1Url}
            alt="Story panel 1"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-300">Panel 1</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm font-semibold">
          1
        </div>
      </div>

      {/* Panel 2 */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl border-4 border-yellow-400 overflow-hidden shadow-2xl">
        {panel2Url ? (
          <Image
            src={panel2Url}
            alt="Story panel 2"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-300">Panel 2</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm font-semibold">
          2
        </div>
      </div>
    </div>
  );
}

