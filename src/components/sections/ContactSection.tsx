'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, Github, Linkedin, ArrowUpRight, Code2, Phone } from 'lucide-react';
import { portfolioData } from '@/lib/data';
import TULogo from '@/components/brand/TULogo';

const { personal } = portfolioData;

export default function ContactSection() {
  return (
    <section id="contact" className="min-h-screen pt-24 lg:pt-20 pb-16 px-6 lg:px-8 relative flex items-center">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-text mb-3">
            Get In Touch
          </h2>
          <p className="text-sm text-text-dim font-mono">
            Available for opportunities and collaboration
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Email */}
          <a
            href={`mailto:${personal.email}`}
            className="contact-card p-5 rounded-lg bg-surface border border-border hover:border-accent/40 transition-all duration-200 group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors flex-shrink-0">
                <Mail size={20} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-text-dim mb-1">Email</div>
                <div className="text-sm text-text group-hover:text-accent transition-colors truncate">
                  {personal.email}
                </div>
              </div>
              <ArrowUpRight size={16} className="text-text-dim group-hover:text-accent transition-colors flex-shrink-0" />
            </div>
          </a>

          {/* Phone */}
          <a
            href={`tel:${personal.phone}`}
            className="contact-card p-5 rounded-lg bg-surface border border-border hover:border-accent/40 transition-all duration-200 group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors flex-shrink-0">
                <Phone size={20} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-text-dim mb-1">Phone</div>
                <div className="text-sm text-text group-hover:text-accent transition-colors truncate">
                  {personal.phone}
                </div>
              </div>
              <ArrowUpRight size={16} className="text-text-dim group-hover:text-accent transition-colors flex-shrink-0" />
            </div>
          </a>

          {/* GitHub */}
          <a
            href={personal.github}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card p-5 rounded-lg bg-surface border border-border hover:border-accent/40 transition-all duration-200 group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors flex-shrink-0">
                <Github size={20} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-text-dim mb-1">GitHub</div>
                <div className="text-sm text-text group-hover:text-accent transition-colors truncate">
                  Thinuu
                </div>
              </div>
              <ArrowUpRight size={16} className="text-text-dim group-hover:text-accent transition-colors flex-shrink-0" />
            </div>
          </a>

          {/* LinkedIn */}
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card p-5 rounded-lg bg-surface border border-border hover:border-accent/40 transition-all duration-200 group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors flex-shrink-0">
                <Linkedin size={20} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-text-dim mb-1">LinkedIn</div>
                <div className="text-sm text-text group-hover:text-accent transition-colors truncate">
                  thinu-upadya
                </div>
              </div>
              <ArrowUpRight size={16} className="text-text-dim group-hover:text-accent transition-colors flex-shrink-0" />
            </div>
          </a>

          {/* Location */}
          <div className="p-5 rounded-lg bg-surface border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-text-dim mb-1">Location</div>
                <div className="text-sm text-text">{personal.location}</div>
              </div>
              <MapPin size={16} className="text-text-dim flex-shrink-0" />
            </div>
          </div>
        </motion.div>

        {/* Footer with TU branding */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-border"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TULogo variant="compact" />
              <div>
                <div className="font-display font-semibold text-text">TU</div>
                <div className="text-xs text-text-dim">Thinu Upadya</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-text-dim">
              <span className="flex items-center gap-2">
                <Code2 size={14} />
                <span>Built with Next.js</span>
              </span>
              <span>·</span>
              <span>{new Date().getFullYear()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}