'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TULogo from '@/components/brand/TULogo';

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Faster initial progression, slower near end for smooth effect
        const increment = prev < 30 ? 8 : prev < 70 ? 5 : 3;
        return Math.min(prev + increment, 100);
      });
    }, 50);

    // Show content after brief delay
    const contentTimeout = setTimeout(() => {
      setShowContent(true);
    }, 300);

    // Complete after progress reaches ~80%
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(contentTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center">
      {/* Animated background grid */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.9 }}
          transition={{ duration: 0.4 }}
        >
          <TULogo variant="main" animated={false} className="scale-150" />
        </motion.div>

        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 w-64"
          >
            <div className="flex justify-between text-xs font-mono text-text-dim mb-2">
              <span>Loading</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}