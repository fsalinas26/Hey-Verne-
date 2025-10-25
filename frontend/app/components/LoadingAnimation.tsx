'use client';

import { motion } from 'framer-motion';

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-8 space-y-8 sm:space-y-10">
      {/* Rocket animation */}
      <div className="relative w-full max-w-md h-32 sm:h-40">
        <motion.div
          className="text-5xl sm:text-6xl md:text-7xl absolute"
          animate={{
            x: [0, 200, 0],
            y: [0, -30, 0],
            rotate: [0, 20, -20, 0]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🚀
        </motion.div>

        {/* Exhaust trail */}
        <motion.div
          className="absolute top-12 sm:top-16 left-0"
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [0.7, 1.3, 0.7]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="flex gap-1">
            <span className="text-xl sm:text-2xl">💨</span>
            <span className="text-lg sm:text-xl">💨</span>
            <span className="text-base sm:text-lg">💨</span>
          </div>
        </motion.div>
      </div>

      {/* Stars */}
      <div className="flex gap-3 sm:gap-5 md:gap-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="text-3xl sm:text-4xl md:text-5xl"
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>

      {/* Planets rotating */}
      <div className="flex gap-6 sm:gap-8 md:gap-10">
        <motion.div
          className="text-4xl sm:text-5xl md:text-6xl"
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
          className="text-4xl sm:text-5xl md:text-6xl"
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
          className="text-4xl sm:text-5xl md:text-6xl"
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
        className="text-lg sm:text-xl md:text-2xl font-black text-yellow-300 drop-shadow-lg text-center max-w-md px-4"
        animate={{
          opacity: [1, 0.5, 1]
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Creating your next adventure...
      </motion.div>

      {/* Loading dots */}
      <div className="flex gap-2 sm:gap-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full shadow-lg"
            animate={{
              y: [0, -15, 0]
            }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}

