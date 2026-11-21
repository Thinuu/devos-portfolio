'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, Download, Github, Linkedin, type LucideIcon } from 'lucide-react';
import type { PortfolioRelease } from '@/lib/schemas/portfolio.schema';

const reveals = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const socialIcons: Record<string, LucideIcon> = { github: Github, linkedin: Linkedin, resume: Download, download: Download };

function renderHeading(text: string) {
  return text.split(/(\[[^\]]+\])/g).map((part, index) => part.startsWith('[') && part.endsWith(']')
    ? <span className="accent-text" key={index}>{part.slice(1, -1)}</span>
    : part);
}

export default function HeroSection({
  hero,
  personal,
  animated = true,
}: {
  hero: PortfolioRelease['content']['hero'];
  personal: PortfolioRelease['content']['personal'];
  animated?: boolean;
}) {
  const caption = (hero?.portraitCaption || 'THINU UPADYA | SOFTWARE ENGINEER | SRI LANKA').split('|');
  const socialLinks = hero?.socialLinks?.length ? hero.socialLinks : [
    { label: 'GitHub', url: personal.github, icon: 'Github' },
    { label: 'LinkedIn', url: personal.linkedin, icon: 'Linkedin' },
    { label: 'Resume', url: '/THINU_UPADYA_CV_Updated.pdf', icon: 'Download' },
  ];
  const motionProps = animated ? { initial: 'hidden' as const, animate: 'visible' as const, variants: reveals } : { initial: false as const };

  return (
    <section className={`hero section-wrap layout-${hero?.layout || 'split'}`} id="home" aria-labelledby="hero-title">
      <div className="hero-copy">
        <motion.p className="eyebrow hero-eyebrow motion-content" {...motionProps}>
          <span className="status-dot" /> {hero?.eyebrow || 'FULL-STACK DEVELOPER / SOFTWARE ENGINEER'}
        </motion.p>
        <motion.h1 className="motion-content" id="hero-title" {...motionProps} transition={{ delay: 0.08 }}>
          {renderHeading(hero?.heading || 'Engineering [ideas.] Crafting [experiences.]')}
        </motion.h1>
        <motion.p className="hero-description motion-content" {...motionProps} transition={{ delay: 0.16 }}>
          {hero?.description || `Hi, I'm ${personal.name} — a ${personal.role} focused on transforming complex ideas into intuitive, scalable, and meaningful digital products.`}
        </motion.p>
        <motion.p className="hero-supporting motion-content" {...motionProps} transition={{ delay: 0.2 }}>
          {hero?.supporting || 'I build modern web applications and digital experiences that bring together clean design, reliable engineering, and practical business value.'}
        </motion.p>
        <motion.div className="hero-actions motion-content" {...motionProps} transition={{ delay: 0.24 }}>
          <a className="button button-primary" href={hero?.primaryCtaLink || '#work'}>{hero?.primaryCtaLabel || 'Explore my work'} <ArrowUpRight size={17} /></a>
          <a className="button button-secondary" href={hero?.secondaryCtaLink || '#contact'}>{hero?.secondaryCtaLabel || "Let's connect"} <ArrowRight size={16} /></a>
        </motion.div>
        <motion.div className="social-row motion-content" {...motionProps} transition={{ delay: 0.32 }}>
          {socialLinks.map((link, index) => {
            const Icon = socialIcons[(link.icon || link.label).toLowerCase()] || ArrowUpRight;
            return <a href={link.url} key={`${link.label}-${index}`} target={link.url.startsWith('http') ? '_blank' : undefined} rel={link.url.startsWith('http') ? 'noreferrer' : undefined} download={link.url.toLowerCase().endsWith('.pdf') || undefined}><Icon size={16} /> {link.label}</a>;
          })}
        </motion.div>
      </div>

      <motion.div className="portrait-stage motion-content" initial={animated ? { opacity: 0, scale: 0.96 } : false} animate={animated ? { opacity: 1, scale: 1 } : undefined} transition={{ duration: 0.8, delay: 0.12 }}>
        <div className="portrait-orbit orbit-one" />
        <div className="portrait-orbit orbit-two" />
        <div className="portrait-glow" />
        <div className="portrait-frame">
          <Image src={hero?.profileImage || '/images/thinu-profile.png'} alt={hero?.profileImageAlt || personal.name} fill priority sizes="(max-width: 760px) 78vw, 42vw" className="portrait-image" />
          <div className="portrait-caption"><span>{caption[0]?.trim()}</span><span>{caption[1]?.trim() || personal.role}</span></div>
        </div>
        <div className="portrait-note note-top">{hero?.floatingLabelTop || '01 CODE x DESIGN'}</div>
        <div className="portrait-note note-bottom">{hero?.floatingLabelBottom || 'BUILT WITH INTENTION'}</div>
      </motion.div>
      <div className="hero-bottomline"><span>{hero?.scrollHintText || 'SCROLL TO EXPLORE'}</span><span>01 - 06</span></div>
    </section>
  );
}
