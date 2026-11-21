'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion';
import TULogo from '@/components/brand/TULogo';
import SiteHeader from '@/components/portfolio/SiteHeader';
import HeroSection from '@/components/portfolio/HeroSection';
import AboutSection from '@/components/portfolio/AboutSection';
import { getProjectLinks } from '@/lib/projects/links';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brush,
  Cpu,
  Database,
  Globe2,
  Github,
  GraduationCap,
  Layout,
  Linkedin,
  Mail,
  Palette,
  Server,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import type { PortfolioRelease, AnimationSettings } from '@/lib/schemas/portfolio.schema';

const skillIcons: Record<string, LucideIcon> = {
  frontend: Globe2,
  backend: Server,
  database: Database,
  platforms: Layout,
  design: Palette,
  data: BarChart3,
  creative: Brush,
  tools: Wrench,
  iot: Cpu,
};

const projectFilters = ['All', 'Enterprise SaaS', 'AI & Automation', 'Full-Stack', 'SaaS', 'Web Development', 'IoT & Hardware', 'Research'] as const;

const reveals = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

function SectionHeading({
  number,
  eyebrow,
  title,
  id,
}: {
  number: string;
  eyebrow: string;
  title: string;
  id: string;
}) {
  return (
    <motion.div
      className="section-heading motion-content"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={reveals}
    >
      <div className="section-kicker">
        <span>{number}</span>
        <span className="section-kicker-line" />
        <span>{eyebrow}</span>
      </div>
      <h2 id={id}>{title}</h2>
    </motion.div>
  );
}

