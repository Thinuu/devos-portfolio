import { z } from 'zod';

const link = z.string().url();

export const cvTemplateSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  atsCompatible: z.boolean(),
  layout: z.enum(['single-column', 'two-column']),
});

export const cvProfileSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  targetTitle: z.string().max(120),
  summary: z.string().max(3000),
  selectedExperience: z.array(z.number().int().nonnegative()).max(50),
  selectedProjects: z.array(z.string().max(120)).max(100),
  selectedSkills: z.array(z.string().max(120)).max(200),
  selectedEducation: z.array(z.number().int().nonnegative()).max(50),
  selectedCertifications: z.array(z.number().int().nonnegative()).max(50),
  customSections: z.array(z.object({
    title: z.string().max(100),
    description: z.string().max(2000).optional(),
    bullets: z.array(z.string().max(500)).max(30),
  })).max(30),
  templateId: z.string().regex(/^[a-z0-9-]+$/),
  pageSize: z.enum(['A4', 'LETTER']),
  design: z.object({
    primary: z.string().regex(/^#[0-9a-f]{6}$/i),
    text: z.string().regex(/^#[0-9a-f]{6}$/i),
    muted: z.string().regex(/^#[0-9a-f]{6}$/i),
    font: z.enum(['Arial', 'Calibri', 'Georgia', 'Inter', 'Times New Roman']),
    showPhoto: z.boolean(),
    showIcons: z.boolean(),
    showDividers: z.boolean(),
  }),
  archived: z.boolean(),
  isDefault: z.boolean(),
  updatedAt: z.string(),
});

export const coverLetterSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  company: z.string().max(160),
  jobTitle: z.string().max(160),
  recipient: z.string().max(160),
  body: z.string().max(10000),
  cvProfileId: z.string().max(120).optional(),
  updatedAt: z.string(),
});

export const jobApplicationSchema = z.object({
  id: z.string(),
  company: z.string().min(1).max(160),
  jobTitle: z.string().min(1).max(160),
  jobUrl: link.optional(),
  location: z.string().max(160),
  status: z.enum(['Interested', 'Preparing', 'Applied', 'Screening', 'Interview', 'Technical Assessment', 'Offer', 'Rejected', 'Withdrawn']),
  applicationDate: z.string().max(40),
  followUpDate: z.string().max(40),
  notes: z.string().max(5000),
  cvProfileId: z.string().max(120).optional(),
});

export type CvProfile = z.infer<typeof cvProfileSchema>;
export type CvTemplate = z.infer<typeof cvTemplateSchema>;

export const builtInCvTemplates: CvTemplate[] = [
  { id: 'ats-classic', name: 'ATS Classic', description: 'Clean single-column structure for conventional applications.', atsCompatible: true, layout: 'single-column' },
  { id: 'modern-professional', name: 'Modern Professional', description: 'Balanced typography with a restrained accent color.', atsCompatible: true, layout: 'single-column' },
  { id: 'software-engineer', name: 'Software Engineer', description: 'Technical layout prioritising skills, projects, and experience.', atsCompatible: true, layout: 'single-column' },
  { id: 'full-stack-developer', name: 'Full Stack Developer', description: 'Balanced experience and technology presentation.', atsCompatible: true, layout: 'single-column' },
  { id: 'minimal-elegant', name: 'Minimal Elegant', description: 'Minimal spacing and clear hierarchy.', atsCompatible: true, layout: 'single-column' },
  { id: 'compact-one-page', name: 'Compact One-Page', description: 'Dense layout for concise applications.', atsCompatible: true, layout: 'single-column' },
  { id: 'executive-professional', name: 'Executive Professional', description: 'Formal, structured presentation.', atsCompatible: true, layout: 'single-column' },
  { id: 'modern-two-column', name: 'Modern Two-Column', description: 'Visual two-column design for non-ATS applications.', atsCompatible: false, layout: 'two-column' },
];
