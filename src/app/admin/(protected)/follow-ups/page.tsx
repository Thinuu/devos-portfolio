import { listJobApplications } from '@/lib/repositories/career.repository';

export default async function FollowUpsPage() {
  const applications = await listJobApplications();
  const followUps = applications.filter((application) => ['Preparing', 'Applied', 'Screening', 'Interview', 'Technical Assessment'].includes(application.status));
  return (
    <><header className="admin-header"><div><p className="admin-eyebrow">Career pipeline</p><h1>Follow-ups</h1></div></header>
      {followUps.length ? <section className="admin-simple-grid">{followUps.map((application) => <article className="admin-simple-card" key={application.id}><p className="admin-eyebrow">{application.status}</p><h2>{application.company}</h2><p>{application.jobTitle}</p><p>{application.notes || 'Add follow-up notes in the application tracker.'}</p></article>)}</section> : <div className="admin-simple-card"><h2>No follow-ups due</h2><p>Active applications will appear here.</p></div>}
    </>
  );
}
