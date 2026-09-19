'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'bracket' | 'tag' | 'code' | 'dot';
}

const floatingElements: Omit<FloatingElement, 'id'>[] = [
  { x: 10, y: 15, size: 24, duration: 20, delay: 0, type: 'bracket' },
  { x: 85, y: 20, size: 20, duration: 25, delay: 2, type: 'tag' },
  { x: 25, y: 70, size: 28, duration: 22, delay: 1, type: 'code' },
  { x: 75, y: 80, size: 18, duration: 18, delay: 3, type: 'bracket' },
  { x: 50, y: 35, size: 16, duration: 28, delay: 0.5, type: 'dot' },
  { x: 15, y: 50, size: 22, duration: 24, delay: 1.5, type: 'tag' },
  { x: 90, y: 60, size: 20, duration: 26, delay: 2.5, type: 'code' },
  { x: 35, y: 25, size: 14, duration: 20, delay: 4, type: 'dot' },
  { x: 65, y: 75, size: 26, duration: 22, delay: 3.5, type: 'bracket' },
  { x: 5, y: 85, size: 18, duration: 24, delay: 5, type: 'tag' },
  { x: 55, y: 10, size: 16, duration: 26, delay: 1, type: 'dot' },
  { x: 20, y: 90, size: 22, duration: 20, delay: 2, type: 'code' },
];

const BracketIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1." className={className}>
    <path d="M8 4h8v4h-4v12H8V4z" />
    <path d="M16 4h-4v4h4v12h4V4h-4z" />
  </svg>
);

const TagIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M4 4h8l6 6v8h-8z" />
    <path d="M14 14h4v4h-4z" />
  </svg>
);

const CodeIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M8 16l-4-4 4-4" />
    <path d="M16 8l4 4-4 4" />
    <path d="M14 4l-8 8" />
  </svg>
);

const DotIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="6" />
  </svg>
);

const IconComponent = ({ type, size, className }: { type: string; size: number; className?: string }) => {
  switch (type) {
    case 'bracket': return <BracketIcon size={size} className={className} />;
    case 'tag': return <TagIcon size={size} className={className} />;
    case 'code': return <CodeIcon size={size} className={className} />;
    default: return <DotIcon size={size} className={className} />;
  }
};

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    setMounted(true);
    setElements(floatingElements.map((el, i) => ({ ...el, id: i })));
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Subtle gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg to-surface" />
      
      {/* Ambient glow spots */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-5"
        style={{ 
          background: 'radial-gradient(circle, #a3e635 0%, transparent 70%)',
          left: '10%',
          top: '20%'
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-3"
        style={{ 
          background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
          right: '15%',
          bottom: '10%'
        }}
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating code elements */}
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute text-accent/15"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.9],
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <IconComponent type={el.type} size={el.size} />
        </motion.div>
      ))}

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(163, 230, 53, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(163, 230, 53, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Scan line effect (very subtle) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/2 to-transparent h-20"
        animate={{ y: ['-20%', '120%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ opacity: 0.3 }}
      />
    </div>
  );
}