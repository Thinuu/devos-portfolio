'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  GitBranch, 
  Database, 
  Cloud, 
  Palette, 
  Container,
  Terminal,
  Box,
  Search,
  Cpu,
  TestTube,
  Server,
  Sparkles,
  FileCode,
  Layers
} from 'lucide-react';

interface Tool {
  name: string;
  icon: React.ElementType;
  description: string;
  category: string;
  verified?: boolean;
}

// Simple lightning icon component
const Lightning = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const tools: Tool[] = [
  // IDEs & Editors
  { name: 'Visual Studio Code', icon: Code2, description: 'Primary code editor for full-stack development', category: 'ides' },
  { name: 'Cursor', icon: FileCode, description: 'AI-powered code editor for faster development', category: 'ides' },
  { name: 'Android Studio', icon: Box, description: 'Android mobile app development environment', category: 'ides' },
  { name: 'Arduino IDE', icon: Cpu, description: 'Embedded C++ development for ESP32 and Arduino', category: 'ides' },
  
  // AI Coding Assistants
  { name: 'GitHub Copilot', icon: Sparkles, description: 'AI pair programming for code suggestions', category: 'ai' },
  { name: 'Cursor AI', icon: Sparkles, description: 'AI-enhanced editing and code generation', category: 'ai' },
  { name: 'ChatGPT', icon: Sparkles, description: 'Code explanation and development assistance', category: 'ai' },
  
  // PHP Ecosystem
  { name: 'PHP', icon: FileCode, description: 'Server-side scripting for web applications', category: 'php' },
  { name: 'Laravel', icon: Layers, description: 'PHP framework for enterprise web applications', category: 'php' },
  { name: 'Composer', icon: Box, description: 'PHP dependency management', category: 'php' },
  { name: 'PHPUnit', icon: TestTube, description: 'Unit testing framework for PHP', category: 'php' },
  
  // Backend & APIs
  { name: 'Node.js', icon: Server, description: 'JavaScript runtime for backend services', category: 'backend' },
  { name: 'Express.js', icon: Server, description: 'Minimal Node.js web framework', category: 'backend' },
  { name: 'Vite', icon: Box, description: 'Fast build tool for modern web apps', category: 'backend' },
  
  // Databases
  { name: 'MySQL', icon: Database, description: 'Relational database for structured data', category: 'databases' },
  { name: 'MongoDB', icon: Database, description: 'NoSQL document database for flexible schemas', category: 'databases' },
  { name: 'Firebase', icon: Cloud, description: 'Backend-as-a-service platform', category: 'databases' },
  { name: 'PostgreSQL', icon: Database, description: 'Advanced open-source relational database', category: 'databases' },
  { name: 'Prisma', icon: Box, description: 'Type-safe ORM for Node.js and TypeScript', category: 'databases' },
  { name: 'Mongoose', icon: Box, description: 'MongoDB object modeling for Node.js', category: 'databases' },
  
  // Cloud & DevOps
  { name: 'GitHub', icon: GitBranch, description: 'Version control and collaboration', category: 'devops' },
  { name: 'GitHub Actions', icon: Terminal, description: 'CI/CD automation and workflows', category: 'devops' },
  { name: 'Docker', icon: Container, description: 'Containerization for consistent deployments', category: 'devops' },
  { name: 'Azure', icon: Cloud, description: 'Cloud deployment for production apps', category: 'devops' },
  { name: 'Vercel', icon: Cloud, description: 'Frontend deployment and hosting', category: 'devops' },
  { name: 'AWS', icon: Cloud, description: 'Cloud infrastructure services', category: 'devops' },
  
  // Testing
  { name: 'Jest', icon: TestTube, description: 'JavaScript testing framework', category: 'testing' },
  
  // Design
  { name: 'Figma', icon: Palette, description: 'UI/UX design and prototyping', category: 'design' },
  { name: 'Elementor', icon: Palette, description: 'WordPress page builder for rapid design', category: 'design' },
  
  // IoT
  { name: 'ESP32', icon: Cpu, description: 'Microcontroller for IoT projects', category: 'iot' },
  { name: 'Blynk', icon: Cloud, description: 'IoT platform for remote monitoring', category: 'iot' },
];

const categories = [
  { key: 'all', label: 'All Tools', icon: Box },
  { key: 'ides', label: 'IDEs & Editors', icon: Code2 },
  { key: 'ai', label: 'AI Assistants', icon: Sparkles },
  { key: 'php', label: 'PHP & Laravel', icon: Layers },
  { key: 'backend', label: 'Backend & APIs', icon: Server },
  { key: 'databases', label: 'Databases', icon: Database },
  { key: 'devops', label: 'Cloud & DevOps', icon: Cloud },
  { key: 'testing', label: 'Testing', icon: TestTube },
  { key: 'design', label: 'Design', icon: Palette },
  { key: 'iot', label: 'IoT', icon: Cpu },
];

export default function ToolsSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    let result = activeCategory === 'all' 
      ? tools 
      : tools.filter(t => t.category === activeCategory);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [activeCategory, searchQuery]);

  return (
    <section id="tools" className="min-h-screen pt-24 pb-16 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-display font-bold text-4xl text-text mb-3">
            Developer Toolkit
          </h2>
          <p className="text-text-dim">
            Software, platforms, and tools I use to build and deploy projects
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg bg-surface border border-border text-text placeholder-text-dim focus:border-accent/50 focus:outline-none transition-colors"
          />
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200
                  ${isActive 
                    ? 'bg-accent text-bg' 
                    : 'bg-surface border border-border text-text-dim hover:text-text hover:border-accent/40'
                  }
                `}
              >
                <Icon size={12} />
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Tools count */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-4 text-xs text-text-dim font-mono"
        >
          {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
        </motion.div>

        {/* Tools grid */}
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.name}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-lg bg-surface border border-border hover:border-accent/40 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-border/50 flex items-center justify-center group-hover:bg-accent/20 transition-colors flex-shrink-0">
                      <Icon size={18} className="text-text-dim group-hover:text-accent transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-medium text-text text-sm">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-text-dim leading-relaxed mt-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-text-dim text-sm"
          >
            No tools found matching "{searchQuery}"
          </motion.div>
        )}
      </div>
    </section>
  );
}