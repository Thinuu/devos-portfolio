import { z } from 'zod';
import type { portfolioData } from '@/lib/data';

const url = z.string().url();

export const personalSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  tagline: z.string().max(500),
  bio: z.string().max(4000),
  location: z.string().max(120),
  timezone: z.string().max(80),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9][0-9\s().-]{6,39}$/, 'Enter a valid phone number'),
  github: url,
  linkedin: url,
  available: z.boolean(),
  responseTime: z.string().max(80),
});

export const richHeadingSchema = z.object({
  text: z.string().max(500),
  accentWords: z.array(z.string().max(80)).max(30).default([]),
});

export const sectionChromeSchema = z.object({
  number: z.string().max(10).optional(),
  eyebrow: z.string().max(120).optional(),
  heading: richHeadingSchema.optional(),
  intro: z.string().max(1000).optional(),
  visible: z.boolean().default(true),
});

export const navigationSchema = z.object({
  items: z.array(z.object({
    label: z.string().min(1).max(80),
    anchor: z.string().min(1).max(120),
    order: z.number().int().min(0),
    visible: z.boolean(),
  })).max(30).default([]),
  talkLabel: z.string().max(80).optional(),
  talkLink: z.string().max(500).optional(),
  downloadCvLabel: z.string().max(80).optional(),
  downloadCvTarget: z.string().max(500).optional(),
});

export const footerSchema = z.object({
  tagline: z.string().max(500).optional(),
  yearMode: z.enum(['current', 'fixed']).default('current'),
  fixedYear: z.string().max(10).optional(),
  backToTopLabel: z.string().max(80).optional(),
});

export const projectSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(160),
  shortDesc: z.string().max(500),
  fullDesc: z.string().max(5000),
  stack: z.array(z.string().max(80)).max(30),
  type: z.string().max(120),
  category: z.string().max(80),
  additionalCategories: z.array(z.string().max(80)).max(10).optional(),
  status: z.string().max(80),
  year: z.string().max(20),
  employer: z.string().max(160),
  role: z.string().max(1000).optional(),
  challenge: z.string().max(2000).optional(),
  solution: z.string().max(2000).optional(),
  link: url.optional(),
  linkLabel: z.string().max(80).optional(),
  links: z.array(z.union([
    z.string().url(),
    z.object({
      label: z.string().min(1).max(80),
      url,
      icon: z.string().max(40).optional(),
    }),
  ])).max(20).optional(),
  highlightsTitle: z.string().max(120).optional(),
  highlights: z.array(z.union([
    z.string().max(500),
    z.object({
      text: z.string().min(1).max(500),
      icon: z.string().max(40).optional(),
    }),
  ])).max(30).optional(),
  architecture: z.string().max(3000).optional(),
  scopeNotice: z.string().max(500).optional(),
  collaborationNote: z.string().max(500).optional(),
  thumbnail: z.string().max(500).optional(),
  thumbnailAlt: z.string().max(160).optional(),
  coverImage: z.string().max(500).optional(),
  coverImageAlt: z.string().max(160).optional(),
  monogram: z.string().max(12).optional(),
  artworkCaption: z.string().max(200).optional(),
  workflow: z.array(z.union([
    z.string().max(200),
    z.object({
      id: z.string().min(1).optional(),
      label: z.string().min(1).max(160),
      description: z.string().max(500).optional(),
    }),
  ])).max(20).optional(),
  projectStatusNote: z.string().max(500).optional(),
  techStackNote: z.string().max(500).optional(),
  period: z.string().max(40).optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  hidden: z.boolean().optional(),
}).superRefine((project, ctx) => {
  if (project.thumbnail && !project.thumbnailAlt?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['thumbnailAlt'], message: 'Alt text is required when a thumbnail is set.' });
  }
  if (project.coverImage && !project.coverImageAlt?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['coverImageAlt'], message: 'Alt text is required when a cover image is set.' });
  }
});

