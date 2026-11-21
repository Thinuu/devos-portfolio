import { getFirebaseAdmin } from '@/lib/firebase/admin';
export const dynamic = 'force-dynamic';
export default async function Analytics() {
  let configured = Boolean(process.env.FIREBASE_PROJECT_ID);
  let count = 0;
  if (configured) { const snapshot = await getFirebaseAdmin().db.collection('analytics_events').limit(1000).get(); count = snapshot.size; }
  return <><header className="admin-header"><div><p className="admin-eyebrow">Privacy-conscious reporting</p><h1>Portfolio Analytics</h1></div></header><section className="admin-grid"><article className="admin-card"><span>Recorded events</span><strong>{count}</strong><small>{configured ? 'Stored first-party events' : 'Configure Firebase to collect events'}</small></article></section><section className="admin-panel"><p>Analytics are optional and no fabricated visitor statistics are shown. Add consent-aware event collection before enabling production reporting.</p></section></>;
}
