'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Folder, User, Code2, Mail, BookOpen, Layers } from 'lucide-react';
import TULogo from '@/components/brand/TULogo';

interface TaskbarProps {
  activeWindow: string;
  onNavigate: (section: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: User },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'tools', label: 'Tools', icon: Layers },
  { id: 'workflow', label: 'Workflow', icon: Terminal },
  { id: 'experience', label: 'Experience', icon: BookOpen },
  { id: 'contact', label: 'Contact', icon: Mail },
];

export default function Taskbar({ activeWindow, onNavigate }: TaskbarProps) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Colombo',
        })
      );
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone: 'Asia/Colombo',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-40 h-12"
    >
      <div className="h-full bg-surface/95 backdrop-blur border-b border-border flex items-center justify-between px-4">
        {/* Left - Logo + Nav */}
        <div className="flex items-center gap-1">
          {/* TU Logo */}
          <div className="flex items-center gap-2 pr-4 mr-2 border-r border-border">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <TULogo variant="compact" />
            </button>
          </div>

          {/* Nav items */}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeWindow === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-body transition-all duration-200
                  ${isActive
                    ? 'bg-accent/20 text-accent'
                    : 'text-text-dim hover:text-text hover:bg-border/50'
                  }
                `}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right - Status + Clock */}
        <div className="flex items-center gap-4">
          {/* Status */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-accent">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>Available</span>
          </div>

          <div className="w-px h-4 bg-border" />

          {/* Clock */}
          <div className="text-right">
            <div className="font-mono text-xs text-text leading-none">{time}</div>
            <div className="font-mono text-[10px] text-text-dim leading-none mt-0.5">{date}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}