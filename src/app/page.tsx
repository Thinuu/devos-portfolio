'use client';

import { useState, useEffect, useRef } from 'react';
import BootSequence from '@/components/boot/BootSequence';
import Taskbar from '@/components/os/Taskbar';
import HomeSection from '@/components/sections/HomeSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ToolsSection from '@/components/sections/ToolsSection';
import WorkflowSection from '@/components/sections/WorkflowSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import TerminalSection from '@/components/sections/TerminalSection';
import ContactSection from '@/components/sections/ContactSection';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({});

  const handleNavigate = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Track which section is in view
  useEffect(() => {
    if (!booted) return;
    const sections = ['home', 'projects', 'skills', 'tools', 'workflow', 'experience', 'terminal', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [booted]);

  // Lock scroll during boot
  useEffect(() => {
    document.body.style.overflow = booted ? 'auto' : 'hidden';
  }, [booted]);

  // Ensure the page starts at the home section after boot
  useEffect(() => {
    if (!booted) return;

    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    const scrollHome = () => {
      const homeSection = document.getElementById('home');
      if (homeSection) {
        homeSection.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      setActiveSection('home');
    };

    scrollHome();
    const timer = window.setTimeout(scrollHome, 50);
    return () => window.clearTimeout(timer);
  }, [booted]);

  return (
    <main className="relative">
      <AnimatedBackground />
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}

      {booted && (
        <>
          <Taskbar activeWindow={activeSection} onNavigate={handleNavigate} />
          <HomeSection />
          <ProjectsSection />
          <SkillsSection />
          <ToolsSection />
          <WorkflowSection />
          <ExperienceSection />
          <TerminalSection />
          <ContactSection />
        </>
      )}
    </main>
  );
}