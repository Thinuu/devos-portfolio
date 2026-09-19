'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Folder, User, Code2, Mail, BookOpen, Layers, Menu, X, ChevronDown } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  // Desktop nav items (show first 4 on smaller screens)
  const desktopNavItems = NAV_ITEMS.slice(0, 4);
  const mobileNavItems = NAV_ITEMS.slice(4);

  return (
    <>
      <motion.div
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-40 h-auto"
      >
        <div className="h-14 bg-surface/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            {/* Left - Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate('home')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <TULogo variant="compact" />
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeWindow === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-accent/20 text-accent'
                        : 'text-text-dim hover:text-text hover:bg-border/50'
                      }
                    `}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Tablet - Partial nav + more */}
            <div className="hidden md:flex lg:hidden items-center gap-1">
              {desktopNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeWindow === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-accent/20 text-accent'
                        : 'text-text-dim hover:text-text hover:bg-border/50'
                      }
                    `}
                  >
                    <Icon size={12} />
                    {item.label}
                  </button>
                );
              })}
              {/* More dropdown */}
              <div className="relative group">
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-text-dim hover:text-text hover:bg-border/50 transition-all duration-200"
                >
                  <span>More</span>
                  <ChevronDown size={12} />
                </button>
                <div className="absolute right-0 top-full mt-1 py-2 bg-surface border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[160px]">
                  {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeWindow === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`
                          w-full flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200
                          ${isActive
                            ? 'bg-accent/20 text-accent'
                            : 'text-text-dim hover:text-text hover:bg-border/50'
                          }
                        `}
                      >
                        <Icon size={14} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right - Status + Clock */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-accent">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>Available</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="text-right">
                <div className="font-mono text-xs text-text leading-none">{time}</div>
                <div className="font-mono text-[10px] text-text-dim leading-none mt-0.5">{date}</div>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-dim hover:text-text hover:bg-border/50 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 md:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-bg/95 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu content */}
            <div className="relative pt-24 px-4">
              <nav className="space-y-2">
                {NAV_ITEMS.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeWindow === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNavigate(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                        ${isActive
                          ? 'bg-accent/20 text-accent'
                          : 'text-text-dim hover:text-text hover:bg-surface'
                        }
                      `}
                    >
                      <Icon size={20} />
                      {item.label}
                      {isActive && (
                        <motion.div 
                          layoutId="mobile-active"
                          className="ml-auto w-2 h-2 rounded-full bg-accent"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Mobile status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 pt-6 border-t border-border"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-accent">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span>Available</span>
                  </div>
                  <div className="text-text-dim font-mono text-xs">
                    {time} · {date}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}