import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { portfolioData } from '@/lib/data';
import {
  builtInCvTemplates,
  coverLetterSchema,
  cvProfileSchema,
  cvDocumentSchema,
  jobApplicationSchema,
  type CvProfile,
  type CvTemplate,
  type CvDocument,
  type CvVersion,
} from '@/lib/schemas/career.schema';

// In-memory store for local development and environments without live Firestore credentials
const globalCvStore = globalThis as unknown as {
  __cvProfiles?: Map<string, CvProfile>;
  __cvDocuments?: Map<string, CvDocument>;
  __uploadedTemplates?: Map<string, { id: string; name: string; filename: string; buffer: Buffer; uploadedAt: string }>;
};

if (!globalCvStore.__cvProfiles) {
  globalCvStore.__cvProfiles = new Map<string, CvProfile>();
}
if (!globalCvStore.__cvDocuments) {
  globalCvStore.__cvDocuments = new Map<string, CvDocument>();
}
if (!globalCvStore.__uploadedTemplates) {
  globalCvStore.__uploadedTemplates = new Map();
}

const memoryProfiles = globalCvStore.__cvProfiles;
const memoryDocuments = globalCvStore.__cvDocuments;
const memoryTemplates = globalCvStore.__uploadedTemplates;

export function buildDefaultCvProfile(id = 'general-software-engineer', name = 'General Software Engineer'): CvProfile {
  const allCategories = portfolioData.skillCategories.map((c) => c.title);
  const coreTools = portfolioData.skillCategories.flatMap((c) => c.coreTools);

  return {
    id,
    name,
    targetTitle: portfolioData.personal.role,
    summary: portfolioData.personal.bio,
    selectedExperience: portfolioData.experience.map((_, index) => index),
    selectedProjects: portfolioData.projects.slice(0, 5).map((project) => project.id),
    selectedSkills: coreTools,
    selectedEducation: portfolioData.education.map((_, index) => index),
    selectedCertifications: portfolioData.certifications.map((_, index) => index),
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
      company: '',
      role: portfolioData.personal.role,
      jobUrl: '',
      jobDescription: '',
      notes: '',
      keywords: [],
    },
    sections: [
      { id: 'summary', title: 'Professional Summary', enabled: true, order: 0 },
      { id: 'experience', title: 'Work Experience', enabled: true, order: 1 },
      { id: 'projects', title: 'Key Projects', enabled: true, order: 2 },
      { id: 'skills', title: 'Technical Skills', enabled: true, order: 3 },
      { id: 'education', title: 'Education', enabled: true, order: 4 },
      { id: 'certifications', title: 'Certifications', enabled: true, order: 5 },
      { id: 'links', title: 'Links & Profiles', enabled: true, order: 6 },
    ],
    overrides: {
      experience: {},
      projects: {},
      education: {},
      certifications: {},
      skills: {
        selectedCategories: allCategories,
        selectedSkills: coreTools,
        categoryLimits: {},
        customSkills: [],
      },
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
    isDefault: true,
    isPublic: true,
    publicPublishedAt: null,
    versions: [],
    versionCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function buildBlankCvProfile(id: string, name: string): CvProfile {
  return {
    id,
    name,
    targetTitle: '',
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
      company: '',
      role: '',
      jobUrl: '',
      jobDescription: '',
      notes: '',
      keywords: [],
    },
    sections: [
      { id: 'summary', title: 'Professional Summary', enabled: true, order: 0 },
      { id: 'experience', title: 'Work Experience', enabled: true, order: 1 },
      { id: 'projects', title: 'Key Projects', enabled: true, order: 2 },
      { id: 'skills', title: 'Technical Skills', enabled: true, order: 3 },
      { id: 'education', title: 'Education', enabled: true, order: 4 },
      { id: 'certifications', title: 'Certifications', enabled: true, order: 5 },
      { id: 'links', title: 'Links & Profiles', enabled: true, order: 6 },
    ],
    overrides: {
      experience: {},
      projects: {},
      education: {},
      certifications: {},
      skills: {
        selectedCategories: [],
        selectedSkills: [],
        categoryLimits: {},
        customSkills: [],
      },
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Seed memory if empty
if (memoryProfiles.size === 0) {
  const def = buildDefaultCvProfile();
  memoryProfiles.set(def.id, def);
}

export async function listCvProfiles(): Promise<CvProfile[]> {
  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      const snapshot = await getFirebaseAdmin().db.collection('cv_profiles').where('archived', '==', false).get();
      const profiles = snapshot.docs
        .map((doc) => cvProfileSchema.safeParse(doc.data()))
        .filter((result) => result.success)
        .map((result) => result.data);
      if (profiles.length > 0) return profiles;
    } catch {
      // fallback to memory
    }
  }
  return Array.from(memoryProfiles.values()).filter((p) => !p.archived);
}

export async function getCvProfileById(id: string): Promise<CvProfile | null> {
  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      const doc = await getFirebaseAdmin().db.collection('cv_profiles').doc(id).get();
      if (doc.exists) {
        const parsed = cvProfileSchema.safeParse(doc.data());
        if (parsed.success) return parsed.data;
      }
    } catch {
      // fallback to memory
    }
  }
  const mem = memoryProfiles.get(id);
  return mem && !mem.archived ? mem : null;
}