const heroLink = z.string().max(500).refine((value) => !value || value.startsWith('#') || value.startsWith('/') || /^https?:\/\//i.test(value), 'Use a web URL, local path, or section anchor.');

export const portfolioSchema = z.object({
  personal: personalSchema,
  navigation: navigationSchema.optional(),
  footer: footerSchema.optional(),
  sections: z.record(z.string(), sectionChromeSchema).optional(),
  hero: z.object({
    eyebrow: z.string().max(200),
    heading: z.string().max(500),
    description: z.string().max(2000),
    supporting: z.string().max(2000),
    profileImage: z.string().max(500),
    profileImageAlt: z.string().max(160).optional(),
    primaryCtaLabel: z.string().max(80).optional(),
    primaryCtaLink: heroLink.optional(),
    secondaryCtaLabel: z.string().max(80).optional(),
    secondaryCtaLink: heroLink.optional(),
    socialLinks: z.array(z.object({ label: z.string().min(1).max(80), url: heroLink, icon: z.string().max(40).optional() })).max(12).optional(),
    portraitCaption: z.string().max(240).optional(),
    floatingLabelTop: z.string().max(120).optional(),
    floatingLabelBottom: z.string().max(120).optional(),
    scrollHintText: z.string().max(120).optional(),
    layout: z.enum(['split', 'centered', 'terminal', 'minimal']).optional(),
  }).superRefine((hero, ctx) => {
    if (hero.profileImage && !hero.profileImageAlt?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['profileImageAlt'], message: 'Alt text is required when a hero image is set.' });
    }
  }).optional(),
  about: z.object({
    title: z.string().max(200),
    intro: z.string().max(1000).optional(),
    paragraphs: z.array(z.string().max(2000)).max(20).optional(),
    highlights: z.array(z.object({
      title: z.string().max(160),
      description: z.string().max(1000),
      hidden: z.boolean().optional(),
    })).max(20).optional(),
    portraitImage: z.string().max(500).optional(),
    portraitAlt: z.string().max(160).optional(),
  }).optional(),
  tools: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(120),
    description: z.string().max(500),
    category: z.string().max(120),
    hidden: z.boolean().optional(),
  })).optional(),
  workflow: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1).max(120),
    description: z.string().max(1000),
    tools: z.array(z.string().max(80)).max(30),
    hidden: z.boolean().optional(),
  })).optional(),
  terminal: z.object({
    welcome: z.string().max(500),
    prompt: z.string().max(100),
    help: z.array(z.string().max(200)).max(100),
    commands: z.array(z.object({
      command: z.string().min(1).max(40),
      output: z.array(z.string().max(500)).max(100),
    })).optional(),
  }).optional(),
  contact: z.object({
    title: z.string().max(200),
    description: z.string().max(1000),
    buttonLabel: z.string().max(80).optional(),
    links: z.array(z.object({
      label: z.string().min(1).max(80),
      url: z.string().max(500),
      icon: z.string().max(40),
      hidden: z.boolean().optional(),
    })).max(20).optional(),
  }).optional(),
  stats: z.array(z.object({
    label: z.string().max(80),
    value: z.string().max(40),
    icon: z.string().max(40),
  })).max(20),
  timeline: z.array(z.object({
    year: z.string().max(20),
    title: z.string().min(1).max(160),
    desc: z.string().max(1000).optional(),
    description: z.string().max(1000).optional(),
    type: z.enum(['education', 'work', 'promotion', 'achievement']),
    order: z.number().int().min(0).optional(),
    visible: z.boolean().optional(),
  }).passthrough()).max(50),
  projects: z.array(projectSchema).max(100),
  skills: z.unknown(),
  skillCategories: z.array(z.object({
    title: z.string().min(1).max(160),
    description: z.string().max(1000).optional(),
    icon: z.string().max(40).optional(),
    core: z.array(z.string().max(100)).max(100).optional(),
    coreTools: z.array(z.string().max(100)).max(100).default([]),
    more: z.array(z.string().max(100)).max(100).optional(),
    alsoExplored: z.array(z.string().max(100)).max(100).default([]),
    order: z.number().int().min(0).default(0),
    visible: z.boolean().default(true),
  }).passthrough()).max(50),
  familiarityNote: z.string().max(500).optional(),
  experience: z.array(z.object({
    role: z.string().min(1).max(160),
    company: z.string().min(1).max(160),
    parent: z.string().max(160).optional(),
    period: z.string().max(80).optional(),
    type: z.string().max(80),
    typeBadge: z.string().max(80).optional(),
    commits: z.array(z.string().max(500)).max(30).optional(),
    order: z.number().int().min(0).optional(),
    visible: z.boolean().optional(),
  }).passthrough()).max(50),
  education: z.array(z.object({
    degree: z.string().min(1).max(160),
    institution: z.string().min(1).max(160),
    period: z.string().max(80).optional(),
    expected: z.string().max(20).optional(),
    year: z.string().max(20).optional(),
    statusLabel: z.string().max(80).optional(),
    statusYear: z.string().max(20).optional(),
    badge: z.string().max(80).optional(),
    note: z.string().max(80).optional(),
    type: z.string().max(80).optional(),
    order: z.number().int().min(0).optional(),
    visible: z.boolean().optional(),
  }).passthrough()).max(50),
  certifications: z.array(z.object({
    name: z.string().min(1).max(160),
    issuer: z.string().max(160).optional(),
    year: z.string().max(20).optional(),
    credentialUrl: z.string().url().optional().or(z.literal('')),
    order: z.number().int().min(0).optional(),
    visible: z.boolean().optional(),
  }).passthrough()).max(100).optional(),
}).passthrough();

