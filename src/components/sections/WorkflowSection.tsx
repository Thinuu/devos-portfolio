'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  GitBranch, 
  TestTube, 
  GitCommit, 
  Rocket,
  Sparkles,
  ArrowRight
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
  {
    id: 'plan',
    label: 'Plan',
    icon: Code2,
    description: 'Design and architecture planning using Figma and VS Code',
    tools: ['Figma', 'VS Code', 'Notion'],
    color: '#a3e635',
  },
  {
    id: 'code',
    label: 'Code',
    icon: GitBranch,
    description: 'Development with Git version control and feature branches',
    tools: ['VS Code', 'Cursor', 'Git', 'GitHub'],
    color: '#22c55e',
  },
  {
    id: 'ai',
    label: 'AI Assist',
    icon: Sparkles,
    description: 'AI-powered code suggestions, refactoring, and debugging',
    tools: ['Cursor AI', 'GitHub Copilot', 'ChatGPT'],
    color: '#84cc16',
  },
  {
    id: 'test',
    label: 'Test',
    icon: TestTube,
    description: 'Manual and automated testing with Postman and Jest',
    tools: ['Postman', 'Jest', 'PHPUnit'],
    color: '#65a30d',
  },
  {
    id: 'commit',
    label: 'Commit',
    icon: GitCommit,
    description: 'Code review, merge, and documentation updates',
    tools: ['GitHub', 'Pull Requests'],
    color: '#4d7c0f',
  },
  {
    id: 'deploy',
    label: 'Deploy',
    icon: Rocket,
    description: 'CI/CD automation and cloud deployment',
    tools: ['GitHub Actions', 'Azure', 'Vercel'],
    color: '#3f6212',
  },
];

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const currentStep = workflowSteps.find(s => s.id === activeStep);

  return (
    <section id="workflow" className="min-h-[60vh] pt-24 pb-16 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-display font-bold text-4xl text-text mb-3">
            Development Workflow
          </h2>
          <p className="text-text-dim">
            From concept to production using modern tooling and AI assistance
          </p>
        </motion.div>

        {/* Workflow steps */}
        <div className="relative mb-8">
          {/* Connecting line */}
          <div className="absolute top-8 left-[8%] right-[8%] h-0.5 bg-border" />
          
          <div className="flex justify-between relative px-2">
            {workflowSteps.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <motion.button
                  key={step.id}
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                  className="relative z-10 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div 
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${isActive 
                        ? 'bg-surface border-accent scale-110' 
                        : 'bg-surface border-border group-hover:border-accent/50'
                      }
                    `}
                  >
                    <Icon 
                      size={22} 
                      className={isActive ? 'text-accent' : 'text-text-dim group-hover:text-accent'} 
                    />
                  </div>
                  <div className={`
                    absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-xs
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
              className="p-6 rounded-lg bg-surface border border-border"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-1 h-full rounded-full"
                  style={{ background: currentStep.color }}
                />
                <div className="flex-1">
                  <h3 className="font-display font-bold text-xl text-text mb-2">
                    {currentStep.label}
                  </h3>
                  <p className="text-text-dim mb-4">
                    {currentStep.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentStep.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-3 py-1 rounded text-xs font-mono bg-border/50 text-text-dim"
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
            className="text-center text-text-dim text-sm font-mono"
          >
            Click on a step to see details
          </motion.p>
        )}
      </div>
    </section>
  );
}