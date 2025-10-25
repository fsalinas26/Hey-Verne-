'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSession } from './lib/api';

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black text-white">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-bounce">
            🚀 Hey Verne!
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-semibold text-yellow-300">
            AI Storytelling for Kids
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Become the hero of your own space adventure! 
            Talk with Captain Verne, explore the stars, and learn amazing things about space.
          </p>

          {/* Story Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Space Adventure - Active */}
            <div 
              className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-2xl shadow-2xl cursor-pointer transform hover:scale-105 transition-transform border-4 border-yellow-400"
              onClick={handleStartAdventure}
            >
              <div className="text-6xl mb-4">🌌</div>
              <h3 className="text-2xl font-bold mb-2">Space Adventure</h3>
              <p className="text-gray-100">Explore planets and learn about our solar system!</p>
              <button 
                disabled={loading}
                className="mt-4 bg-yellow-400 text-blue-900 font-bold py-3 px-6 rounded-full hover:bg-yellow-300 transition-colors w-full text-lg disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Start Adventure!'}
              </button>
            </div>

            {/* Sea Exploration - Coming Soon */}
            <div className="bg-gray-700 p-6 rounded-2xl shadow-2xl opacity-60 cursor-not-allowed">
              <div className="text-6xl mb-4">🌊</div>
              <h3 className="text-2xl font-bold mb-2">Sea Exploration</h3>
              <p className="text-gray-300">Dive deep and discover ocean secrets!</p>
              <div className="mt-4 bg-gray-500 text-white font-bold py-3 px-6 rounded-full w-full text-lg">
                Coming Soon
              </div>
            </div>

            {/* Forest Mystery - Coming Soon */}
            <div className="bg-gray-700 p-6 rounded-2xl shadow-2xl opacity-60 cursor-not-allowed">
              <div className="text-6xl mb-4">🌲</div>
              <h3 className="text-2xl font-bold mb-2">Forest Mystery</h3>
              <p className="text-gray-300">Explore nature and meet amazing animals!</p>
              <div className="mt-4 bg-gray-500 text-white font-bold py-3 px-6 rounded-full w-full text-lg">
                Coming Soon
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-4xl">🎤</div>
              <h4 className="text-xl font-semibold">Talk & Explore</h4>
              <p className="text-gray-300">Use your voice to guide the story</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">🎨</div>
              <h4 className="text-xl font-semibold">You're the Hero</h4>
              <p className="text-gray-300">See yourself in the adventure</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">📚</div>
              <h4 className="text-xl font-semibold">Learn & Play</h4>
              <p className="text-gray-300">Educational fun for ages 3-5</p>
            </div>
          </div>

          {/* Stats Link */}
          <div className="mt-12">
            <a
              href="/stats"
              className="text-gray-400 hover:text-white underline text-sm"
            >
              View Analytics Dashboard
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

