import { listJobApplications } from '@/lib/repositories/career.repository';

export default async function InterviewsPage() {
  const applications = await listJobApplications();
  const interviews = applications.filter((application) => application.status === 'Interview');
  return (
    <><header className="admin-header"><div><p className="admin-eyebrow">Career pipeline</p><h1>Interviews</h1></div></header>
      {interviews.length ? <section className="admin-simple-grid">{interviews.map((application) => <article className="admin-simple-card" key={application.id}><p className="admin-eyebrow">{application.status}</p><h2>{application.company}</h2><p>{application.jobTitle}</p></article>)}</section> : <div className="admin-simple-card"><h2>No interviews scheduled</h2><p>Applications marked as Interview will appear here.</p></div>}
    </>
  );
}
