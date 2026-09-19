'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  GitBranch, 
  TestTube, 
  GitCommit, 
  Rocket,
  Sparkles
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  tools: string[];
  color: string;
}

const workflowSteps: WorkflowStep[] = [
  { id: 'plan', label: 'Plan', icon: Code2, description: 'Design and architecture planning using Figma and VS Code', tools: ['Figma', 'VS Code', 'Notion'], color: '#a3e635' },
  { id: 'code', label: 'Code', icon: GitBranch, description: 'Development with Git version control and feature branches', tools: ['VS Code', 'Cursor', 'Git', 'GitHub'], color: '#22c55e' },
  { id: 'ai', label: 'AI', icon: Sparkles, description: 'AI-powered code suggestions, refactoring, and debugging', tools: ['Cursor AI', 'Copilot', 'ChatGPT'], color: '#84cc16' },
  { id: 'test', label: 'Test', icon: TestTube, description: 'Manual and automated testing with Postman and Jest', tools: ['Postman', 'Jest', 'PHPUnit'], color: '#65a30d' },
  { id: 'commit', label: 'Commit', icon: GitCommit, description: 'Code review, merge, and documentation updates', tools: ['GitHub', 'Pull Requests'], color: '#4d7c0f' },
  { id: 'deploy', label: 'Deploy', icon: Rocket, description: 'CI/CD automation and cloud deployment', tools: ['GitHub Actions', 'Azure', 'Vercel'], color: '#3f6212' },
];

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const currentStep = workflowSteps.find(s => s.id === activeStep);

  return (
    <section id="workflow" className="min-h-[60vh] pt-24 lg:pt-20 pb-16 px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-text mb-3">
            Development Workflow
          </h2>
          <p className="text-sm text-text-dim font-mono">
            From concept to production using modern tooling and AI assistance
          </p>
        </motion.div>

        {/* Workflow steps - horizontal on desktop, scrollable on mobile */}
        <div className="relative mb-8 overflow-x-auto pb-4">
          {/* Connecting line */}
          <div className="absolute top-8 left-[12%] right-[12%] h-0.5 bg-border hidden sm:block" />
          
          <div className="flex sm:justify-between relative min-w-max sm:px-4">
            {workflowSteps.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <motion.button
                  key={step.id}
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                  className="relative z-10 group mx-1 sm:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div 
                    className={`
                      w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${isActive 
                        ? 'bg-surface border-accent scale-110' 
                        : 'bg-surface border-border group-hover:border-accent/50'
                      }
                    `}
                  >
                    <Icon 
                      size={20} 
                      className={`sm:w-[22px] sm:h-[22px] ${isActive ? 'text-accent' : 'text-text-dim group-hover:text-accent'}`} 
                    />
                  </div>
                  <div className={`
                    absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] sm:text-xs
                    ${isActive ? 'text-accent' : 'text-text-dim'}
                  `}>
                    {step.label}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Step details */}
        <AnimatePresence mode="wait">
            {currentStep && (
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 sm:p-6 rounded-lg bg-surface border border-border max-w-xl mx-auto"
              >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div 
                  className="w-1 sm:h-auto sm:w-1 rounded-full h-8 sm:min-h-[80px]"
                  style={{ background: currentStep.color }}
                />
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg sm:text-xl text-text mb-2">
                    {currentStep.label}
                  </h3>
                  <p className="text-sm text-text-dim mb-3 sm:mb-4">
                    {currentStep.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentStep.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-1 rounded text-xs font-mono bg-border/50 text-text-dim"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!activeStep && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs sm:text-sm text-text-dim font-mono mt-4"
          >
            Tap on a step to see details
          </motion.p>
        )}
      </div>
    </section>
  );
}