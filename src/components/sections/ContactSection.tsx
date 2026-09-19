'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, Github, Linkedin, ArrowUpRight, Code2, Phone } from 'lucide-react';
import { portfolioData } from '@/lib/data';
import TULogo from '@/components/brand/TULogo';

const { personal } = portfolioData;

export default function ContactSection() {
  return (
    <section id="contact" className="min-h-screen pt-24 pb-16 px-6 relative flex items-center">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-display font-bold text-4xl text-text mb-3">
            Get In Touch
          </h2>
          <p className="text-text-dim">
            Available for opportunities and collaboration
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Email */}
          <a
            href={`mailto:${personal.email}`}
            className="contact-card p-6 rounded-lg bg-surface border border-border hover:border-accent/40 transition-all duration-200 group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Mail size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono text-text-dim mb-1">Email</div>
                <div className="text-text group-hover:text-accent transition-colors">
                  {personal.email}
                </div>
              </div>
              <ArrowUpRight size={16} className="text-text-dim group-hover:text-accent transition-colors" />
            </div>
          </a>

          {/* Phone */}
          <a
            href={`tel:${personal.phone}`}
            className="contact-card p-6 rounded-lg bg-surface border border-border hover:border-accent/40 transition-all duration-200 group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Phone size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono text-text-dim mb-1">Phone</div>
                <div className="text-text group-hover:text-accent transition-colors">
                  {personal.phone}
                </div>
              </div>
              <ArrowUpRight size={16} className="text-text-dim group-hover:text-accent transition-colors" />
            </div>
          </a>

          {/* GitHub */}
          <a
            href={personal.github}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card p-6 rounded-lg bg-surface border border-border hover:border-accent/40 transition-all duration-200 group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Github size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono text-text-dim mb-1">GitHub</div>
                <div className="text-text group-hover:text-accent transition-colors">
                  Thinuu
                </div>
              </div>
              <ArrowUpRight size={16} className="text-text-dim group-hover:text-accent transition-colors" />
            </div>
          </a>

          {/* LinkedIn */}
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card p-6 rounded-lg bg-surface border border-border hover:border-accent/40 transition-all duration-200 group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Linkedin size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono text-text-dim mb-1">LinkedIn</div>
                <div className="text-text group-hover:text-accent transition-colors">
                  thinu-upadya
                </div>
              </div>
              <ArrowUpRight size={16} className="text-text-dim group-hover:text-accent transition-colors" />
            </div>
          </a>

          {/* Location */}
          <div className="p-6 rounded-lg bg-surface border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin size={20} className="text-accent" />
              </div>
              <div>
                <div className="text-xs font-mono text-text-dim mb-1">Location</div>
                <div className="text-text">{personal.location}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer with TU branding */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-8 border-t border-border"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TULogo variant="compact" />
              <div>
                <div className="font-display font-semibold text-text">TU</div>
                <div className="text-xs text-text-dim">Thinu Upadya</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-text-dim">
              <span className="flex items-center gap-1">
                <Code2 size={14} />
                Built with Next.js
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