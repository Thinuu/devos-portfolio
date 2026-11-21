import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { CvProfile } from '@/lib/schemas/career.schema';

const CV_DIR = join(process.cwd(), 'data', 'cv');

export async function ensureCvDir() {
  if (!existsSync(CV_DIR)) await mkdir(CV_DIR, { recursive: true });
}

export async function listCvProfiles(): Promise<CvProfile[]> {
  await ensureCvDir();
  const files = await readdir(CV_DIR);
  const profiles: CvProfile[] = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = await readFile(join(CV_DIR, file), 'utf8');
      profiles.push(JSON.parse(raw) as CvProfile);
    } catch {
      // skip malformed files
    }
  }
  return profiles;
}

export async function createCvProfile(opts: {
  name: string;
  mode: 'portfolio' | 'blank';
  targetTitle?: string;
  company?: string;
}): Promise<CvProfile> {
  await ensureCvDir();
  const id = uuidv4().replace(/-/g, '').slice(0, 24); // must match /^[a-z0-9-]+$/
  const now = new Date().toISOString();

  const profile: CvProfile = {
    id,
    name: opts.name,
    targetTitle: opts.targetTitle ?? '',
    summary: '',
    selectedExperience: [],
    selectedProjects: [],
    selectedSkills: [],
    selectedEducation: [],
    selectedCertifications: [],
    customSections: [],
    templateId: 'ats-classic',
    pageSize: 'A4',
    language: 'en',
    contact: {
      showEmail: true,
      showPhone: true,
      showLocation: true,
      showGithub: true,
      showLinkedin: true,
      showWebsite: true,
    },
    jobTarget: {
      company: opts.company ?? '',
      role: opts.targetTitle ?? '',
      jobUrl: '',
      jobDescription: '',
      notes: '',
      keywords: [],
    },
    sections: [
      { id: 'summary',          title: 'Professional Summary', enabled: true, order: 0 },
      { id: 'experience',       title: 'Work Experience',      enabled: true, order: 1 },
      { id: 'projects',         title: 'Key Projects',         enabled: true, order: 2 },
      { id: 'skills',           title: 'Technical Skills',     enabled: true, order: 3 },
      { id: 'education',        title: 'Education',            enabled: true, order: 4 },
      { id: 'certifications',   title: 'Certifications',       enabled: true, order: 5 },
      { id: 'links',            title: 'Links & Profiles',     enabled: true, order: 6 },
    ],
    overrides: {
      experience: {},
      projects: {},
      education: {},
      certifications: {},
      skills: { selectedCategories: [], selectedSkills: [], categoryLimits: {}, customSkills: [] },
    },
    design: {
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
    },
    archived: false,
    isDefault: false,
    isPublic: false,
    publicPublishedAt: null,
    versions: [],
    versionCount: 1,
    createdAt: now,
    updatedAt: now,
  };

  await writeFile(join(CV_DIR, `${id}.json`), JSON.stringify(profile, null, 2));
  return profile;
}
