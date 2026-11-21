import { getFirebaseAdmin } from '@/lib/firebase/admin';
import {
  defaultAnimationSettings,
  defaultDesignSettings,
  releaseSchema,
  type PortfolioRelease,
} from '@/lib/schemas/portfolio.schema';
import { portfolioData } from '@/lib/data';

const configRef = () => getFirebaseAdmin().db.collection('site_config').doc('active');

function canonicalUrl(value: string) {
  try { return new URL(value).href.replace(/\/$/, '').toLowerCase(); }
  catch { return value.trim().toLowerCase(); }
}

function normalizeProjects(release: PortfolioRelease): PortfolioRelease {
  const content = release.content as unknown as {
    projects: Array<Record<string, unknown>>;
  };
  const projects = content.projects.map((project, index) => {
    const candidates = Array.isArray(project.links)
      ? project.links.map((item) => {
        if (typeof item !== 'string') return item;
        try { return { label: new URL(item).hostname.replace(/^www\./, ''), url: item }; }
        catch { return { label: 'Visit project', url: item }; }
      })
      : [];
    const seenUrls = new Set<string>();
    const legacyLinks = candidates.filter((item) => {
      if (!item || typeof item !== 'object' || !('url' in item) || typeof item.url !== 'string') return true;
      const key = canonicalUrl(item.url);
      if (seenUrls.has(key)) return false;
      seenUrls.add(key);
      return true;
    });
    if (project.link && typeof project.link === 'string' && !seenUrls.has(canonicalUrl(project.link))) {
      legacyLinks.unshift({
        label: typeof project.linkLabel === 'string' ? project.linkLabel : 'Visit project',
        url: project.link,
      });
    }
    const highlights = Array.isArray(project.highlights)
      ? project.highlights.map((item) => typeof item === 'string' ? { text: item, icon: 'check' } : item)
      : [];
    return {
      ...project,
      links: legacyLinks,
      highlights,
      monogram: typeof project.monogram === 'string' ? project.monogram : project.id === 'ravanlink-autopilot' ? 'RL' : project.id === 'sisupay' ? 'S' : project.id === 'emc-grand-holdings' ? 'EMC' : project.id === 'event-management' ? 'RFID' : String(index + 1).padStart(2, '0'),
      artworkCaption: typeof project.artworkCaption === 'string' ? project.artworkCaption : 'PROJECT OVERVIEW · NO PUBLIC SCREENSHOT',
      order: typeof project.order === 'number' ? project.order : index,
      visible: typeof project.visible === 'boolean' ? project.visible : project.hidden !== true,
      period: typeof project.period === 'string' ? project.period : typeof project.year === 'string' ? project.year : '',
    };
  });
  return { ...release, content: { ...release.content, projects } as unknown as PortfolioRelease['content'] };
}

export async function getPublishedRelease(): Promise<PortfolioRelease | null> {
  if (!process.env.FIREBASE_PROJECT_ID) return null;

  const { db } = getFirebaseAdmin();
  const config = await configRef().get();
  const releaseId = config.data()?.activeReleaseId;
  if (!releaseId) return null;

  const release = await db.collection('portfolio_releases').doc(releaseId).get();
  if (!release.exists) return null;
  const parsed = releaseSchema.safeParse(release.data());
  return parsed.success ? normalizeProjects(parsed.data as unknown as PortfolioRelease) : null;
}

export async function getDraftRelease(): Promise<PortfolioRelease> {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return {
      schemaVersion: 1,
      content: portfolioData as unknown as PortfolioRelease['content'],
      design: defaultDesignSettings,
      animations: defaultAnimationSettings,
    };
  }

  const draft = await getFirebaseAdmin().db.collection('portfolio_drafts').doc('current').get();
  const parsed = releaseSchema.safeParse(draft.data());
  if (parsed.success) {
    const release = parsed.data as unknown as PortfolioRelease & { content: PortfolioRelease['content'] & { about?: { description?: string; paragraphs?: string[] } } };
    if (release.content.about?.description && (!release.content.about.paragraphs || release.content.about.paragraphs.length === 0)) {
      release.content.about.paragraphs = [release.content.about.description];
    }
    if (release.content.about) {
      delete (release.content.about as { description?: string }).description;
    }
    return normalizeProjects(release as PortfolioRelease);
  }
  return normalizeProjects({
    schemaVersion: 1,
    content: portfolioData as unknown as PortfolioRelease['content'],
    design: defaultDesignSettings,
    animations: defaultAnimationSettings,
  });
}

export async function saveDraft(release: PortfolioRelease, uid: string) {
  const normalized = normalizeProjects(release);
  const parsed = releaseSchema.parse(normalized) as unknown as PortfolioRelease;
  await getFirebaseAdmin().db.collection('portfolio_drafts').doc('current').set({
    ...parsed,
    updatedAt: new Date(),
    updatedBy: uid,
  }, { merge: true });
}

export async function publishDraft(release: PortfolioRelease, uid: string) {
  const normalized = normalizeProjects(release);
  const parsed = releaseSchema.parse(normalized) as unknown as PortfolioRelease;
  const { db } = getFirebaseAdmin();
  const releaseId = `release_${Date.now()}`;
  const releaseRef = db.collection('portfolio_releases').doc(releaseId);
  const pointer = configRef();
  const batch = db.batch();
  batch.set(releaseRef, { ...parsed, publishedAt: new Date(), publishedBy: uid, releaseId });
  batch.set(pointer, { activeReleaseId: releaseId, schemaVersion: parsed.schemaVersion, publishedAt: new Date() }, { merge: true });
  await batch.commit();
  return releaseId;
}
