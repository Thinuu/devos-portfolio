import Link from 'next/link';
import { getDraftRelease, getPublishedRelease } from '@/lib/repositories/portfolio.repository';

export default async function PublishingPage() {
  const [draft, published] = await Promise.all([getDraftRelease(), getPublishedRelease()]);
  const draftChanged = !published || JSON.stringify(draft.content) !== JSON.stringify(published.content);

  return (
    <><header className="admin-header"><div><p className="admin-eyebrow">Publishing</p><h1>Publishing &amp; versions</h1></div></header>
      <nav className="cms-tabs" aria-label="Publishing views"><Link className="is-active" href="/admin/publishing">Release</Link><Link href="/admin/publishing?tab=history">History</Link><Link href="/admin/publishing?tab=restore">Restore</Link></nav>
      <section className="admin-dashboard-columns">
        <article className="admin-panel"><p className="admin-eyebrow">Draft</p><h2>{draftChanged ? 'Unpublished changes' : 'Matches published release'}</h2><p className="admin-panel-copy">The private draft is validated before it is published.</p></article>
        <article className="admin-panel"><p className="admin-eyebrow">Published release</p><h2>{published ? 'Live' : 'No release'}</h2><p className="admin-panel-copy">{published ? 'A validated published release is currently active.' : 'Publish the draft to create the first live release.'}</p></article>
      </section>
      <section className="admin-panel" style={{ marginTop: 16 }}><p className="admin-eyebrow">Version history</p><h2>Releases</h2><p className="admin-panel-copy">{published ? 'The active release is available in the publishing history.' : 'No version history is available until a release is published.'}</p></section>
    </>
  );
}
