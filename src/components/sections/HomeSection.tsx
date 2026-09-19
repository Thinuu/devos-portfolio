'use client';

import { motion } from 'framer-motion';
import { MapPin, Github, Linkedin, Download } from 'lucide-react';
import { portfolioData } from '@/lib/data';

const { personal, stats } = portfolioData;

export default function HomeSection() {
  return (
    <section id="home" className="min-h-screen pt-24 lg:pt-20 flex items-center relative">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left column - Text content - FIRST on mobile */}
          <div className="lg:col-span-7 order-1 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="font-mono text-sm text-accent uppercase tracking-widest">
                {personal.role}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-bold text-5xl lg:text-6xl xl:text-7xl leading-[1.1] text-text mb-6"
            >
              {personal.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-mono text-base text-text-dim leading-relaxed mb-8 whitespace-pre-line"
            >
              {personal.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base text-text-dim leading-relaxed mb-8 max-w-xl"
            >
              {personal.bio}
            </motion.p>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-3 text-sm text-text-dim font-mono mb-10"
            >
              <MapPin size={16} className="text-accent flex-shrink-0" />
              <span>{personal.location} · {personal.timezone}</span>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <a
                href={personal.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm text-text-dim hover:text-text hover:border-accent/50 hover:bg-border/30 transition-all"
              >
                <Github size={18} />
                GitHub
              </a>
              <a
                href={personal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm text-text-dim hover:text-text hover:border-accent/50 hover:bg-border/30 transition-all"
              >
                <Linkedin size={18} />
                LinkedIn
              </a>
              <a
                href="/Thinu_Upadya_CV_Updated.pdf"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-bg bg-accent hover:bg-accent-dim transition-colors shadow-lg shadow-accent/20"
              >
                <Download size={18} />
                Download CV
              </a>
            </motion.div>
          </div>

          {/* Right column - Profile and stats - SECOND on mobile */}
          <div className="lg:col-span-5 order-2 lg:order-2">
            {/* Profile image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative max-w-[240px] mx-auto lg:max-w-none lg:ml-auto"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-surface border border-border shadow-2xl shadow-accent/5">
                <img
                  src="/images/thinu-profile.png"
                  alt="Thinu Upadya - Profile Photo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div 
                  className="hidden w-full h-full items-center justify-center text-4xl lg:text-5xl font-display font-bold text-text bg-gradient-to-br from-surface to-border"
                >
                  TU
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="absolute -bottom-2 -right-2 flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-mono text-text-dim whitespace-nowrap">Available</span>
              </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-8 max-w-sm mx-auto lg:max-w-none lg:ml-auto"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 sm:p-4 rounded-lg bg-surface border border-border text-center hover:border-accent/30 transition-colors"
                >
                  <div className="font-display font-bold text-xl sm:text-2xl text-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs font-mono text-text-dim leading-tight truncate">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}