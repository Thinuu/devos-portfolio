import { getFirebaseAdmin } from '@/lib/firebase/admin';

export default async function ActivityLog() {
  let activities: Array<{ id: string; type?: string; uid?: string; createdAt?: unknown }> = [];
  if (process.env.FIREBASE_PROJECT_ID) {
    const snapshot = await getFirebaseAdmin().db.collection('activity').orderBy('createdAt', 'desc').limit(50).get();
    activities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as typeof activities;
  }
  return (
    <><header className="admin-header"><div><p className="admin-eyebrow">Audit trail</p><h1>Activity log</h1></div></header>
      {activities.length ? <section className="admin-simple-grid">{activities.map((activity) => <article className="admin-simple-card" key={activity.id}><p className="admin-eyebrow">{activity.type ?? 'activity'}</p><p>{activity.uid ?? 'Administrator'}</p><p>{activity.createdAt && typeof activity.createdAt === 'object' && 'toDate' in activity.createdAt ? (activity.createdAt as { toDate: () => Date }).toDate().toLocaleString() : 'Recent'}</p></article>)}</section> : <section className="admin-simple-card"><h2>No recent activity</h2><p>Content and publishing events will appear here after the next saved draft or release.</p></section>}
    </>
  );
}
