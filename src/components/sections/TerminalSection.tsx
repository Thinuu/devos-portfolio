'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '@/lib/data';

interface HistoryLine {
  type: 'input' | 'output';
  text: string;
}

const HELP_TEXT = [
  'Available commands:',
  '',
  '  help        Show this help message',
  '  about       About Thinu',
  '  projects    List all projects',
  '  skills      Show technical skills',
  '  experience  Work experience timeline',
  '  contact     Contact information',
  '  resume      Download CV',
  '  clear       Clear terminal',
  '',
  'Type a command and press Enter',
];

export default function TerminalSection() {
  const [history, setHistory] = useState<HistoryLine[]>([
    { type: 'output', text: 'Welcome to the terminal. Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newHistory: HistoryLine[] = [...history, { type: 'input', text: cmd }];

    switch (trimmed) {
      case 'help':
        HELP_TEXT.forEach((line) => newHistory.push({ type: 'output', text: line }));
        break;
      case 'about':
        newHistory.push({ type: 'output', text: '' });
        newHistory.push({ type: 'output', text: `Name:    ${portfolioData.personal.name}` });
        newHistory.push({ type: 'output', text: `Role:    ${portfolioData.personal.role}` });
        newHistory.push({ type: 'output', text: `Bio:     ${portfolioData.personal.bio.split('.')[0]}.` });
        newHistory.push({ type: 'output', text: '' });
        break;
      case 'projects':
        newHistory.push({ type: 'output', text: '' });
        portfolioData.projects.forEach((p) =>
          newHistory.push({ type: 'output', text: `  • ${p.title} [${p.status}]` })
        );
        newHistory.push({ type: 'output', text: '' });
        break;
      case 'skills':
        newHistory.push({ type: 'output', text: '' });
        newHistory.push({ type: 'output', text: 'Languages:    JavaScript, TypeScript, Python, PHP, Java, C#, C++, SQL' });
        newHistory.push({ type: 'output', text: 'Frontend:     React, Next.js, Angular, Tailwind CSS' });
        newHistory.push({ type: 'output', text: 'Backend:      Node.js, Express, PHP/Laravel, Python, .NET' });
        newHistory.push({ type: 'output', text: 'Databases:    MySQL, PostgreSQL, MongoDB, Firebase' });
        newHistory.push({ type: 'output', text: 'IoT:          ESP32, Arduino, Blynk' });
        newHistory.push({ type: 'output', text: '' });
        break;
      case 'experience':
        newHistory.push({ type: 'output', text: '' });
        portfolioData.experience.forEach((e) =>
          newHistory.push({ type: 'output', text: `  • ${e.role} @ ${e.company} (${e.period})` })
        );
        newHistory.push({ type: 'output', text: '' });
        break;
      case 'contact':
        newHistory.push({ type: 'output', text: '' });
        newHistory.push({ type: 'output', text: `Email:    ${portfolioData.personal.email}` });
        newHistory.push({ type: 'output', text: `Phone:    ${portfolioData.personal.phone}` });
        newHistory.push({ type: 'output', text: `GitHub:   ${portfolioData.personal.github}` });
        newHistory.push({ type: 'output', text: `LinkedIn: ${portfolioData.personal.linkedin}` });
        newHistory.push({ type: 'output', text: '' });
        break;
      case 'resume':
        newHistory.push({ type: 'output', text: 'Downloading CV...' });
        const link = document.createElement('a');
        link.href = '/Thinu_Upadya_CV_Updated.pdf';
        link.download = 'Thinu_Upadya_CV.pdf';
        link.click();
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case '':
        break;
      default:
        newHistory.push({ type: 'output', text: `Command not found: ${cmd}. Type "help" for available commands.` });
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <section id="terminal" className="min-h-screen pt-24 lg:pt-20 pb-16 px-6 lg:px-8 relative flex items-center">
      <div className="max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-text mb-3 flex items-center gap-3">
            Terminal
          </h2>
          <p className="text-sm text-text-dim font-mono">
            Interactive command line interface
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-lg bg-surface border border-border overflow-hidden shadow-xl shadow-accent/5"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Window chrome */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
            <span className="ml-3 font-mono text-xs text-text-dim">
              thinu@portfolio:~
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-5 h-80 overflow-y-auto font-mono text-sm">
            {history.map((line, i) => (
              <div key={i} className="mb-1 leading-5 sm:leading-6">
                {line.type === 'input' ? (
                  <div className="flex gap-2">
                    <span className="text-accent">$</span>
                    <span className="text-text">{line.text}</span>
                  </div>
                ) : (
                  <div className="text-text-dim pl-0 whitespace-pre-wrap">{line.text}</div>
                )}
              </div>
            ))}

            {/* Input line */}
            <div className="flex gap-2 items-center">
              <span className="text-accent">$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runCommand(input);
                }}
                className="bg-transparent border-none outline-none flex-1 text-text font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
                aria-label="Terminal command input"
              />
            </div>
            <div ref={endRef} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}