export type PortfolioContent = typeof portfolioData;

export const designSettingsSchema = z.object({
  theme: z.enum(['current-charcoal-lavender', 'midnight-violet', 'electric-blue', 'midnight-cyan', 'emerald-studio', 'warm-minimal', 'retro-green']),
  colors: z.object({
    background: z.string().regex(/^#[0-9a-f]{6}$/i),
    surface: z.string().regex(/^#[0-9a-f]{6}$/i),
    border: z.string().regex(/^#[0-9a-f]{6}$/i),
    primary: z.string().regex(/^#[0-9a-f]{6}$/i),
    secondary: z.string().regex(/^#[0-9a-f]{6}$/i),
    text: z.string().regex(/^#[0-9a-f]{6}$/i),
    muted: z.string().regex(/^#[0-9a-f]{6}$/i),
  }),
  maxWidth: z.number().min(640).max(1800),
  sectionSpacing: z.number().min(16).max(240),
  radius: z.number().min(0).max(40),
  background: z.enum(['solid', 'gradient', 'grid', 'retro']),
}).strict();

export const animationSettingsSchema = z.object({
  enabled: z.boolean(),
  speed: z.number().min(0.1).max(3),
  reducedMotion: z.boolean(),
  entrance: z.enum(['fade', 'slide-up', 'scale', 'blur']),
  hover: z.enum(['none', 'lift', 'scale', 'glow']),
}).strict();

export const releaseSchema = z.object({
  schemaVersion: z.number().int().positive(),
  content: portfolioSchema,
  design: designSettingsSchema,
  animations: animationSettingsSchema,
  publishedAt: z.any().optional(),
  publishedBy: z.string().optional(),
  releaseId: z.string().optional(),
}).passthrough();

export type DesignSettings = z.infer<typeof designSettingsSchema>;
export type AnimationSettings = z.infer<typeof animationSettingsSchema>;
export type PortfolioRelease = {
  schemaVersion: number;
  content: PortfolioContent;
  design: DesignSettings;
  animations: AnimationSettings;
  publishedAt?: unknown;
  publishedBy?: string;
  releaseId?: string;
};

export const defaultDesignSettings: DesignSettings = {
  theme: 'current-charcoal-lavender',
  colors: {
    background: '#080808',
    surface: '#141414',
    border: '#292929',
    primary: '#B5A2D8',
    secondary: '#D2C5E8',
    text: '#F5F5F5',
    muted: '#777777',
  },
  maxWidth: 1280,
  sectionSpacing: 96,
  radius: 16,
  background: 'grid',
};

export const defaultAnimationSettings: AnimationSettings = {
  enabled: true,
  speed: 1,
  reducedMotion: false,
  entrance: 'fade',
  hover: 'lift',
};
