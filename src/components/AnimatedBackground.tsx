import React from 'react';
import { motion } from 'motion/react';

export function AnimatedBackground() {
  // Generate random particles
  const particles = React.useMemo(() => Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 3,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
  })), []);

  return (
    <>
      {/* Light Mode Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:hidden">
        {/* Animated Gradient Base */}
        <div 
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
            backgroundSize: '400% 400%',
            opacity: 0.25,
          }}
        />

        {/* Large Gradient Orbs */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.3) 50%, transparent 70%)',
            filter: 'blur(60px)',
            left: '-10%',
            top: '-10%',
          }}
          animate={{
            x: ['0%', '60%', '0%'],
            y: ['0%', '50%', '0%'],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(240, 147, 251, 0.45) 0%, rgba(74, 172, 254, 0.25) 50%, transparent 70%)',
            filter: 'blur(70px)',
            right: '-10%',
            top: '10%',
          }}
          animate={{
            x: ['0%', '-50%', '0%'],
            y: ['0%', '60%', '0%'],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.initialX}%`,
              top: `${particle.initialY}%`,
              background: 'radial-gradient(circle, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.5) 100%)',
              boxShadow: '0 0 20px rgba(102, 126, 234, 0.6)',
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/50" />
      </div>

      {/* Dark Mode Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none hidden dark:block">
        {/* Animated Gradient Base */}
        <div 
          className="absolute inset-0 animate-gradient-shift-dark"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #1a1a2e 100%)',
            backgroundSize: '400% 400%',
            opacity: 0.8,
          }}
        />

        {/* Large Gradient Orbs */}
        <motion.div
          className="absolute w-[900px] h-[900px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)',
            filter: 'blur(80px)',
            left: '-15%',
            top: '-15%',
          }}
          animate={{
            x: ['0%', '65%', '0%'],
            y: ['0%', '55%', '0%'],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, rgba(59, 130, 246, 0.18) 50%, transparent 70%)',
            filter: 'blur(90px)',
            right: '-15%',
            top: '15%',
          }}
          animate={{
            x: ['0%', '-55%', '0%'],
            y: ['0%', '65%', '0%'],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute w-[750px] h-[750px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 70%)',
            filter: 'blur(85px)',
            bottom: '-10%',
            left: '30%',
          }}
          animate={{
            x: ['0%', '40%', '0%'],
            y: ['0%', '-60%', '0%'],
            scale: [1, 1.18, 1],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.initialX}%`,
              top: `${particle.initialY}%`,
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.9) 0%, rgba(99, 102, 241, 0.6) 100%)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.7)',
            }}
            animate={{
              y: [0, -120, 0],
              x: [0, Math.random() * 60 - 30, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Geometric Shapes */}
        <motion.div
          className="absolute w-32 h-32 border-2 border-purple-400/30"
          style={{
            left: '20%',
            top: '30%',
            filter: 'blur(1px)',
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <motion.div
          className="absolute w-24 h-24 border-2 border-blue-400/30 rounded-full"
          style={{
            right: '25%',
            bottom: '25%',
            filter: 'blur(1px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Reduced overlay for better visibility */}
        <div className="absolute inset-0 bg-[#0E1117]/40" />
      </div>
    </>
  );
}
