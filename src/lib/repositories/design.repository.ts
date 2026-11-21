import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { lavenderCharcoalConfig } from '@/lib/design/defaults';
import { designConfigSchema, type DesignConfig } from '@/lib/schemas/design.schema';

const draftRef = () => getFirebaseAdmin().db.collection('site_config').doc('design_draft');
const publishedRef = () => getFirebaseAdmin().db.collection('site_config').doc('design_published');

export async function getPublishedDesign(): Promise<DesignConfig> {
  if (!process.env.FIREBASE_PROJECT_ID) return lavenderCharcoalConfig;
  const snapshot = await publishedRef().get();
  const parsed = designConfigSchema.safeParse(snapshot.data()?.config ?? snapshot.data());
  return parsed.success ? parsed.data : lavenderCharcoalConfig;
}

export async function getDraftDesign(): Promise<DesignConfig> {
  if (!process.env.FIREBASE_PROJECT_ID) return lavenderCharcoalConfig;
  const snapshot = await draftRef().get();
  const parsed = designConfigSchema.safeParse(snapshot.data()?.config ?? snapshot.data());
  return parsed.success ? parsed.data : lavenderCharcoalConfig;
}

export async function saveDraftDesign(config: DesignConfig, uid: string) {
  const parsed = designConfigSchema.parse({ ...config, updatedAt: new Date().toISOString() });
  await draftRef().set({ config: parsed, updatedAt: new Date(), updatedBy: uid }, { merge: true });
  return parsed;
}

export async function publishDraftDesign(config: DesignConfig, uid: string) {
  const parsed = designConfigSchema.parse({ ...config, updatedAt: new Date().toISOString() });
  const db = getFirebaseAdmin().db;
  const batch = db.batch();
  batch.set(publishedRef(), { config: parsed, publishedAt: new Date(), publishedBy: uid }, { merge: true });
  batch.set(draftRef(), { config: parsed, updatedAt: new Date(), updatedBy: uid }, { merge: true });
  await batch.commit();
  return parsed;
}
