'use client';
import { useState } from 'react';
export default function CoverLetters() {
  const [form, setForm] = useState({ id: `letter-${Date.now()}`, name: '', company: '', jobTitle: '', recipient: '', body: '', updatedAt: new Date().toISOString() });
  const [status, setStatus] = useState('');
  async function save() { const response = await fetch('/api/admin/cover-letters', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); setStatus(response.ok ? 'Cover letter saved privately.' : 'Unable to save cover letter.'); }
  return <><header className="admin-header"><div><p className="admin-eyebrow">Career management</p><h1>Cover Letter Studio</h1></div><button className="admin-button primary" onClick={save}>Save letter</button></header><section className="admin-panel admin-form"><label>Document name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Company<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label><label>Job title<input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></label><label>Recipient<input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} /></label><label>Letter body<textarea rows={16} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label></section><p className="admin-status">{status}</p></>;
}
