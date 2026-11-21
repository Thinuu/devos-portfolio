import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, CircleAlert, Cpu, FileText, FolderKanban, Palette, Plus, Rocket, UserRound } from 'lucide-react';
import { getDraftRelease, getPublishedRelease } from '@/lib/repositories/portfolio.repository';
import { listCvProfiles, listJobApplications } from '@/lib/repositories/career.repository';
import { requireAdmin } from '@/lib/firebase/auth';
import { redirect } from 'next/navigation';
import { portfolioData } from '@/lib/data';

export default async function AdminDashboard() {
  let adminName = portfolioData.personal.name;
  try {
    const admin = await requireAdmin();
    if (typeof admin.email === 'string') {
      const name = admin.email.split('@')[0].replace(/[._-]+/g, ' ').trim();
      if (name) adminName = name.replace(/\b\w/g, (letter) => letter.toUpperCase());
    }
  } catch { redirect('/admin/login'); }
  const draft = await getDraftRelease();
  const [published, cvProfiles, applications] = await Promise.all([getPublishedRelease(), listCvProfiles(), listJobApplications()]);
  const skillCount = Object.values(draft.content.skills).reduce((total, skills) => total + (Array.isArray(skills) ? skills.length : 0), 0);
  const skillCategories = Object.keys(draft.content.skills).length;
  const inProgress = applications.filter((item) => ['Preparing', 'Applied', 'Screening', 'Interview', 'Technical Assessment'].includes(item.status)).length;
  const interviews = applications.filter((item) => item.status === 'Interview').length;
  const warnings = [
    !draft.content.personal.email ? { text: 'Add a contact email to the profile.', href: '/admin/content' } : null,
    draft.content.projects.some((project) => !project.shortDesc) ? { text: 'Add descriptions to every project.', href: '/admin/content' } : null,
    draft.content.experience.length === 0 ? { text: 'Add at least one experience entry.', href: '/admin/content' } : null,
    !published ? { text: 'Publish a release to make the draft public.', href: '/admin/publishing' } : null,
  ].filter((warning): warning is { text: string; href: string } => Boolean(warning));
  const date = new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(new Date());
  const draftJson = JSON.stringify(draft.content);
  const publishedJson = published ? JSON.stringify(published.content) : '';
  const unpublishedChanges = published ? (draftJson !== publishedJson ? 1 : 0) : 1;
  const firstName = adminName.split(' ')[0] || portfolioData.personal.name.split(' ')[0];
  const lastPublished = published?.publishedAt
    ? (published.publishedAt instanceof Date
      ? published.publishedAt
      : new Date(published.publishedAt as string | number))
    : null;
  const lastPublishedLabel = lastPublished && !Number.isNaN(lastPublished.getTime())
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(lastPublished)
    : 'Not published';
  const sections = [
    ['Profile', Boolean(draft.content.personal.name && draft.content.personal.bio && draft.content.personal.role), 'Profile'],
    ['Hero', Boolean(draft.content.personal.name && draft.content.personal.tagline), 'Profile'],
    ['About', Boolean(draft.content.personal.bio), 'Profile'],
    ['Projects', draft.content.projects.length > 0, `${draft.content.projects.length} items`],
    ['Skills', skillCount > 0, `${skillCount} skills`],
    ['Tools', Object.prototype.hasOwnProperty.call(draft.content, 'tools'), 'Tools'],
    ['Experience', draft.content.experience.length > 0, `${draft.content.experience.length} entries`],
    ['Education', draft.content.education.length > 0, `${draft.content.education.length} entries`],
    ['Certifications', draft.content.certifications.length > 0, `${draft.content.certifications.length} entries`],
    ['Workflow', Object.prototype.hasOwnProperty.call(draft.content, 'workflow'), 'Workflow'],
    ['Terminal', Object.prototype.hasOwnProperty.call(draft.content, 'terminal'), 'Terminal'],
    ['Contact', Boolean(draft.content.personal.email && draft.content.personal.location), 'Contact'],
  ] as const;

  return (
    <>
      <header className="admin-header admin-welcome">
        <div><p className="admin-eyebrow">Portfolio control centre / {date}</p><h1>Welcome back, {firstName}</h1><p>Manage your portfolio, professional profile, website design, and tailored CVs from one workspace.</p></div>
        <div className="admin-actions"><a className="admin-button" href="/" target="_blank" rel="noreferrer">View portfolio <ArrowUpRight size={15} /></a><Link className="admin-button primary" href="/admin/content">Edit portfolio</Link></div>
      </header>

      <section className="admin-dashboard-stats">
        <Link className="admin-stat-card" href="/admin/content"><span><FolderKanban size={16} /> Projects</span><strong>{draft.content.projects.length}</strong><small>Current draft</small></Link>
        <Link className="admin-stat-card" href="/admin/content"><span><UserRound size={16} /> Experience</span><strong>{draft.content.experience.length}</strong><small>Career entries</small></Link>
        <Link className="admin-stat-card" href="/admin/content"><span><Cpu size={16} /> Skills</span><strong>{skillCount}</strong><small>{skillCategories} categories</small></Link>
        <Link className="admin-stat-card" href="/admin/cv-studio"><span><FileText size={16} /> CV profiles</span><strong>{cvProfiles.length}</strong><small>Private documents</small></Link>
        <Link className="admin-stat-card" href="/admin/job-applications"><span><Rocket size={16} /> Applications</span><strong>{applications.length}</strong><small>{inProgress} in progress · {interviews} interviews</small></Link>
        <article className="admin-stat-card"><span><CheckCircle2 size={16} /> Publishing</span><strong>{published ? 'Live' : 'Draft only'}</strong><small>{published ? 'Published release active' : 'Publish a release to go live'}</small></article>
      </section>

      <section className="admin-quick-actions"><div><p className="admin-eyebrow">Shortcuts</p><h2>Quick actions</h2></div><div className="admin-quick-links"><Link className="admin-button" href="/admin/content"><Plus size={15} /> Add project</Link><Link className="admin-button" href="/admin/content"><UserRound size={15} /> Edit profile</Link><Link className="admin-button" href="/admin/cv-studio"><FileText size={15} /> Create CV</Link><Link className="admin-button" href="/admin/cover-letters">Create cover letter</Link><Link className="admin-button" href="/admin/content"><Palette size={15} /> Customise design</Link><Link className="admin-button primary" href="/admin/content"><Rocket size={15} /> Review draft</Link></div></section>

      <section className="admin-dashboard-columns">
        <div className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Portfolio content</p><h2>Content overview</h2></div><Link href="/admin/content">Manage <ArrowUpRight size={14} /></Link></div><div className="admin-section-list">{sections.map(([label, complete, meta]) => <Link href="/admin/content" className="admin-section-row" key={label}><span>{label}</span><span className="admin-section-meta">{meta}</span><span className={complete ? 'admin-section-status is-complete' : 'admin-section-status'}>{complete ? 'Ready' : 'Needs review'} {complete ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}</span></Link>)}</div></div>
        <div className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Publishing</p><h2>Release status</h2></div><Link href="/admin/publishing">Manage <ArrowUpRight size={14} /></Link></div><div className="admin-release-status"><div className={`admin-release-indicator${published ? ' is-live' : ''}`} /><div><strong>{published ? 'Published release active' : 'No published release'}</strong><p>Last published: {lastPublishedLabel}</p><p>{unpublishedChanges ? `${unpublishedChanges} unpublished change${unpublishedChanges === 1 ? '' : 's'}` : 'Draft matches the live release'}</p></div></div><div className="admin-quick-links"><Link className="admin-button" href="/admin/content">Preview draft</Link><Link className="admin-button primary" href="/admin/publishing">Open publishing workflow</Link></div></div>
      </section>

      <section className="admin-dashboard-columns">
        <div className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Career workspace</p><h2>CV &amp; applications</h2></div><Link href="/admin/cv-studio">Open studio <ArrowUpRight size={14} /></Link></div><p className="admin-panel-copy">{cvProfiles.length} CV profile{cvProfiles.length === 1 ? '' : 's'} available, with {applications.length} private job application{applications.length === 1 ? '' : 's'} tracked.</p><div className="admin-quick-links"><Link className="admin-button" href="/admin/cv-templates">Browse templates</Link><Link className="admin-button" href="/admin/job-applications">Track applications</Link></div></div>
        <div className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">Portfolio health</p><h2>{warnings.length ? `${warnings.length} item${warnings.length === 1 ? '' : 's'} to review` : 'Looking good'}</h2></div></div>{warnings.length ? <ul className="admin-health-list">{warnings.map((warning) => <li key={`${warning.text}-${warning.href}`}><Link href={warning.href}><CircleAlert size={15} />{warning.text}</Link></li>)}</ul> : <p className="admin-panel-copy">Required profile, project, experience, and publishing checks are complete.</p>}</div>
      </section>
    </>
  );
}
