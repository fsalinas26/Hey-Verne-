'use client';

import { motion } from 'framer-motion';

interface VoiceIndicatorProps {
  isSpeaking: boolean;
  isListening: boolean;
}

export default function VoiceIndicator({ isSpeaking, isListening }: VoiceIndicatorProps) {
  if (isSpeaking) {
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        <div className="flex gap-1 items-end">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 bg-yellow-400 rounded-full"
              animate={{
                height: [10, 30, 10]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎤</span>
          <span className="text-lg font-semibold text-yellow-300">
            Captain Verne is speaking...
          </span>
        </div>
      </div>
    );
  }

  if (isListening) {
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        <motion.div
          className="text-5xl"
          animate={{
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
        >
          🎤
        </motion.div>
        <div className="text-lg font-semibold text-blue-300">
          Your turn! Speak now...
        </div>
        <motion.div
          className="w-24 h-24 rounded-full border-4 border-blue-400"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-4">
      <span className="text-2xl opacity-50">🎤</span>
      <span className="text-gray-400">Waiting...</span>
    </div>
  );
}

