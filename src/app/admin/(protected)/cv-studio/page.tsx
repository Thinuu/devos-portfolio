'use client';

import { useEffect, useState } from 'react';
import { readJsonResponse } from '@/lib/http/json';

type Profile = { id: string; name: string; targetTitle: string; summary: string; templateId: string; pageSize: 'A4' | 'LETTER'; design: { primary: string; text: string; muted: string; font: 'Arial' | 'Calibri' | 'Georgia' | 'Inter' | 'Times New Roman'; showPhoto: boolean; showIcons: boolean; showDividers: boolean }; [key: string]: unknown };

export default function CvStudio() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState('Loading CV profile…');
  useEffect(() => { fetch('/api/admin/cv').then(async (response) => { if (!response.ok) throw new Error('Unable to load CV profile.'); const data = await readJsonResponse<{profiles?:Profile[]}>(response); setProfile(data?.profiles?.[0] ?? null); setStatus(data?.profiles?.[0] ? '' : 'No CV profile found.'); }).catch(() => setStatus('Unable to load CV profile.')); }, []);
  if (!profile) return <p className="admin-empty">{status}</p>;

  const update = (patch: Partial<Profile>) => setProfile({ ...profile, ...patch });
  async function save() {
    setStatus('Saving…');
    const response = await fetch('/api/admin/cv', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }) });
    setStatus(response.ok ? 'CV profile saved.' : 'Unable to save profile.');
  }
  async function download(format: 'pdf' | 'docx') {
    if (!profile) return;
    setStatus(`Generating ${format.toUpperCase()}…`);
    const response = await fetch('/api/admin/cv/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile, format }) });
    if (!response.ok) { setStatus('Export failed.'); return; }
    const blob = await response.blob();
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${profile.name.replace(/[^a-z0-9]+/gi, '_')}_CV.${format}`; link.click(); URL.revokeObjectURL(link.href); setStatus('Export ready.');
  }
  return (
    <>
      <header className="admin-header"><div><p className="admin-eyebrow">Career management</p><h1>CV &amp; Resume Studio</h1></div><div className="admin-actions"><button className="admin-button" onClick={save}>Save profile</button><button className="admin-button primary" onClick={() => download('pdf')}>Download PDF</button><button className="admin-button" onClick={() => download('docx')}>Download DOCX</button></div></header>
      <div className="cv-studio-grid">
        <section className="admin-panel admin-form">
          <label>CV profile name<input value={profile.name} onChange={(event) => update({ name: event.target.value })} /></label>
          <label>Target job title<input value={profile.targetTitle} onChange={(event) => update({ targetTitle: event.target.value })} /></label>
          <label>Template<select value={profile.templateId} onChange={(event) => update({ templateId: event.target.value })}><option value="ats-classic">ATS Classic</option><option value="modern-professional">Modern Professional</option><option value="software-engineer">Software Engineer</option><option value="full-stack-developer">Full Stack Developer</option><option value="minimal-elegant">Minimal Elegant</option><option value="compact-one-page">Compact One-Page</option><option value="executive-professional">Executive Professional</option><option value="modern-two-column">Modern Two-Column</option></select></label>
          <label>Page size<select value={profile.pageSize} onChange={(event) => update({ pageSize: event.target.value as Profile['pageSize'] })}><option value="A4">A4</option><option value="LETTER">US Letter</option></select></label>
          <label>Professional summary<textarea rows={10} value={profile.summary} onChange={(event) => update({ summary: event.target.value })} /></label>
        </section>
        <section className="admin-panel cv-preview"><p className="admin-eyebrow">Live content preview</p><h2>{profile.name}</h2><p className="cv-muted">{profile.targetTitle}</p><hr /><h3>Professional Summary</h3><p>{profile.summary}</p><h3>Source data</h3><p>This CV uses the existing portfolio experience, projects, skills, education, and certifications. CV-specific summary and design changes remain isolated from the public portfolio.</p></section>
      </div>
      <p className="admin-status" role="status">{status}</p>
    </>
  );
}
