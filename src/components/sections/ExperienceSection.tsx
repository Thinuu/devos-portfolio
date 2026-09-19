'use client';

import { motion } from 'framer-motion';
import { Briefcase, Award, GraduationCap } from 'lucide-react';
import { portfolioData } from '@/lib/data';

const { experience, education } = portfolioData;

export default function ExperienceSection() {
  return (
    <section id="experience" className="min-h-screen pt-24 pb-16 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-display font-bold text-4xl text-text mb-3">
            Experience & Education
          </h2>
          <p className="text-text-dim">
            Professional journey and academic background
          </p>
        </motion.div>

        {/* Work Experience */}
        <div className="mb-16">
          <h3 className="font-mono text-sm text-accent uppercase tracking-wide mb-6 flex items-center gap-2">
            <Briefcase size={14} />
            Work Experience
          </h3>

          <div className="relative pl-8">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-0 w-px bg-border" />

            {experience.map((job, i) => (
              <motion.div
                key={job.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pb-8 last:pb-0"
              >
                {/* Timeline dot */}
                <div className="absolute left-[-17px] top-1 w-6 h-6 rounded-full bg-surface border-2 border-accent flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>

                <div className="p-5 rounded-lg bg-surface border border-border">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h4 className="font-display font-semibold text-lg text-text">
                      {job.role}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border text-text-dim">
                      {job.type}
                    </span>
                  </div>

                  <p className="text-sm text-accent mb-0.5">{job.company}</p>
                  {job.parent && (
                    <p className="text-xs text-text-dim mb-2">{job.parent}</p>
                  )}
                  <p className="text-xs font-mono text-text-dim mb-4">
                    {job.period}
                  </p>

                  <ul className="space-y-2">
                    {job.commits.map((commit, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-text-dim">
                        <span className="text-accent mt-1.5">→</span>
                        <span>{commit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h3 className="font-mono text-sm text-accent uppercase tracking-wide mb-6 flex items-center gap-2">
            <GraduationCap size={14} />
            Education
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {education.map((edu, i) => (
              <motion.div
                key={edu.degree}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-lg bg-surface border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <GraduationCap size={18} className="text-accent" />
                  {edu.note && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-accent/30 text-accent bg-accent/10">
                      {edu.note}
                    </span>
                  )}
                </div>
                <h4 className="font-display font-semibold text-text mb-1">
                  {edu.degree}
                </h4>
                <p className="text-sm text-accent mb-1">{edu.institution}</p>
                <p className="text-xs font-mono text-text-dim">
                  {edu.period}
                  {edu.expected && ` · Expected: ${edu.expected}`}
                  {edu.year && ` · ${edu.year}`}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}