'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Globe, 
  Server, 
  Database, 
  Cloud, 
  Terminal, 
  Shield,
  TestTube,
  Layout,
  Cpu,
  Layers,
  FileCode
} from 'lucide-react';
import { portfolioData } from '@/lib/data';

const { skills } = portfolioData;

const CATEGORIES = [
  { key: 'languages', label: 'Languages', icon: Code2 },
  { key: 'frontend', label: 'Frontend', icon: Globe },
  { key: 'backend', label: 'Backend', icon: Server },
  { key: 'php', label: 'PHP & Laravel', icon: Layers },
  { key: 'databases', label: 'Databases', icon: Database },
  { key: 'cloud', label: 'Cloud & Azure', icon: Cloud },
  { key: 'apis', label: 'APIs & Security', icon: Shield },
  { key: 'testing', label: 'Testing', icon: TestTube },
  { key: 'devops', label: 'DevOps', icon: Terminal },
  { key: 'cms', label: 'CMS & Design', icon: Layout },
  { key: 'iot', label: 'IoT', icon: Cpu },
] as const;

export default function SkillsSection() {
  const [activeCategory, setActiveCategory] = useState<string>('languages');

  const getCategorySkills = (key: string) => {
    // Handle new categories not in original data
    if (key === 'php') {
      return [
        { name: 'PHP', years: 2 },
        { name: 'Laravel', years: 2 },
        { name: 'Composer', years: 2 },
        { name: 'PHPUnit', years: 2 },
      ];
    }
    const category = key as keyof typeof skills;
    return skills[category] || [];
  };

  const currentSkills = getCategorySkills(activeCategory);

  return (
    <section id="skills" className="min-h-screen pt-24 lg:pt-20 pb-16 px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-text mb-3">
            Technical Skills
          </h2>
          <p className="text-sm text-text-dim font-mono">
            Technologies accumulated through projects and experience
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-10"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`
                  inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-mono transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'bg-accent text-bg' 
                    : 'bg-surface border border-border text-text-dim hover:text-text hover:border-accent/40'
                  }
                `}
              >
                <Icon size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="hidden xs:inline">{cat.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Skills display */}
        <div className="min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-wrap gap-3">
                {currentSkills.map((skill, i) => (
                  <motion.span
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-4 py-2 rounded-lg text-sm text-text bg-surface border border-border hover:border-accent/40 transition-all duration-200 cursor-default"
                  >
                    {skill.name}
                    {skill.years && (
                      <span className="ml-2 text-xs text-text-dim">
                        ({skill.years}y)
                      </span>
                    )}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}