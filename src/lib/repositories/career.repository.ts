import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { portfolioData } from '@/lib/data';
import { builtInCvTemplates, coverLetterSchema, cvProfileSchema, jobApplicationSchema, type CvProfile } from '@/lib/schemas/career.schema';

const fallbackProfile = (): CvProfile => ({
  id: 'general-software-engineer',
  name: 'General Software Engineer',
  targetTitle: portfolioData.personal.role,
  summary: portfolioData.personal.bio,
  selectedExperience: portfolioData.experience.map((_, index) => index),
  selectedProjects: portfolioData.projects.slice(0, 5).map((project) => project.id),
  selectedSkills: Object.values(portfolioData.skills).flat().map((skill) => skill.name),
  selectedEducation: portfolioData.education.map((_, index) => index),
  selectedCertifications: portfolioData.certifications.map((_, index) => index),
  customSections: [],
  templateId: 'ats-classic',
  pageSize: 'A4',
  design: { primary: '#B5A2D8', text: '#202020', muted: '#666666', font: 'Arial', showPhoto: false, showIcons: false, showDividers: true },
  archived: false,
  isDefault: true,
  updatedAt: new Date().toISOString(),
});

export async function listCvProfiles(): Promise<CvProfile[]> {
  if (!process.env.FIREBASE_PROJECT_ID) return [fallbackProfile()];
  const snapshot = await getFirebaseAdmin().db.collection('cv_profiles').where('archived', '==', false).get();
  const profiles = snapshot.docs.map((doc) => cvProfileSchema.safeParse(doc.data())).filter((result) => result.success).map((result) => result.data);
  return profiles.length > 0 ? profiles : [fallbackProfile()];
}

export async function saveCvProfile(profile: CvProfile, uid: string) {
  const parsed = cvProfileSchema.parse(profile);
  await getFirebaseAdmin().db.collection('cv_profiles').doc(parsed.id).set({ ...parsed, updatedBy: uid }, { merge: true });
  return parsed;
}

export async function getCvTemplates() {
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
