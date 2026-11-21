import { z } from 'zod';

const link = z.string().url();

export const cvTemplateSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  atsCompatible: z.boolean(),
  layout: z.enum(['single-column', 'two-column']),
});

export const cvSectionConfigSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  enabled: z.boolean(),
  order: z.number().int(),
});

export const cvItemOverrideSchema = z.object({
  title: z.string().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  period: z.string().optional(),
  location: z.string().optional(),
  shortDesc: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  tech: z.array(z.string()).optional(),
  link: z.string().optional(),
  degree: z.string().optional(),
  institution: z.string().optional(),
  name: z.string().optional(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  excluded: z.boolean().optional(),
  order: z.number().optional(),
});

export const cvContactSchema = z.object({
  showEmail: z.boolean().default(true),
  showPhone: z.boolean().default(true),
  showLocation: z.boolean().default(true),
  showGithub: z.boolean().default(true),
  showLinkedin: z.boolean().default(true),
  showWebsite: z.boolean().default(true),
  customEmail: z.string().optional(),
  customPhone: z.string().optional(),
  customLocation: z.string().optional(),
  customGithub: z.string().optional(),
  customLinkedin: z.string().optional(),
  customWebsite: z.string().optional(),
});

export const cvJobTargetSchema = z.object({
  company: z.string().default(''),
  role: z.string().default(''),
  jobUrl: z.string().default(''),
  jobDescription: z.string().default(''),
  notes: z.string().default(''),
  keywords: z.array(z.string()).default([]),
});

export const cvDesignSchema = z.object({
  primary: z.string().default('#b5a2d8'),
  text: z.string().default('#1a1a1a'),
  muted: z.string().default('#555555'),
  font: z.string().default('Space Grotesk & Inter'),
  fontSize: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
  lineSpacing: z.enum(['tight', 'normal', 'relaxed']).default('normal'),
  margins: z.enum(['compact', 'normal', 'spacious']).default('normal'),
  bulletStyle: z.enum(['disc', 'circle', 'square', 'dash']).default('disc'),
  dateFormat: z.enum(['MM/YYYY', 'MMM YYYY', 'YYYY']).default('MMM YYYY'),
  showPhoto: z.boolean().default(false),
  showIcons: z.boolean().default(true),
  showDividers: z.boolean().default(true),
});

export const cvVersionSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  createdBy: z.string().optional(),
  note: z.string().optional(),
  snapshot: z.record(z.string(), z.unknown()),
});

export const cvProfileSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  targetTitle: z.string().max(120),
  summary: z.string().max(4000),
  selectedExperience: z.array(z.number().int().nonnegative()).default([]),
  selectedProjects: z.array(z.string().max(120)).default([]),
  selectedSkills: z.array(z.string().max(120)).default([]),
  selectedEducation: z.array(z.number().int().nonnegative()).default([]),
  selectedCertifications: z.array(z.number().int().nonnegative()).default([]),
  customSections: z.array(z.object({
    id: z.string().optional(),
    title: z.string().max(100),
    description: z.string().max(2000).optional(),
    bullets: z.array(z.string().max(500)).max(30),
  })).default([]),
  templateId: z.string().regex(/^[a-z0-9-]+$/).default('ats-classic'),
  pageSize: z.enum(['A4', 'LETTER']).default('A4'),
  language: z.string().default('en'),
  contact: cvContactSchema.default({
    showEmail: true,
    showPhone: true,
    showLocation: true,
    showGithub: true,
    showLinkedin: true,
    showWebsite: true,
  }),
  jobTarget: cvJobTargetSchema.default({
    company: '',
    role: '',
    jobUrl: '',
    jobDescription: '',
    notes: '',
    keywords: [],
  }),
  sections: z.array(cvSectionConfigSchema).default([
    { id: 'summary', title: 'Professional Summary', enabled: true, order: 0 },
    { id: 'experience', title: 'Work Experience', enabled: true, order: 1 },
    { id: 'projects', title: 'Key Projects', enabled: true, order: 2 },
    { id: 'skills', title: 'Technical Skills', enabled: true, order: 3 },
    { id: 'education', title: 'Education', enabled: true, order: 4 },
    { id: 'certifications', title: 'Certifications', enabled: true, order: 5 },
    { id: 'links', title: 'Links & Profiles', enabled: true, order: 6 },
  ]),
  overrides: z.object({
    experience: z.record(z.string(), cvItemOverrideSchema).default({}),
    projects: z.record(z.string(), cvItemOverrideSchema).default({}),
    education: z.record(z.string(), cvItemOverrideSchema).default({}),
    certifications: z.record(z.string(), cvItemOverrideSchema).default({}),
    skills: z.object({
      selectedCategories: z.array(z.string()).default([]),
      selectedSkills: z.array(z.string()).default([]),
      categoryLimits: z.record(z.string(), z.number()).default({}),
      customSkills: z.array(z.object({ name: z.string(), category: z.string().optional() })).default([]),
    }).default({ selectedCategories: [], selectedSkills: [], categoryLimits: {}, customSkills: [] }),
  }).default({ experience: {}, projects: {}, education: {}, certifications: {}, skills: { selectedCategories: [], selectedSkills: [], categoryLimits: {}, customSkills: [] } }),
  design: cvDesignSchema.default({
    primary: '#b5a2d8',
    text: '#1a1a1a',
    muted: '#555555',
    font: 'Space Grotesk & Inter',
    fontSize: 'normal',
    lineSpacing: 'normal',
    margins: 'normal',
    bulletStyle: 'disc',
    dateFormat: 'MMM YYYY',
    showPhoto: false,
    showIcons: true,
    showDividers: true,
  }),
  archived: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  publicPublishedAt: z.string().nullable().optional(),
  versions: z.array(cvVersionSchema).default([]),
  versionCount: z.number().int().default(1),
  createdAt: z.string().optional(),
  updatedAt: z.string(),
});

export const cvDocumentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  cvId: z.string(),
  cvName: z.string(),
  versionName: z.string().optional(),
  templateId: z.string(),
  format: z.enum(['pdf', 'docx']),
  sizeBytes: z.number().optional(),
  downloadUrl: z.string().optional(),
  createdAt: z.string(),
  createdBy: z.string().optional(),
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
export type CvSectionConfig = z.infer<typeof cvSectionConfigSchema>;
export type CvItemOverride = z.infer<typeof cvItemOverrideSchema>;
export type CvContact = z.infer<typeof cvContactSchema>;
export type CvJobTarget = z.infer<typeof cvJobTargetSchema>;
export type CvDesign = z.infer<typeof cvDesignSchema>;
export type CvVersion = z.infer<typeof cvVersionSchema>;
export type CvDocument = z.infer<typeof cvDocumentSchema>;

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
