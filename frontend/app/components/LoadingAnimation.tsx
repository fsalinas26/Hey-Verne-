'use client';

import { motion } from 'framer-motion';

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Rocket animation */}
      <div className="relative w-full h-32">
        <motion.div
          className="text-6xl absolute"
          animate={{
            x: [0, 300, 0],
            y: [0, -20, 0],
            rotate: [0, 15, -15, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🚀
        </motion.div>

        {/* Exhaust trail */}
        <motion.div
          className="absolute top-12 left-0"
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity
          }}
        >
          <div className="flex gap-1">
            <span className="text-2xl">💨</span>
            <span className="text-xl">💨</span>
            <span className="text-lg">💨</span>
          </div>
        </motion.div>
      </div>

      {/* Stars */}
      <div className="flex gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="text-3xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>

      {/* Planets rotating */}
      <div className="flex gap-6">
        <motion.div
          className="text-4xl"
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          🪐
        </motion.div>
        <motion.div
          className="text-4xl"
          animate={{ rotate: -360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          🌍
        </motion.div>
        <motion.div
          className="text-4xl"
          animate={{ rotate: 360 }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          🌙
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.div
        className="text-xl font-semibold text-yellow-300"
        animate={{
          opacity: [1, 0.5, 1]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
      >
        Creating your next adventure...
      </motion.div>

      {/* Loading dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-yellow-400 rounded-full"
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
}

