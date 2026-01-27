'use client'

import { motion } from 'framer-motion'

export function FloatingLoader() {
  const message = "Seu coach está se preparando para te atender..."
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Gradient orbs - more subtle for light background */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-[120px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-[100px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-purple-400/30 rounded-full"
            style={{
              left: `${20 + i * 12}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Content - Zero Gravity Effect */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container with floating animation */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -15, 0, 10, 0],
            rotate: [-2, 2, -1, 1, -2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Glow effect behind logo */}
          <motion.div
            className="absolute inset-0 blur-2xl"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-full" />
          </motion.div>

          {/* Logo and Text */}
          <div className="relative flex items-center gap-4">
            {/* Animated Flame */}
            <motion.svg
              className="h-20 w-20 md:h-24 md:w-24"
              viewBox="-4.608 -8.828925 39.936 52.97355"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: 'rotate(180deg)' }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <defs>
                <radialGradient
                  gradientUnits="userSpaceOnUse"
                  cx="173.7628"
                  gradientTransform="matrix(.93267 0 0 1.0722 -146.703 -883.4623)"
                  fy="856.9146"
                  fx="173.7628"
                  r="35.1884"
                  cy="856.9146"
                  id="flameGradientLoader"
                >
                  <stop stopColor="#9333EA" offset="0%" />
                  <stop stopColor="#EC4899" offset="100%" />
                </radialGradient>
                
                {/* Animated gradient for shimmer effect */}
                <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9333EA">
                    <animate attributeName="offset" values="-1;1" dur="2s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#EC4899">
                    <animate attributeName="offset" values="0;2" dur="2s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#9333EA">
                    <animate attributeName="offset" values="1;3" dur="2s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
              <path
                d="M9.205 14.2587a.097.097 0 01-.108-.03c-1.194-1.581-1.494-4.299-1.567-5.343-.015-.201-.241-.314-.422-.213-3.687 2.071-7.108 6.97-7.108 11.7 0 8.126 5.644 14.943 15.36 14.943 9.103 0 15.36-7.026 15.36-14.942 0-10.358-7.402-17.24-13.995-20.351a.237.237 0 00-.336.246c.849 5.582-.324 11.653-7.184 13.99z"
                fillRule="evenodd"
                fill="url(#flameGradientLoader)"
              />
            </motion.svg>

            {/* Brand Name with staggered animation */}
            <div className="flex">
              {'rednit'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading Message */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Loading dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* Message */}
          <motion.p
            className="text-gray-600 text-sm md:text-base font-medium tracking-wide"
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {message}
          </motion.p>
        </motion.div>

        {/* Orbiting elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 w-40 h-40 border border-purple-300/30 rounded-full"
            style={{ marginLeft: -80, marginTop: -80 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute -top-1 left-1/2 w-2 h-2 bg-purple-400/60 rounded-full"
              style={{ marginLeft: -4 }}
            />
          </motion.div>
          
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 border border-pink-300/20 rounded-full"
            style={{ marginLeft: -128, marginTop: -128 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute -top-1 left-1/2 w-1.5 h-1.5 bg-pink-400/50 rounded-full"
              style={{ marginLeft: -3 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
