'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TULogoProps {
  variant?: 'main' | 'compact' | 'footer';
  animated?: boolean;
  className?: string;
}

// Custom geometric TU monogram
const TULogoSVG = ({ variant, animated }: { variant: string; animated: boolean }) => {
  const isCompact = variant === 'compact';
  const size = isCompact ? 24 : isCompact ? 32 : 48;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? 'logo-svg' : ''}
    >
      {/* Background shape */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx={isCompact ? 4 : 6}
        fill="currentColor"
        className="text-bg"
      />
      
      {/* T letter - geometric sans-serif */}
      <motion.path
        d="M12 12H36V16H26V38H22V16H12V12Z"
        fill="currentColor"
        className="text-accent"
        initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
        animate={animated ? { opacity: 1, scale: 1 } : undefined}
        transition={animated ? { duration: 0.4, ease: 'easeOut' } : undefined}
      />
      
      {/* U letter - geometric sans-serif */}
      <motion.path
        d="M30 18C30 14.6863 32.6863 12 36 12C39.3137 12 42 14.6863 42 18V34C42 36.2091 40.2091 38 38 38H34C31.7909 38 30 36.2091 30 34V18Z"
        fill="currentColor"
        className="text-text"
        initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
        animate={animated ? { opacity: 1, scale: 1 } : undefined}
        transition={animated ? { duration: 0.4, delay: 0.15, ease: 'easeOut' } : undefined}
      />
      
      {/* Subtle accent dot */}
      <motion.circle
        cx="24"
        cy="24"
        r="2"
        fill="currentColor"
        className="text-accent"
        initial={animated ? { opacity: 0 } : undefined}
        animate={animated ? { opacity: 1 } : undefined}
        transition={animated ? { duration: 0.3, delay: 0.3 } : undefined}
        style={{ opacity: isCompact ? 0 : 1 }}
      />
    </svg>
  );
};

export default function TULogo({ variant = 'main', animated = false, className = '' }: TULogoProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div
      className={`tu-logo ${variant} ${className}`}
      variants={containerVariants}
      initial="initial"
      animate={isMounted ? 'animate' : 'initial'}
      whileHover={variant !== 'compact' ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <TULogoSVG variant={variant} animated={animated && isMounted} />
      {variant === 'main' && (
        <motion.span
          className="logo-text ml-2 font-display font-semibold text-text"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: isMounted ? 1 : 0, x: isMounted ? 0 : -10 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          TU
        </motion.span>
      )}
      {variant === 'footer' && (
        <motion.span
          className="logo-text ml-2 font-mono text-xs text-text-dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: isMounted ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Thinu Upadya
        </motion.span>
      )}
    </motion.div>
  );
}