export default function PortfolioHome({
  data,
  animations,
}: {
  data: PortfolioRelease['content'];
  animations?: AnimationSettings;
}) {
  const [activeProjectFilter, setActiveProjectFilter] = useState<(typeof projectFilters)[number]>('All');
  const [showLoader, setShowLoader] = useState(true);
  const reduceMotion = useReducedMotion();
  const { personal, projects, experience, education, skillCategories } = data;
  const hero = data.hero;
  const visibleProjects = projects.filter((project) => !('hidden' in project && project.hidden));
  const visibleSkillCategories = [...skillCategories].filter((category) => category.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const about = (data as typeof data & { about?: {
    title?: string;
    intro?: string;
    paragraphs?: string[];
    highlights?: Array<{ label?: string; title: string; text?: string; description?: string; hidden?: boolean }>;
    portraitImage?: string;
    portraitAlt?: string;
    resumeLabel?: string;
    resumeLink?: string;
  } }).about;
  const contact = (data as typeof data & { contact?: { title?: string; description?: string; buttonLabel?: string; links?: Array<{ label: string; url: string; icon?: string }> } }).contact;
  const filteredProjects = visibleProjects.filter(
    (project) => activeProjectFilter === 'All'
      || project.category === activeProjectFilter
      || ('additionalCategories' in project && project.additionalCategories?.includes(activeProjectFilter)),
  );

  useEffect(() => {
    if (reduceMotion) {
      setShowLoader(false);
      return;
    }

    const timer = window.setTimeout(() => setShowLoader(false), 1000);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">Skip to content</a>
      <AnimatePresence>
        {showLoader && (
          <motion.div
            className="intro-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
            aria-hidden="true"
          >
            <motion.div
              className="intro-loader-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <TULogo variant="main" animated />
              <span className="intro-loader-caption">THINU UPADYA <i /> PORTFOLIO</span>
              <span className="intro-loader-track"><span /></span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SiteHeader />

      <main id="main">
        <HeroSection hero={hero} personal={personal} />

        <AboutSection about={about} personal={personal} />

        <section className="experience section-wrap section-space" id="experience" aria-labelledby="experience-title">
          <SectionHeading number="02" eyebrow="THE JOURNEY" title="From learning to building real-world solutions." id="experience-title" />
          <div className="timeline">
            {experience.map((job, index) => (
              <motion.article className="timeline-item motion-content" key={job.role} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveals}>
                <div className="timeline-marker"><span>0{index + 1}</span></div>
                <div className="timeline-content">
                  <div className="timeline-meta"><span>{job.period}</span><span>{job.type}</span></div>
                  <h3>{job.role}</h3>
                  <p className="timeline-company">{job.company}</p>
                  <p className="timeline-parent">{job.parent}</p>
                  <ul>{job.commits.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="expertise section-wrap section-space" id="expertise" aria-labelledby="expertise-title">
          <SectionHeading number="03" eyebrow="THE TOOLKIT" title="Technologies I use to turn ideas into working products." id="expertise-title" />
          <p className="skills-note">{data.familiarityNote || 'Tools and practices across professional work, projects, and study. Familiarity varies by technology.'}</p>
          <div className="skills-grid">
            {visibleSkillCategories.map((category, index) => {
              const Icon = skillIcons[category.icon];
              const legacyCategory = category as typeof category & { core?: string[]; more?: string[] };
              const coreTools = category.coreTools.length ? category.coreTools : legacyCategory.core ?? [];
              const alsoExplored = category.alsoExplored.length ? category.alsoExplored : legacyCategory.more ?? [];
              return (
                <motion.details
                  className="skill-card motion-content"
                  key={category.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: (index % 3) * 0.05 }}
                  variants={reveals}
                  open={undefined}
                >
                  <summary>
                    <span className="skill-icon"><Icon size={19} aria-hidden="true" /></span>
                    <span className="skill-heading">
                      <span className="card-index">0{index + 1} / SKILLS</span>
                      <strong>{category.title}</strong>
                      <span className="skill-description">{category.description}</span>
                    </span>
                    <span className="skill-toggle" aria-hidden="true">+</span>
                  </summary>
                  <div className="skill-card-content">
                    <span className="skill-list-label">Core tools</span>
                    <div className="tag-list">{coreTools.map((tool) => <span key={tool}>{tool}</span>)}</div>
                    <span className="skill-list-label">Also explored</span>
                    <div className="tag-list">{alsoExplored.map((tool) => <span key={tool}>{tool}</span>)}</div>
                  </div>
                </motion.details>
              );
            })}
          </div>
        </section>

        <section className="work section-wrap section-space" id="work" aria-labelledby="work-title">
          <SectionHeading number="04" eyebrow="SELECTED WORK" title="Real problems. Thoughtful solutions." id="work-title" />
          <div className="project-filters" role="group" aria-label="Filter projects by category">
            {projectFilters.map((filter) => (
              <button
                className={activeProjectFilter === filter ? 'is-active' : ''}
                type="button"
                key={filter}
                aria-pressed={activeProjectFilter === filter}
                onClick={() => setActiveProjectFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <p className="project-result-count" aria-live="polite">
            Showing {filteredProjects.length} of {visibleProjects.length} projects
          </p>
          <div className="project-grid">
            {filteredProjects.map((project, index) => (
              <motion.article className="project-card motion-content" key={project.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: index * 0.04 }} variants={reveals}>
                <Link className={`project-visual project-visual-${project.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} href={`/projects/${project.id}`} aria-label={`Read the ${project.title} case study`}>
                  {(() => {
                    const media = project as unknown as { thumbnail?: string; thumbnailAlt?: string };
                    return media.thumbnail ? <Image src={media.thumbnail} alt={media.thumbnailAlt || ''} fill sizes="(max-width: 760px) 92vw, 50vw" className="project-thumbnail-image" /> : null;
                  })()}
                  <span className="project-visual-index">PROJECT / {String(index + 1).padStart(2, '0')}</span>
                  <div className="project-visual-copy">
                    <span className="project-visual-category">{project.category}</span>
                    <span className="project-visual-mark">{project.id === 'ravanlink-autopilot' ? 'RL' : project.id === 'event-management' ? 'RFID' : project.id === 'sisupay' ? 'S' : project.id === 'emc-grand-holdings' ? 'EMC' : `0${index + 1}`}</span>
                    <span className="project-visual-name">{project.title}</span>
                  </div>
                  <span className="visual-caption"><span className="visual-caption-text">{project.id === 'ravanlink-autopilot' ? 'PROJECT OVERVIEW · SCREENSHOT PENDING APPROVAL' : 'PROJECT OVERVIEW · NO PUBLIC SCREENSHOT'}</span><span>↗</span></span>
                </Link>
                <div className="project-info">
                  <div className="project-meta">
                    <span>{project.type}</span>
                    <span className="project-status">{project.status}</span>
                    <span>{project.employer}</span>
                  </div>
                  <h3><Link href={`/projects/${project.id}`}>{project.title}</Link></h3>
                  <p>{project.shortDesc}</p>
                  {project.stack.length > 0
                    ? <div className="tag-list">{project.stack.slice(0, 4).map((tool) => <span key={tool}>{tool}</span>)}</div>
                    : <p className="project-meta-note">{project.id === 'ravanlink-autopilot' ? 'Technology stack awaiting source verification' : 'Technology details to be confirmed'}</p>}
                  {'collaborationNote' in project && <p className="project-collaboration">{project.collaborationNote}</p>}
                  <div className="project-card-actions">
                    <Link className="text-link" href={`/projects/${project.id}`}>View case study <ArrowUpRight size={16} /></Link>
                    {getProjectLinks(project as unknown as { link?: unknown; linkLabel?: unknown; links?: unknown }).slice(0, 3).map((link) => <a className="text-link" key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} <ArrowUpRight size={16} /></a>)}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="education section-wrap section-space" id="education" aria-labelledby="education-title">
          <SectionHeading number="05" eyebrow="CONTINUOUS GROWTH" title="Learning, building, improving." id="education-title" />
          <div className="education-grid">
            {education.map((item, index) => (
              <motion.article className="education-card motion-content" key={item.degree} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: index * 0.07 }} variants={reveals}>
                <GraduationCap size={20} aria-hidden="true" />
                <span className="card-index">{item.period}{item.year ? ` · ${item.year}` : item.expected ? ` · EXPECTED ${item.expected}` : ''}</span>
                <h3>{item.degree}</h3>
                <p>{item.institution}</p>
                {item.note && <span className="education-note">{item.note}</span>}
              </motion.article>
            ))}
          </div>
        </section>

        <section className="contact section-wrap" id="contact" aria-labelledby="contact-title">
          <div className="contact-orbit" aria-hidden="true" />
          <div className="section-kicker"><span>06</span><span className="section-kicker-line" /><span>LET&apos;S CONNECT</span></div>
          <div className="contact-content">
            <div>
              <h2 id="contact-title">{(contact?.title || "Have an idea? Let's make it real.").split('? ').map((part, index) => index === 0 ? <Fragment key={part}>{part}?<br /></Fragment> : <span className="accent-text" key={part}>{part}</span>)}</h2>
              <p>{contact?.description || "Whether you're building a product, looking for a developer, or exploring a collaboration, I'd be happy to hear from you."}</p>
              <a className="button button-primary contact-button" href={contact?.links?.find((link) => link.label === 'Email')?.url || `mailto:${personal.email}?subject=Let%E2%80%99s%20build%20something%20together`}>
                <Mail size={17} /> {contact?.buttonLabel || personal.email} <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="contact-socials">
              {(contact?.links?.filter((link) => link.label !== 'Email') ?? [{ label: 'GitHub', url: personal.github }, { label: 'LinkedIn', url: personal.linkedin }, { label: 'Resume', url: '/THINU_UPADYA_CV_Updated.pdf' }]).map((link) => <a key={link.label} href={link.url} target={link.url.startsWith('http') ? '_blank' : undefined} rel={link.url.startsWith('http') ? 'noreferrer' : undefined}>{link.label} <ArrowUpRight size={16} /></a>)}
            </div>
          </div>
          <footer className="site-footer">
            <a className="wordmark" href="#home" aria-label="Back to top">
              <TULogo variant="footer" />
            </a>
            <span>Engineering ideas. Crafting experiences. · {new Date().getFullYear()}</span>
            <a href="#home">Back to top ↑</a>
          </footer>
        </section>
      </main>
    </MotionConfig>
  );
}
