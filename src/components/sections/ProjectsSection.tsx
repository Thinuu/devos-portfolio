'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, ExternalLink, Github, X, ChevronRight } from 'lucide-react';
import { portfolioData } from '@/lib/data';

const { projects } = portfolioData;

export default function ProjectsSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = projects.find((p) => p.id === activeId);

  return (
    <section id="projects" className="min-h-screen pt-24 lg:pt-20 pb-16 px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-text mb-3">
            Selected Projects
          </h2>
          <p className="text-sm text-text-dim font-mono">
            {projects.length} project{projects.length !== 1 ? 's' : ''} across full-stack, IoT, and research
          </p>
        </motion.div>

        {/* Project grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {projects.map((project, i) => (
            <motion.button
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActiveId(project.id)}
              className="p-5 rounded-lg bg-surface border border-border hover:border-accent/40 text-left transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <Folder
                  size={24}
                  className="text-text-dim group-hover:text-accent transition-colors"
                />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border text-text-dim">
                  {project.type}
                </span>
              </div>

              <h3 className="font-display font-semibold text-text mb-2 leading-snug">
                {project.title}
              </h3>
              <p className="text-text-dim text-xs mb-4 leading-relaxed line-clamp-2">
                {project.shortDesc}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {project.stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-border/50 text-text-dim"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* View more indicator */}
              <div className="flex items-center gap-1 mt-4 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View details</span>
                <ChevronRight size={12} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Project detail modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setActiveId(null)}
          >
            <div className="absolute inset-0 bg-bg/90 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-surface rounded-xl border border-border max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-text">
                    {active.title}
                  </h3>
                  <p className="text-xs text-text-dim mt-0.5">
                    {active.employer} · {active.year}
                  </p>
                </div>
                <button
                  onClick={() => setActiveId(null)}
                  className="text-text-dim hover:text-text transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-mono text-xs text-accent uppercase tracking-wide mb-2">
                    Overview
                  </h4>
                  <p className="text-text-dim leading-relaxed text-sm">
                    {active.fullDesc}
                  </p>
                </div>

                {/* Role/Contribution */}
                {active.role && (
                  <div>
                    <h4 className="font-mono text-xs text-accent uppercase tracking-wide mb-2">
                      My Role
                    </h4>
                    <p className="text-text-dim leading-relaxed text-sm">
                      {active.role}
                    </p>
                  </div>
                )}

                {/* Architecture */}
                {active.architecture && (
                  <div>
                    <h4 className="font-mono text-xs text-accent uppercase tracking-wide mb-2">
                      Architecture
                    </h4>
                    <p className="text-text-dim leading-relaxed text-sm font-mono bg-bg/50 rounded-lg p-4">
                      {active.architecture}
                    </p>
                  </div>
                )}

                {/* Key contributions */}
                {active.highlights && active.highlights.length > 0 && (
                  <div>
                    <h4 className="font-mono text-xs text-accent uppercase tracking-wide mb-3">
                      Key Contributions
                    </h4>
                    <ul className="space-y-2">
                      {active.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-dim">
                          <ChevronRight size={14} className="text-accent mt-0.5 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech stack */}
                <div>
                  <h4 className="font-mono text-xs text-accent uppercase tracking-wide mb-3">
                    Technology Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {active.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-mono px-3 py-1 rounded bg-border/50 text-text"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Links */}
                {(active.link || active.links) && (
                  <div>
                    <h4 className="font-mono text-xs text-accent uppercase tracking-wide mb-3">
                      {active.link ? 'Live Demo' : 'Live Sites'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {active.link && (
                        <a
                          href={active.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded border border-border text-text-dim hover:text-text hover:border-accent/50 transition-colors"
                        >
                          <ExternalLink size={14} />
                          Visit
                        </a>
                      )}
                      {active.links?.map((href) => (
                        <a
                          key={href}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded border border-border text-text-dim hover:text-text hover:border-accent/50 transition-colors"
                        >
                          <ExternalLink size={14} />
                          {href.replace(/^https?:\/\//, '').split('/')[0]}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status badge */}
                <div className="pt-4 border-t border-border">
                  <span className="text-xs font-mono px-3 py-1 rounded border border-border text-text-dim">
                    Status: {active.status}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}