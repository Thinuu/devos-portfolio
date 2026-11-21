'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, BriefcaseBusiness, Code2 } from 'lucide-react';
import type { PortfolioRelease } from '@/lib/schemas/portfolio.schema';

type AboutContent = {
  title?: string;
  intro?: string;
  paragraphs?: string[];
  highlights?: Array<{ label?: string; title: string; text?: string; description?: string; hidden?: boolean }>;
  portraitImage?: string;
  portraitAlt?: string;
  resumeLabel?: string;
  resumeLink?: string;
};

type AboutHighlight = NonNullable<AboutContent['highlights']>[number];

const defaultHighlights: AboutHighlight[] = [
  { label: 'A / APPROACH', title: 'Design with purpose.', text: 'Interfaces should make even complex workflows feel considered and easy to understand.' },
  { label: 'B / PRACTICE', title: 'Engineering with care.', text: 'I value dependable solutions, maintainable code, and the details that make products work well.' },
];

const reveals = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export default function AboutSection({
  about,
  personal,
  animated = true,
}: {
  about?: AboutContent;
  personal: PortfolioRelease['content']['personal'];
  animated?: boolean;
}) {
  const paragraphs = about?.paragraphs?.length ? about.paragraphs : [personal.bio];
  const highlights = (about?.highlights?.length ? about.highlights : defaultHighlights).filter((highlight) => !highlight.hidden);
  const motionProps = animated
    ? { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: { once: true }, variants: reveals }
    : { initial: false as const };

  return (
    <section className="about section-wrap section-space" id="about" aria-labelledby="about-title">
      <motion.div className="section-heading motion-content" {...motionProps}>
        <div className="section-kicker"><span>01</span><span className="section-kicker-line" /><span>BEHIND THE CODE</span></div>
        <h2 id="about-title">{about?.title || 'A developer with a passion for building meaningful experiences.'}</h2>
      </motion.div>
      <div className="about-grid">
        <motion.div className="about-intro motion-content" {...motionProps}>
          <div className="about-identity">
            <div className="about-portrait">
              <Image src={about?.portraitImage || '/images/thinu-profile.png'} alt={about?.portraitAlt || personal.name} width={140} height={170} sizes="70px" />
            </div>
            <div>
              <span className="card-index">{personal.name.toUpperCase()} / {personal.role.toUpperCase()}</span>
              <p className="large-copy">{about?.intro || 'I work across the stack to turn complex ideas into clear, useful digital products.'}</p>
            </div>
          </div>
          <div className="body-copy">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <a className="text-link" href={about?.resumeLink || '/THINU_UPADYA_CV_Updated.pdf'} download>
            {about?.resumeLabel || 'Download my resume'} <ArrowUpRight size={16} />
          </a>
        </motion.div>
        <div className="about-aside">
          {highlights.map((highlight, index) => (
            <motion.article className={`principle-card motion-content${index === 1 ? ' principle-highlight' : ''}`} key={`${highlight.label || highlight.title}-${index}`} {...motionProps} transition={{ delay: index * 0.1 }}>
              <span className="card-index">{highlight.label || `${String.fromCharCode(65 + index)} / HIGHLIGHT`}</span>
              {index % 2 === 0 ? <Code2 size={20} aria-hidden="true" /> : <BriefcaseBusiness size={20} aria-hidden="true" />}
              <h3>{highlight.title}</h3>
              <p>{highlight.text || highlight.description || ''}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