export async function saveCvProfile(profile: Partial<CvProfile> & { id: string }, uid: string): Promise<CvProfile> {
  const existing = await getCvProfileById(profile.id);
  const now = new Date().toISOString();

  // Create version snapshot if existing profile is modified
  let versions = profile.versions || existing?.versions || [];
  let versionCount = (existing?.versionCount || 1);

  if (existing) {
    versionCount += 1;
    const snapshotItem: CvVersion = {
      id: `v${versionCount}-${Date.now()}`,
      name: `Version ${versionCount - 1} snapshot`,
      createdAt: existing.updatedAt || now,
      createdBy: uid,
      note: 'Auto-saved before changes',
      snapshot: existing as unknown as Record<string, unknown>,
    };
    versions = [snapshotItem, ...versions].slice(0, 30); // retain last 30 snapshots
  }

  const merged = {
    ...(existing || buildDefaultCvProfile(profile.id, profile.name || 'Untitled CV')),
    ...profile,
    versions,
    versionCount,
    updatedAt: now,
  };

  const parsed = cvProfileSchema.parse(merged);

  memoryProfiles.set(parsed.id, parsed);

  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      await getFirebaseAdmin().db.collection('cv_profiles').doc(parsed.id).set({
        ...parsed,
        updatedBy: uid,
      }, { merge: true });
    } catch {
      // memory updated
    }
  }

  return parsed;
}

export async function deleteCvProfile(id: string): Promise<boolean> {
  const existing = await getCvProfileById(id);
  if (!existing) return false;

  existing.archived = true;
  existing.updatedAt = new Date().toISOString();
  memoryProfiles.set(id, existing);

  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      await getFirebaseAdmin().db.collection('cv_profiles').doc(id).update({ archived: true });
    } catch {
      // memory updated
    }
  }
  return true;
}

export async function duplicateCvProfile(sourceId: string, newName: string, uid: string): Promise<CvProfile | null> {
  const source = await getCvProfileById(sourceId);
  if (!source) return null;

  const newId = `${source.id}-copy-${Date.now().toString(36)}`;
  const copy: CvProfile = {
    ...source,
    id: newId,
    name: newName || `${source.name} (Copy)`,
    isDefault: false,
    isPublic: false,
    publicPublishedAt: null,
    versions: [],
    versionCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return saveCvProfile(copy, uid);
}

export async function setPublicCvProfile(id: string, uid: string): Promise<CvProfile | null> {
  const profiles = await listCvProfiles();
  let targetProfile: CvProfile | null = null;

  for (const p of profiles) {
    const isTarget = p.id === id;
    if (isTarget) {
      targetProfile = { ...p, isPublic: true, updatedAt: new Date().toISOString() };
      await saveCvProfile(targetProfile, uid);
    } else if (p.isPublic) {
      await saveCvProfile({ ...p, isPublic: false, updatedAt: new Date().toISOString() }, uid);
    }
  }

  return targetProfile;
}

export async function logCvActivity(type: string, detail: Record<string, unknown>, uid: string) {
  const item = {
    type,
    ...detail,
    uid,
    createdAt: new Date(),
  };

  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      await getFirebaseAdmin().db.collection('activity').add(item);
    } catch {
      // ignore
    }
  }
}

export async function recordExportedDocument(docData: Omit<CvDocument, 'id' | 'createdAt'>): Promise<CvDocument> {
  const doc: CvDocument = {
    ...docData,
    id: `doc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  const parsed = cvDocumentSchema.parse(doc);
  memoryDocuments.set(parsed.id, parsed);

  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      await getFirebaseAdmin().db.collection('cv_documents').doc(parsed.id).set(parsed);
    } catch {
      // memory stored
    }
  }

  return parsed;
}

export async function listExportedDocuments(): Promise<CvDocument[]> {
  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      const snapshot = await getFirebaseAdmin().db.collection('cv_documents').orderBy('createdAt', 'desc').limit(100).get();
      const docs = snapshot.docs
        .map((d) => cvDocumentSchema.safeParse(d.data()))
        .filter((r) => r.success)
        .map((r) => r.data);
      if (docs.length > 0) return docs;
    } catch {
      // fallback to memory
    }
  }
  return Array.from(memoryDocuments.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCvTemplates(): Promise<CvTemplate[]> {
  return builtInCvTemplates;
}

export function getCareerSource() {
  return portfolioData;
}

export async function listPrivateCollection<T>(name: string, schema: { safeParse: (value: unknown) => { success: boolean; data?: T } }) {
  if (!process.env.FIREBASE_PROJECT_ID) return [] as T[];
  const snapshot = await getFirebaseAdmin().db.collection(name).orderBy('updatedAt', 'desc').get();
  return snapshot.docs.map((doc) => schema.safeParse({ id: doc.id, ...doc.data() })).filter((result) => result.success).map((result) => result.data as T);
}

export const listCoverLetters = () => listPrivateCollection('cover_letters', coverLetterSchema);
export const listJobApplications = () => listPrivateCollection('job_applications', jobApplicationSchema);

export async function savePrivateDocument(name: string, value: Record<string, unknown>, uid: string) {
  await getFirebaseAdmin().db.collection(name).doc(String(value.id)).set({ ...value, updatedBy: uid, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function saveUploadedTemplate(id: string, name: string, filename: string, buffer: Buffer) {
  memoryTemplates.set(id, {
    id,
    name,
    filename,
    buffer,
    uploadedAt: new Date().toISOString(),
  });
}

export async function listUploadedTemplates() {
  return Array.from(memoryTemplates.values()).map(({ id, name, filename, uploadedAt }) => ({
    id,
    name,
    filename,
    uploadedAt,
  }));
}

export async function getUploadedTemplateBuffer(id: string): Promise<Buffer | null> {
  const item = memoryTemplates.get(id);
  return item ? item.buffer : null;
}

export async function deleteUploadedTemplate(id: string) {
  memoryTemplates.delete(id);
}
