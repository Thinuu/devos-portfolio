'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion';
import TULogo from '@/components/brand/TULogo';
import SiteHeader from '@/components/portfolio/SiteHeader';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  BarChart3,
  Brush,
  Code2,
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
import { useEffect, useState } from 'react';
import { portfolioData } from '@/lib/data';

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

export default function PortfolioHome() {
  const [activeProjectFilter, setActiveProjectFilter] = useState<(typeof projectFilters)[number]>('All');
  const [showLoader, setShowLoader] = useState(true);
  const reduceMotion = useReducedMotion();
  const { personal, projects, experience, education, skillCategories } = portfolioData;
  const filteredProjects = projects.filter(
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
        <section className="hero section-wrap" id="home" aria-labelledby="hero-title">
          <div className="hero-copy">
            <motion.p className="eyebrow hero-eyebrow motion-content" initial="hidden" animate="visible" variants={reveals}>
              <span className="status-dot" /> FULL-STACK DEVELOPER <span className="eyebrow-slash">/</span> SOFTWARE ENGINEER
            </motion.p>
            <motion.h1 className="motion-content" id="hero-title" initial="hidden" animate="visible" transition={{ delay: 0.08 }} variants={reveals}>
              Engineering<br />
              <span className="accent-text">ideas.</span>
              <br />
              Crafting<br />
              experiences<span className="accent-text">.</span>
            </motion.h1>
            <motion.p className="hero-description motion-content" initial="hidden" animate="visible" transition={{ delay: 0.16 }} variants={reveals}>
              Hi, I&apos;m Thinu Upadya — a Full-Stack Developer and Software Engineer focused on transforming complex ideas into intuitive, scalable, and meaningful digital products.
            </motion.p>
            <motion.p className="hero-supporting motion-content" initial="hidden" animate="visible" transition={{ delay: 0.2 }} variants={reveals}>
              I build modern web applications and digital experiences that bring together clean design, reliable engineering, and practical business value.
            </motion.p>
            <motion.div className="hero-actions motion-content" initial="hidden" animate="visible" transition={{ delay: 0.24 }} variants={reveals}>
              <a className="button button-primary" href="#work">Explore my work <ArrowUpRight size={17} /></a>
              <a className="button button-secondary" href="#contact">Let&apos;s connect <ArrowRight size={16} /></a>
            </motion.div>
            <motion.div className="social-row motion-content" initial="hidden" animate="visible" transition={{ delay: 0.32 }} variants={reveals}>
              <a href={personal.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a>
              <a href="/THINU_UPADYA_CV_Updated.pdf" download><ArrowDown size={15} /> Resume</a>
            </motion.div>
          </div>

          <motion.div className="portrait-stage motion-content" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.12 }}>
            <div className="portrait-orbit orbit-one" />
            <div className="portrait-orbit orbit-two" />
            <div className="portrait-glow" />
            <div className="portrait-frame">
              <Image
                src="/images/thinu-profile.png"
                alt="Thinu Upadya"
                fill
                priority
                sizes="(max-width: 760px) 78vw, 42vw"
                className="portrait-image"
              />
              <div className="portrait-caption">
                <span>THINU UPADYA</span>
                <span>SOFTWARE ENGINEER · SRI LANKA</span>
              </div>
            </div>
            <div className="portrait-note note-top"><span>01</span> CODE × DESIGN</div>
            <div className="portrait-note note-bottom">BUILT WITH INTENTION <span>↗</span></div>
          </motion.div>
          <div className="hero-bottomline"><span>SCROLL TO EXPLORE</span><span>01 — 06</span></div>
        </section>

        <section className="about section-wrap section-space" id="about" aria-labelledby="about-title">
          <SectionHeading number="01" eyebrow="BEHIND THE CODE" title="A developer with a passion for building meaningful experiences." id="about-title" />
          <div className="about-grid">
            <motion.div className="about-intro motion-content" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveals}>
              <div className="about-identity">
                <div className="about-portrait">
                  <Image src="/images/thinu-profile.png" alt="" width={140} height={170} sizes="70px" />
                </div>
                <div>
                  <span className="card-index">THINU UPADYA / SOFTWARE ENGINEER</span>
                  <p className="large-copy">I work across the stack to turn complex ideas into clear, useful digital products.</p>
                </div>
              </div>
              <p className="body-copy">{personal.bio}</p>
              <a className="text-link" href="/THINU_UPADYA_CV_Updated.pdf" download>Download my resume <ArrowUpRight size={16} /></a>
            </motion.div>
            <div className="about-aside">
              <motion.article className="principle-card motion-content" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveals}>
                <span className="card-index">A / APPROACH</span>
                <Code2 size={20} aria-hidden="true" />
                <h3>Design with purpose.</h3>
                <p>Interfaces should make even complex workflows feel considered and easy to understand.</p>
              </motion.article>
              <motion.article className="principle-card principle-highlight motion-content" initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.1 }} variants={reveals}>
                <span className="card-index">B / PRACTICE</span>
                <BriefcaseBusiness size={20} aria-hidden="true" />
                <h3>Engineering with care.</h3>
                <p>I value dependable solutions, maintainable code, and the details that make products work well.</p>
              </motion.article>
            </div>
          </div>
        </section>

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
          <p className="skills-note">Tools and practices across professional work, projects, and study. Familiarity varies by technology.</p>
          <div className="skills-grid">
            {skillCategories.map((category, index) => {
              const Icon = skillIcons[category.icon];
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
                    <div className="tag-list">{category.core.map((tool) => <span key={tool}>{tool}</span>)}</div>
                    <span className="skill-list-label">Also explored</span>
                    <div className="tag-list">{category.more.map((tool) => <span key={tool}>{tool}</span>)}</div>
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
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
          <div className="project-grid">
            {filteredProjects.map((project, index) => (
              <motion.article className="project-card motion-content" key={project.id} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: index * 0.04 }} variants={reveals}>
                <Link className={`project-visual project-visual-${project.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} href={`/projects/${project.id}`} aria-label={`Read the ${project.title} case study`}>
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
                    {'link' in project && project.link && (
                      <a className="text-link" href={project.link} target="_blank" rel="noreferrer">
                        {'linkLabel' in project && project.linkLabel ? project.linkLabel : 'Visit project'} <ArrowUpRight size={16} />
                      </a>
                    )}
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
              <h2 id="contact-title">Have an idea?<br /><span className="accent-text">Let&apos;s make it real.</span></h2>
              <p>Whether you&apos;re building a product, looking for a developer, or exploring a collaboration, I&apos;d be happy to hear from you.</p>
              <a className="button button-primary contact-button" href={`mailto:${personal.email}?subject=${encodeURIComponent('Let’s build something together')}`}>
                <Mail size={17} /> {personal.email} <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="contact-socials">
              <a href={personal.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={16} /></a>
              <a href={personal.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={16} /></a>
              <a href="/THINU_UPADYA_CV_Updated.pdf" download>Resume <ArrowUpRight size={16} /></a>
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
