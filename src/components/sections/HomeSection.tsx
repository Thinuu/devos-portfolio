'use client';

import { motion } from 'framer-motion';
import { MapPin, Github, Linkedin, Download, ArrowRight } from 'lucide-react';
import { portfolioData } from '@/lib/data';

const { personal, stats } = portfolioData;

export default function HomeSection() {
  return (
    <section id="home" className="min-h-screen pt-20 flex items-center relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left column - Text content */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="font-mono text-xs text-accent uppercase tracking-wider">
                {personal.role}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-bold text-5xl lg:text-6xl leading-tight text-text mb-6"
            >
              {personal.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-mono text-lg text-text-dim leading-relaxed mb-8 whitespace-pre-line"
            >
              {personal.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-text-dim leading-relaxed mb-8 max-w-lg"
            >
              {personal.bio}
            </motion.p>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-2 text-sm text-text-dim font-mono mb-8"
            >
              <MapPin size={14} className="text-accent" />
              {personal.location} · {personal.timezone}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href={personal.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-border text-sm text-text-dim hover:text-text hover:border-accent/50 transition-colors"
              >
                <Github size={16} />
                GitHub
              </a>
              <a
                href={personal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-border text-sm text-text-dim hover:text-text hover:border-accent/50 transition-colors"
              >
                <Linkedin size={16} />
                LinkedIn
              </a>
              <a
                href="/Thinu_Upadya_CV_Updated.pdf"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium text-bg bg-accent hover:bg-accent-dim transition-colors"
              >
                <Download size={16} />
                Download CV
              </a>
            </motion.div>
          </div>

          {/* Right column - Profile and stats */}
          <div className="lg:col-span-5 space-y-6">
            {/* Profile image placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-surface border border-border">
                {/*
                  Profile Photo Placeholder
                  =========================
                  Add your photo to: public/images/thinu-profile.jpg
                  Supported formats: .jpg, .jpeg, .png, .webp
                  Recommended: 400x400px or larger, portrait orientation
                  
                  If no image is present, initials will be displayed.
                */}
                <img
                  src="/images/thinu-profile.jpg"
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
                  className="hidden w-full h-full items-center justify-center text-4xl font-display font-bold text-text bg-surface"
                  style={{ background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)' }}
                >
                  TU
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="absolute -bottom-3 -right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-mono text-text-dim">Available</span>
              </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid grid-cols-2 gap-3"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-lg bg-surface border border-border"
                >
                  <div className="font-display font-bold text-2xl text-text mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-xs font-mono text-text-dim">
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