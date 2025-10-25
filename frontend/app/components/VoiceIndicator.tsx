'use client';

import { motion } from 'framer-motion';

interface VoiceIndicatorProps {
  isSpeaking: boolean;
  isListening: boolean;
}

export default function VoiceIndicator({ isSpeaking, isListening }: VoiceIndicatorProps) {
  if (isSpeaking) {
    return (
      <div className="flex flex-col items-center gap-5 py-6 px-4 sm:py-8 sm:px-6">
        {/* Audio visualizer bars */}
        <div className="flex gap-2 sm:gap-3 items-end h-16">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 sm:w-3 md:w-4 bg-gradient-to-t from-yellow-400 via-orange-400 to-yellow-500 rounded-full shadow-lg"
              animate={{
                height: [15, 45, 15]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Status text */}
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.span 
            className="text-4xl sm:text-5xl"
            animate={{
              scale: [1, 1.15, 1]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🎤
          </motion.span>
          <span className="text-lg sm:text-xl md:text-2xl font-black text-yellow-300 drop-shadow-lg">
            Captain Verne is speaking...
          </span>
        </div>
      </div>
    );
  }

  if (isListening) {
    return (
      <div className="flex flex-col items-center gap-6 py-6 px-4 sm:py-8 sm:px-6">
        {/* Pulsing microphone */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <motion.div
            className="absolute inset-0 bg-blue-400/30 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="relative flex items-center justify-center w-full h-full text-6xl sm:text-7xl"
            animate={{
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🎤
          </motion.div>
        </div>
        
        {/* Status text */}
        <div className="text-xl sm:text-2xl md:text-3xl font-black text-blue-300 drop-shadow-lg text-center">
          Your turn! Speak now...
        </div>
        
        {/* Pulsing ring */}
        <motion.div
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 sm:border-[6px] border-blue-400"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 py-6 px-4">
      <span className="text-3xl sm:text-4xl opacity-40">🎤</span>
      <span className="text-gray-400 text-base sm:text-lg md:text-xl font-semibold">
        Waiting...
      </span>
    </div>
  );
}

