'use client';

import { use, useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Download, FileText, Check, AlertTriangle, RotateCcw,
  Save, Eye, Copy, RefreshCw, Upload, CheckCircle2, ChevronDown, ChevronUp,
  Sparkles, Layers, History, Settings, Target, Palette, Trash2, X, Plus,
} from 'lucide-react';
import { readJsonResponse } from '@/lib/http/json';
import type { CvProfile, CvSectionConfig, CvVersion, CvItemOverride } from '@/lib/schemas/career.schema';
import { portfolioData } from '@/lib/data';
import CvPaperPreview from '@/components/admin/cv/CvPaperPreview';
import s from './editor.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CvStudioEditorPage({ params }: PageProps) {
  const { id } = use(params);

  const [profile, setProfile] = useState<CvProfile | null>(null);
  const [initialProfile, setInitialProfile] = useState<CvProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'design' | 'job' | 'versions'>('content');
  const [zoom, setZoom] = useState(100);
  const [detectedPages, setDetectedPages] = useState(1);
  const [targetPages, setTargetPages] = useState(1);

  // Modals
  const [wordModalOpen, setWordModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [diffVersion, setDiffVersion] = useState<CvVersion | null>(null);
  const [uploadedTemplates, setUploadedTemplates] = useState<Array<{ id: string; name: string; filename: string }>>([]);
  const [selectedWordTplId, setSelectedWordTplId] = useState<string>('');
  const [uploadingWord, setUploadingWord] = useState(false);

  // Check dirty state
  const isDirty = useMemo(() => {
    if (!profile || !initialProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(initialProfile);
  }, [profile, initialProfile]);

  // Unsaved changes guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  async function loadProfile() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/cv/${id}`);
      if (!res.ok) throw new Error('CV Profile not found.');
      const data = await readJsonResponse<{ profile: CvProfile }>(res);
      if (data?.profile) {
        setProfile(data.profile);
        setInitialProfile(data.profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading profile.');
    } finally {
      setLoading(false);
    }
  }

  async function loadUploadedTemplates() {
    try {
      const res = await fetch('/api/admin/cv/templates');
      if (res.ok) {
        const data = await readJsonResponse<{ templates: Array<{ id: string; name: string; filename: string }> }>(res);
        setUploadedTemplates(data?.templates || []);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadProfile();
    loadUploadedTemplates();
  }, [id]);

  function update(patch: Partial<CvProfile>) {
    if (!profile) return;
    setProfile({ ...profile, ...patch });
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cv/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const data = await readJsonResponse<{ profile: CvProfile }>(res);
        if (data?.profile) {
          setProfile(data.profile);
          setInitialProfile(data.profile);
        }
      } else {
        alert('Failed to save CV profile.');
      }
    } catch {
      alert('Error saving CV profile.');
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!initialProfile) return;
    if (confirm('Discard all unsaved changes and revert to the last saved state?')) {
      setProfile(initialProfile);
    }
  }

  async function handleExport(format: 'pdf' | 'docx', customTemplateId?: string) {
    if (!profile) return;
    try {
      const res = await fetch('/api/admin/cv/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          format,
          customTemplateId,
        }),
      });

      if (!res.ok) {
        alert('Export failed.');
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : `${profile.name}_CV.${format}`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch {
      alert('Error exporting document.');
    }
  }

  async function handleUploadTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingWord(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

      const res = await fetch('/api/admin/cv/templates', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await loadUploadedTemplates();
      } else {
        alert('Failed to upload Word template.');
      }
    } catch {
      alert('Error uploading template.');
    } finally {
      setUploadingWord(false);
      e.target.value = '';
    }
  }

  async function handleDownloadStarterDocx() {
    try {
      const res = await fetch('/api/admin/cv/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starter: true }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'CV_Template_Starter.docx';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      }
    } catch {
      alert('Error downloading starter template.');
    }
  }

  if (loading) return <p className="admin-status">Loading CV Studio…</p>;
  if (error || !profile) return <p className="admin-error">{error || 'Profile not found.'}</p>;

  return (
    <div className={s.layout}>
      {/* Left Pane: Scrolling Tabs */}
      <div className={s.leftPane}>
        <div className={s.paneHeader}>
          <div style={{ minWidth: 0 }}>
            <Link href="/admin/cv-studio" className={s.backLink}>
              <ArrowLeft size={13} /> Back to CVs
            </Link>
            <h2 className={s.paneTitle} title={profile.name}>{profile.name}</h2>
          </div>
          {profile.isPublic && (
            <span style={{ fontSize: 10, background: 'rgba(110,208,156,0.15)', color: '#6ed09c', padding: '2px 6px', borderRadius: 999 }}>
              Public
            </span>
          )}
        </div>

        {/* Tab Navigation */}
        <nav className={s.tabsNav} aria-label="Editor tabs">
          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'content' ? s.active : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'design' ? s.active : ''}`}
            onClick={() => setActiveTab('design')}
          >
            Design
          </button>
          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'job' ? s.active : ''}`}
            onClick={() => setActiveTab('job')}
          >
            Job Target
          </button>
          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'details' ? s.active : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'versions' ? s.active : ''}`}
            onClick={() => setActiveTab('versions')}
          >
            Versions ({profile.versions?.length || 0})
          </button>
        </nav>

        {/* Tab Content */}
        <div className={s.tabContent}>
          {activeTab === 'content' && (
            <ContentTab
              profile={profile}
              update={update}
              onOpenSync={() => setSyncModalOpen(true)}
            />
          )}

          {activeTab === 'design' && (
            <DesignTab
              profile={profile}
              update={update}
            />
          )}

          {activeTab === 'job' && (
            <JobTargetTab
              profile={profile}
              update={update}
            />
          )}

          {activeTab === 'details' && (
            <DetailsTab
              profile={profile}
              update={update}
            />
          )}

          {activeTab === 'versions' && (
            <VersionsTab
              profile={profile}
              onRestore={(snapshot) => {
                if (confirm('Restore this version to the editor?')) {
                  setProfile(snapshot as CvProfile);
                }
              }}
              onCompare={(ver) => setDiffVersion(ver)}
            />
          )}
        </div>

        {/* Docked Bottom Bar */}
        <footer className={s.bottomDock}>
          <div className={s.saveStateInfo}>
            <span className={`${s.statusDot} ${isDirty ? s.dirty : ''}`} />
            <span>{isDirty ? 'Unsaved changes' : 'All changes saved'}</span>
          </div>
          <div className={s.dockActions}>
            <button
              type="button"
              className="admin-button"
              disabled={!isDirty || saving}
              onClick={discard}
            >
              <RotateCcw size={14} /> Discard
            </button>
            <button
              type="button"
              className="admin-button primary"
              disabled={!isDirty || saving}
              onClick={save}
            >
              <Save size={14} /> {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </footer>
      </div>

      {/* Right Pane: Live Paginated Preview */}
      <div className={s.rightPane}>
        <div className={s.previewToolbar}>
          <div className={s.previewMeta}>
            <span className={`${s.pageBadge} ${detectedPages > targetPages ? s.overflow : ''}`}>
              {detectedPages === 1 ? '1 page' : `${detectedPages} pages`}
            </span>
            <div className={s.zoomControls}>
              <button
                type="button"
                className={s.zoomBtn}
                title="Zoom out"
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
              >
                -
              </button>
              <span className={s.zoomLabel}>{zoom}%</span>
              <button
                type="button"
                className={s.zoomBtn}
                title="Zoom in"
                onClick={() => setZoom((z) => Math.min(150, z + 10))}
              >
                +
              </button>
              <button
                type="button"
                className={s.zoomBtn}
                title="Reset zoom"
                onClick={() => setZoom(100)}
              >
                100%
              </button>
            </div>
          </div>

          <div className={s.exportGroup}>
            <button
              type="button"
              className="admin-button primary"
              onClick={() => handleExport('pdf')}
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              type="button"
              className="admin-button"
              onClick={() => handleExport('docx')}
            >
              <Download size={14} /> Download DOCX
            </button>
            <button
              type="button"
              className="admin-button"
              onClick={() => setWordModalOpen(true)}
            >
              <FileText size={14} /> Use Word Template
            </button>
          </div>
        </div>

        <div className={s.previewScrollArea}>
          <CvPaperPreview
            profile={profile}
            zoom={zoom}
            targetPages={targetPages}
            onPageCountChange={setDetectedPages}
          />
        </div>
      </div>

      {/* Word Template Modal */}
      {wordModalOpen && (
        <div className={s.modalBackdrop} role="presentation">
          <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="word-modal-title">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="word-modal-title">Export with Word (.docx) Template</h2>
              <button
                type="button"
                className="admin-button"
                style={{ width: 28, height: 28, padding: 0 }}
                onClick={() => setWordModalOpen(false)}
              >
                <X size={15} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-soft)', margin: 0 }}>
              Upload your own Microsoft Word template containing merge placeholders. Preserves your exact fonts, margins, headers, and formatting.
            </p>

            {/* Upload Area */}
            <div style={{ border: '1px dashed var(--border)', padding: 16, borderRadius: 8, textAlign: 'center' }}>
              <input
                type="file"
                id="word-template-upload"
                accept=".docx"
                style={{ display: 'none' }}
                onChange={handleUploadTemplate}
                disabled={uploadingWord}
              />
              <label
                htmlFor="word-template-upload"
                className="admin-button primary"
                style={{ cursor: 'pointer', display: 'inline-flex', gap: 6 }}
              >
                <Upload size={14} /> {uploadingWord ? 'Uploading…' : 'Upload .docx Template'}
              </label>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                Or <button type="button" onClick={handleDownloadStarterDocx} style={{ color: 'var(--accent)', background: 'transparent', border: 0, textDecoration: 'underline', cursor: 'pointer' }}>download our starter template</button> with all tags.
              </p>
            </div>

            {/* Uploaded Templates Selector */}
            {uploadedTemplates.length > 0 && (
              <div>
                <label className="cms-field-label">Select uploaded template:</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <select
                    className="cms-control"
                    value={selectedWordTplId}
                    onChange={(e) => setSelectedWordTplId(e.target.value)}
                  >
                    <option value="">-- Choose template --</option>
                    {uploadedTemplates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.filename})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="admin-button primary"
                    disabled={!selectedWordTplId}
                    onClick={() => {
                      handleExport('docx', selectedWordTplId);
                      setWordModalOpen(false);
                    }}
                  >
                    Generate
                  </button>
                </div>
              </div>
            )}

            {/* Placeholder Reference Panel */}
            <div>
              <h3 style={{ fontSize: 13, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--accent)', margin: '8px 0 6px' }}>
                Placeholder Reference (Click to copy)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                {[
                  '{name}', '{role}', '{email}', '{phone}', '{location}', '{github}', '{linkedin}', '{website}', '{summary}',
                  '{#experience}{company} {role} {period}{#bullets}{.}{/bullets}{/experience}',
                  '{#projects}{title} {tech}{shortDesc}{#bullets}{.}{/bullets}{/projects}',
                  '{#skills}{category}: {list}{/skills}',
                  '{#education}{degree} {institution} {period}{/education}',
                  '{#certifications}{name} {issuer}{/certifications}',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(tag);
                      alert(`Copied ${tag} to clipboard`);
                    }}
                    style={{
                      textAlign: 'left',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '4px 8px',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-soft)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title="Click to copy"
                  >
                    <Copy size={11} style={{ marginRight: 4 }} /> {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync from Portfolio Diff Modal */}
      {syncModalOpen && (
        <SyncPortfolioModal
          profile={profile}
          onApply={(updatedOverrides, updatedSummary) => {
            update({
              summary: updatedSummary !== undefined ? updatedSummary : profile.summary,
              overrides: updatedOverrides,
            });
            setSyncModalOpen(false);
          }}
          onClose={() => setSyncModalOpen(false)}
        />
      )}

      {/* Diff Version Snapshot Modal */}
      {diffVersion && (
        <div className={s.modalBackdrop} role="presentation">
          <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="diff-title">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="diff-title">Version Comparison: {diffVersion.name}</h2>
              <button
                type="button"
                className="admin-button"
                style={{ width: 28, height: 28, padding: 0 }}
                onClick={() => setDiffVersion(null)}
              >
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              Saved {new Date(diffVersion.createdAt).toLocaleString()} · Note: {diffVersion.note || 'None'}
            </p>
            <div style={{ maxHeight: 350, overflowY: 'auto', background: 'var(--bg-soft)', padding: 12, borderRadius: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(diffVersion.snapshot, null, 2)}
              </pre>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="admin-button" onClick={() => setDiffVersion(null)}>
                Close
              </button>
              <button
                type="button"
                className="admin-button primary"
                onClick={() => {
                  if (confirm('Restore this snapshot to the editor?')) {
                    setProfile(diffVersion.snapshot as CvProfile);
                    setDiffVersion(null);
                  }
                }}
              >
                Restore this version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Tab Subcomponents
// -------------------------------------------------------------

function DetailsTab({ profile, update }: { profile: CvProfile; update: (p: Partial<CvProfile>) => void }) {
  const c = profile.contact;
  const updateContact = (patch: Partial<CvProfile['contact']>) => {
    update({ contact: { ...c, ...patch } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label className="cms-field-label" htmlFor="details-name">CV Profile Name *</label>
        <input
          id="details-name"
          className="cms-control"
          value={profile.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>

      <div>
        <label className="cms-field-label" htmlFor="details-target">Target Job Title</label>
        <input
          id="details-target"
          className="cms-control"
          value={profile.targetTitle}
          onChange={(e) => update({ targetTitle: e.target.value })}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="cms-field-label" htmlFor="details-pagesize">Page Size</label>
          <select
            id="details-pagesize"
            className="cms-control"
            value={profile.pageSize}
            onChange={(e) => update({ pageSize: e.target.value as 'A4' | 'LETTER' })}
          >
            <option value="A4">A4 (210 x 297mm)</option>
            <option value="LETTER">US Letter (8.5 x 11 in)</option>
          </select>
        </div>
        <div>
          <label className="cms-field-label" htmlFor="details-lang">Language</label>
          <select
            id="details-lang"
            className="cms-control"
            value={profile.language || 'en'}
            onChange={(e) => update({ language: e.target.value })}
          >
            <option value="en">English (US/UK)</option>
          </select>
        </div>
      </div>

      <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
        <legend style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase' }}>
          Contact Items to Show
        </legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {[
            { key: 'showEmail', label: 'Email', value: c.customEmail || portfolioData.personal.email },
            { key: 'showPhone', label: 'Phone', value: c.customPhone || portfolioData.personal.phone },
            { key: 'showLocation', label: 'Location', value: c.customLocation || portfolioData.personal.location },
            { key: 'showGithub', label: 'GitHub', value: c.customGithub || portfolioData.personal.github },
            { key: 'showLinkedin', label: 'LinkedIn', value: c.customLinkedin || portfolioData.personal.linkedin },
            { key: 'showWebsite', label: 'Website / Portfolio', value: c.customWebsite || (process.env.NEXT_PUBLIC_SITE_URL || 'https://thinu.me') },
          ].map((item) => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={Boolean(c[item.key as keyof typeof c])}
                  onChange={(e) => updateContact({ [item.key]: e.target.checked })}
                />
                <span style={{ fontWeight: 600 }}>{item.label}</span>
              </div>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{item.value}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function ContentTab({
  profile,
  update,
  onOpenSync,
}: {
  profile: CvProfile;
  update: (p: Partial<CvProfile>) => void;
  onOpenSync: () => void;
}) {
  const sections = profile.sections || [];
  const overrides = profile.overrides || { experience: {}, projects: {}, education: {}, certifications: {}, skills: { selectedCategories: [], selectedSkills: [], categoryLimits: {}, customSkills: [] } };

  function moveSection(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const cloned = [...sections];
    const [moved] = cloned.splice(index, 1);
    cloned.splice(targetIndex, 0, moved);
    const reordered = cloned.map((s, idx) => ({ ...s, order: idx }));
    update({ sections: reordered });
  }

  function toggleSection(id: string) {
    const reordered = sections.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s);
    update({ sections: reordered });
  }

  function updateSectionTitle(id: string, title: string) {
    const reordered = sections.map((s) => s.id === id ? { ...s, title } : s);
    update({ sections: reordered });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Sync from portfolio button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-soft)' }}>
          Portfolio overrides apply to this CV only.
        </p>
        <button
          type="button"
          className="admin-button"
          onClick={onOpenSync}
          style={{ gap: 6 }}
        >
          <RefreshCw size={13} /> Sync from portfolio
        </button>
      </div>

      {/* Sections Accordion */}
      {sections.map((sec, idx) => (
        <div key={sec.id} className={s.sectionBlock}>
          <div className={s.sectionHeader}>
            <div className={s.sectionHeaderLeft}>
              <input
                type="checkbox"
                checked={sec.enabled}
                onChange={() => toggleSection(sec.id)}
                title="Include/exclude this section"
              />
              <input
                type="text"
                value={sec.title}
                onChange={(e) => updateSectionTitle(sec.id, e.target.value)}
                style={{
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '2px 4px',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'transparent'}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                type="button"
                className="admin-button"
                disabled={idx === 0}
                style={{ width: 24, height: 24, padding: 0 }}
                onClick={() => moveSection(idx, 'up')}
              >
                <ChevronUp size={13} />
              </button>
              <button
                type="button"
                className="admin-button"
                disabled={idx === sections.length - 1}
                style={{ width: 24, height: 24, padding: 0 }}
                onClick={() => moveSection(idx, 'down')}
              >
                <ChevronDown size={13} />
              </button>
            </div>
          </div>

          {/* Section Body */}
          {sec.enabled && (
            <div style={{ padding: 12 }}>
              {sec.id === 'summary' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {(profile.summary || '').length} characters
                    </span>
                    <button
                      type="button"
                      className="admin-button"
                      style={{ fontSize: 11, padding: '2px 8px', height: 26 }}
                      onClick={() => update({ summary: portfolioData.personal.bio })}
                    >
                      Use portfolio bio
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    className="cms-control"
                    value={profile.summary}
                    onChange={(e) => update({ summary: e.target.value })}
                    placeholder="Enter professional summary for this CV…"
                  />
                </div>
              )}

              {sec.id === 'experience' && (
                <ExperienceSectionEditor
                  overrides={overrides.experience || {}}
                  onUpdate={(exp) => update({ overrides: { ...overrides, experience: exp } })}
                />
              )}

              {sec.id === 'projects' && (
                <ProjectsSectionEditor
                  overrides={overrides.projects || {}}
                  onUpdate={(proj) => update({ overrides: { ...overrides, projects: proj } })}
                />
              )}

              {sec.id === 'skills' && (
                <SkillsSectionEditor
                  config={overrides.skills || { selectedCategories: [], selectedSkills: [], categoryLimits: {}, customSkills: [] }}
                  onUpdate={(skills) => update({ overrides: { ...overrides, skills } })}
                />
              )}

              {sec.id === 'education' && (
                <EducationSectionEditor
                  overrides={overrides.education || {}}
                  onUpdate={(edu) => update({ overrides: { ...overrides, education: edu } })}
                />
              )}

              {sec.id === 'certifications' && (
                <CertificationsSectionEditor
                  overrides={overrides.certifications || {}}
                  onUpdate={(cert) => update({ overrides: { ...overrides, certifications: cert } })}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExperienceSectionEditor({
  overrides,
  onUpdate,
}: {
  overrides: Record<string, CvItemOverride>;
  onUpdate: (o: Record<string, CvItemOverride>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {portfolioData.experience.map((item, idx) => {
        const key = String(idx);
        const ov = overrides[key] || {};
        const excluded = ov.excluded === true;
        const isEdited = Boolean(ov.role || ov.company || ov.period || ov.bullets);

        return (
          <div key={idx} className={s.itemCard} style={{ opacity: excluded ? 0.5 : 1 }}>
            <div className={s.itemHeader}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!excluded}
                  onChange={(e) => {
                    onUpdate({
                      ...overrides,
                      [key]: { ...ov, excluded: !e.target.checked },
                    });
                  }}
                />
                <span className={s.itemHeaderTitle}>{item.role} @ {item.company}</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isEdited && <span className={s.badgeEdited}>Edited</span>}
                {isEdited && (
                  <button
                    type="button"
                    className={s.revertBtn}
                    onClick={() => {
                      const next = { ...overrides };
                      delete next[key];
                      onUpdate(next);
                    }}
                  >
                    Revert
                  </button>
                )}
              </div>
            </div>

            {!excluded && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                <input
                  className="cms-control"
                  style={{ fontSize: 12, padding: '6px 8px' }}
                  value={String(ov.role !== undefined ? ov.role : item.role)}
                  onChange={(e) => {
                    onUpdate({
                      ...overrides,
                      [key]: { ...ov, role: e.target.value },
                    });
                  }}
                  placeholder="Role"
                />
                <input
                  className="cms-control"
                  style={{ fontSize: 12, padding: '6px 8px' }}
                  value={String(ov.company !== undefined ? ov.company : item.company)}
                  onChange={(e) => {
                    onUpdate({
                      ...overrides,
                      [key]: { ...ov, company: e.target.value },
                    });
                  }}
                  placeholder="Company"
                />
                <input
                  className="cms-control"
                  style={{ fontSize: 12, padding: '6px 8px', gridColumn: 'span 2' }}
                  value={String(ov.period !== undefined ? ov.period : item.period)}
                  onChange={(e) => {
                    onUpdate({
                      ...overrides,
                      [key]: { ...ov, period: e.target.value },
                    });
                  }}
                  placeholder="Period"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProjectsSectionEditor({
  overrides,
  onUpdate,
}: {
  overrides: Record<string, CvItemOverride>;
  onUpdate: (o: Record<string, CvItemOverride>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {portfolioData.projects.map((item) => {
        const key = item.id;
        const ov = overrides[key] || {};
        const excluded = ov.excluded === true;
        const isEdited = Boolean(ov.title || ov.shortDesc);

        return (
          <div key={item.id} className={s.itemCard} style={{ opacity: excluded ? 0.5 : 1 }}>
            <div className={s.itemHeader}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!excluded}
                  onChange={(e) => {
                    onUpdate({
                      ...overrides,
                      [key]: { ...ov, excluded: !e.target.checked },
                    });
                  }}
                />
                <span className={s.itemHeaderTitle}>{item.title}</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isEdited && <span className={s.badgeEdited}>Edited</span>}
                {isEdited && (
                  <button
                    type="button"
                    className={s.revertBtn}
                    onClick={() => {
                      const next = { ...overrides };
                      delete next[key];
                      onUpdate(next);
                    }}
                  >
                    Revert
                  </button>
                )}
              </div>
            </div>

            {!excluded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <input
                  className="cms-control"
                  style={{ fontSize: 12, padding: '6px 8px' }}
                  value={String(ov.title !== undefined ? ov.title : item.title)}
                  onChange={(e) => {
                    onUpdate({
                      ...overrides,
                      [key]: { ...ov, title: e.target.value },
                    });
                  }}
                  placeholder="Project title"
                />
                <textarea
                  className="cms-control"
                  rows={2}
                  style={{ fontSize: 12, padding: '6px 8px' }}
                  value={String(ov.shortDesc !== undefined ? ov.shortDesc : item.shortDesc)}
                  onChange={(e) => {
                    onUpdate({
                      ...overrides,
                      [key]: { ...ov, shortDesc: e.target.value },
                    });
                  }}
                  placeholder="Short description"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkillsSectionEditor({
  config,
  onUpdate,
}: {
  config: CvProfile['overrides']['skills'];
  onUpdate: (c: CvProfile['overrides']['skills']) => void;
}) {
  const selectedCats = config.selectedCategories?.length
    ? config.selectedCategories
    : portfolioData.skillCategories.map((c) => c.title);

  function toggleCategory(cat: string) {
    const next = selectedCats.includes(cat)
      ? selectedCats.filter((c) => c !== cat)
      : [...selectedCats, cat];
    onUpdate({ ...config, selectedCategories: next });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 12, color: 'var(--text-soft)', margin: 0 }}>
        Select which categories from your Toolkit to include on this CV:
      </p>
      {portfolioData.skillCategories.map((cat) => (
        <div key={cat.title} style={{ background: 'var(--surface)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={selectedCats.includes(cat.title)}
                onChange={() => toggleCategory(cat.title)}
              />
              <span style={{ fontWeight: 600 }}>{cat.title}</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{cat.coreTools.length} tools</span>
          </label>
        </div>
      ))}
    </div>
  );
}

function EducationSectionEditor({
  overrides,
  onUpdate,
}: {
  overrides: Record<string, CvItemOverride>;
  onUpdate: (o: Record<string, CvItemOverride>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {portfolioData.education.map((item, idx) => {
        const key = String(idx);
        const ov = overrides[key] || {};
        const excluded = ov.excluded === true;
        const isEdited = Boolean(ov.degree || ov.institution);

        return (
          <div key={idx} className={s.itemCard} style={{ opacity: excluded ? 0.5 : 1 }}>
            <div className={s.itemHeader}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!excluded}
                  onChange={(e) => {
                    onUpdate({
                      ...overrides,
                      [key]: { ...ov, excluded: !e.target.checked },
                    });
                  }}
                />
                <span className={s.itemHeaderTitle}>{item.degree}</span>
              </label>
              {isEdited && (
                <button
                  type="button"
                  className={s.revertBtn}
                  onClick={() => {
                    const next = { ...overrides };
                    delete next[key];
                    onUpdate(next);
                  }}
                >
                  Revert
                </button>
              )}
            </div>
            {!excluded && (
              <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>
                {item.institution} ({item.period})
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CertificationsSectionEditor({
  overrides,
  onUpdate,
}: {
  overrides: Record<string, CvItemOverride>;
  onUpdate: (o: Record<string, CvItemOverride>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {portfolioData.certifications.map((item, idx) => {
        const key = String(idx);
        const ov = overrides[key] || {};
        const excluded = ov.excluded === true;

        return (
          <div key={idx} className={s.itemCard} style={{ opacity: excluded ? 0.5 : 1 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!excluded}
                onChange={(e) => {
                  onUpdate({
                    ...overrides,
                    [key]: { ...ov, excluded: !e.target.checked },
                  });
                }}
              />
              <span className={s.itemHeaderTitle}>{item.name} — {item.issuer}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
}

function DesignTab({ profile, update }: { profile: CvProfile; update: (p: Partial<CvProfile>) => void }) {
  const d = profile.design;
  const updateDesign = (patch: Partial<CvProfile['design']>) => {
    update({ design: { ...d, ...patch } });
  };

  const templates = [
    { id: 'ats-classic', name: 'ATS Classic', desc: 'Single-column, high machine readability' },
    { id: 'modern-professional', name: 'Modern Professional', desc: 'Left accent mark and modern hierarchy' },
    { id: 'software-engineer', name: 'Software Engineer', desc: 'Skills & project tech upfront' },
    { id: 'full-stack-developer', name: 'Full Stack Developer', desc: 'Categorized technical layout' },
    { id: 'minimal-elegant', name: 'Minimal Elegant', desc: 'Spacious typography and light rules' },
    { id: 'compact-one-page', name: 'Compact One-Page', desc: 'Optimized for high-density 1-page CVs' },
    { id: 'executive-professional', name: 'Executive Professional', desc: 'Formal centered classical header' },
    { id: 'modern-two-column', name: 'Modern Two-Column', desc: '32% sidebar layout with main body' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Template Gallery */}
      <div>
        <label className="cms-field-label" style={{ marginBottom: 8, display: 'block' }}>
          Template Gallery
        </label>
        <div className={s.templateGrid}>
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className={`${s.templateCard} ${profile.templateId === tpl.id ? s.selected : ''}`}
              onClick={() => update({ templateId: tpl.id })}
            >
              <div className={s.templateMiniature}>
                <div className={s.miniHeader} style={{ background: profile.templateId === tpl.id ? d.primary : '#333' }} />
                <div className={s.miniLine} />
                <div className={s.miniLineShort} />
                <div className={s.miniLine} />
              </div>
              <strong style={{ fontSize: 12 }}>{tpl.name}</strong>
              <small style={{ fontSize: 10, color: 'var(--muted)' }}>{tpl.desc}</small>
            </div>
          ))}
        </div>
      </div>

      {/* "Fit to one page" Helper */}
      <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} color="var(--accent)" /> Fit to One Page Helper
          </strong>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-soft)' }}>
            Applies compact margins, tighter line-height, and standard 1-page typography.
          </p>
        </div>
        <button
          type="button"
          className="admin-button"
          onClick={() => {
            updateDesign({
              fontSize: 'compact',
              lineSpacing: 'tight',
              margins: 'compact',
            });
            alert('Applied compact 1-page spacing presets!');
          }}
        >
          Apply
        </button>
      </div>

      {/* Accent Color & Print Contrast Warning */}
      <div>
        <label className="cms-field-label">Accent Color</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <input
            type="color"
            value={d.primary}
            onChange={(e) => updateDesign({ primary: e.target.value })}
            style={{ width: 36, height: 36, padding: 2, background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' }}
          />
          <input
            type="text"
            className="cms-control"
            style={{ width: 110, fontFamily: 'var(--font-mono)', fontSize: 12 }}
            value={d.primary}
            onChange={(e) => updateDesign({ primary: e.target.value })}
          />
          <button
            type="button"
            className="admin-button"
            style={{ fontSize: 11 }}
            onClick={() => updateDesign({ primary: '#b5a2d8' })}
          >
            Default Lavender
          </button>
        </div>
        {/* Print-safe warning */}
        {d.primary.toLowerCase() === '#b5a2d8' && (
          <p style={{ fontSize: 11, color: '#e7a94b', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
            <AlertTriangle size={12} /> Lavender #b5a2d8 is styled for screens. For printed paper, headers automatically use crisp contrast.
          </p>
        )}
      </div>

      {/* Font Family */}
      <div>
        <label className="cms-field-label">Font Pair</label>
        <select
          className="cms-control"
          value={d.font}
          onChange={(e) => updateDesign({ font: e.target.value })}
        >
          <option value="Space Grotesk & Inter">Space Grotesk &amp; Inter (Portfolio Default)</option>
          <option value="Arial">Arial &amp; Helvetica (Clean ATS)</option>
          <option value="Calibri">Calibri (Classic Corporate)</option>
          <option value="Georgia">Georgia (Editorial Serif)</option>
          <option value="Times New Roman">Times New Roman (Academic)</option>
          <option value="JetBrains Mono">JetBrains Mono (Technical Monospace)</option>
        </select>
      </div>

      {/* Sizing & Spacing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div>
          <label className="cms-field-label">Font Size</label>
          <select
            className="cms-control"
            value={d.fontSize}
            onChange={(e) => updateDesign({ fontSize: e.target.value as 'compact' | 'normal' | 'relaxed' })}
          >
            <option value="compact">Compact (9pt)</option>
            <option value="normal">Normal (10pt)</option>
            <option value="relaxed">Relaxed (11pt)</option>
          </select>
        </div>

        <div>
          <label className="cms-field-label">Line Spacing</label>
          <select
            className="cms-control"
            value={d.lineSpacing}
            onChange={(e) => updateDesign({ lineSpacing: e.target.value as 'tight' | 'normal' | 'relaxed' })}
          >
            <option value="tight">Tight</option>
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </div>

        <div>
          <label className="cms-field-label">Margins</label>
          <select
            className="cms-control"
            value={d.margins}
            onChange={(e) => updateDesign({ margins: e.target.value as 'compact' | 'normal' | 'spacious' })}
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="spacious">Spacious</option>
          </select>
        </div>
      </div>

      {/* Bullet Style & Dividers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label className="cms-field-label">Bullet Style</label>
          <select
            className="cms-control"
            value={d.bulletStyle}
            onChange={(e) => updateDesign({ bulletStyle: e.target.value as 'disc' | 'circle' | 'square' | 'dash' })}
          >
            <option value="disc">• Standard Disc</option>
            <option value="circle">◦ Hollow Circle</option>
            <option value="square">▪ Solid Square</option>
            <option value="dash">- Dash</option>
          </select>
        </div>

        <div>
          <label className="cms-field-label">Dividers &amp; Icons</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={d.showDividers}
                onChange={(e) => updateDesign({ showDividers: e.target.checked })}
              />
              Section dividers
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={d.showIcons}
                onChange={(e) => updateDesign({ showIcons: e.target.checked })}
              />
              Contact icons
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobTargetTab({ profile, update }: { profile: CvProfile; update: (p: Partial<CvProfile>) => void }) {
  const jt = profile.jobTarget || { company: '', role: '', jobUrl: '', jobDescription: '', notes: '', keywords: [] };
  const updateJob = (patch: Partial<CvProfile['jobTarget']>) => {
    update({ jobTarget: { ...jt, ...patch } });
  };

  // Extract keywords from Job Description and match against CV text
  const keywordAnalysis = useMemo(() => {
    const jd = jt.jobDescription || '';
    if (!jd.trim()) return [];

    // Extract significant words (>3 chars, alphanumeric)
    const stopWords = new Set(['with', 'this', 'that', 'from', 'have', 'will', 'your', 'their', 'work', 'team', 'experience', 'about', 'more', 'what', 'when', 'join', 'role', 'skills']);
    const rawTokens = jd.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const counts: Record<string, number> = {};
    for (const t of rawTokens) {
      if (!stopWords.has(t)) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }

    // Top 20 keywords from JD
    const topKeywords = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);

    // Check if word appears anywhere in CV text
    const fullCvText = JSON.stringify(profile).toLowerCase();

    return topKeywords.map((kw) => ({
      keyword: kw,
      matched: fullCvText.includes(kw),
    }));
  }, [jt.jobDescription, profile]);

  const matchPercent = useMemo(() => {
    if (!keywordAnalysis.length) return 0;
    const matches = keywordAnalysis.filter((k) => k.matched).length;
    return Math.round((matches / keywordAnalysis.length) * 100);
  }, [keywordAnalysis]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label className="cms-field-label">Target Company</label>
          <input
            className="cms-control"
            value={jt.company}
            onChange={(e) => updateJob({ company: e.target.value })}
            placeholder="e.g. Acme Corp"
          />
        </div>
        <div>
          <label className="cms-field-label">Target Role</label>
          <input
            className="cms-control"
            value={jt.role}
            onChange={(e) => updateJob({ role: e.target.value })}
            placeholder="e.g. Lead Engineer"
          />
        </div>
      </div>

      <div>
        <label className="cms-field-label">Job Posting URL</label>
        <input
          className="cms-control"
          value={jt.jobUrl}
          onChange={(e) => updateJob({ jobUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="cms-field-label">Paste Job Description (JD)</label>
        <textarea
          rows={6}
          className="cms-control"
          value={jt.jobDescription}
          onChange={(e) => updateJob({ jobDescription: e.target.value })}
          placeholder="Paste full job specification to run keyword analysis against this CV…"
        />
      </div>

      {keywordAnalysis.length > 0 && (
        <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
          <legend style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase' }}>
            JD Keyword Matcher ({matchPercent}% Matched)
          </legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {keywordAnalysis.map((item) => (
              <span
                key={item.keyword}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: item.matched ? 'rgba(110,208,156,0.15)' : 'var(--bg-soft)',
                  color: item.matched ? '#6ed09c' : 'var(--muted)',
                  border: `1px solid ${item.matched ? '#6ed09c' : 'var(--border)'}`,
                }}
              >
                {item.matched ? <Check size={11} /> : '•'} {item.keyword}
              </span>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label className="cms-field-label">Application Notes</label>
        <textarea
          rows={3}
          className="cms-control"
          value={jt.notes}
          onChange={(e) => updateJob({ notes: e.target.value })}
          placeholder="Private notes about hiring manager, interview rounds, salary expectations…"
        />
      </div>
    </div>
  );
}

function VersionsTab({
  profile,
  onRestore,
  onCompare,
}: {
  profile: CvProfile;
  onRestore: (snapshot: unknown) => void;
  onCompare: (ver: CvVersion) => void;
}) {
  const versions = profile.versions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-soft)' }}>
        Snapshots are automatically created each time you save or export.
      </p>

      {versions.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
          No previous snapshots. Changes will appear here on next save.
        </p>
      ) : (
        versions.map((ver) => (
          <div
            key={ver.id}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong style={{ fontSize: 13, display: 'block' }}>{ver.name}</strong>
              <small style={{ color: 'var(--muted)', fontSize: 11 }}>
                {new Date(ver.createdAt).toLocaleString()} · {ver.note || 'Snapshot'}
              </small>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="admin-button"
                style={{ fontSize: 11, padding: '3px 8px', height: 28 }}
                onClick={() => onCompare(ver)}
              >
                Compare
              </button>
              <button
                type="button"
                className="admin-button primary"
                style={{ fontSize: 11, padding: '3px 8px', height: 28 }}
                onClick={() => onRestore(ver.snapshot)}
              >
                Restore
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function SyncPortfolioModal({
  profile,
  onApply,
  onClose,
}: {
  profile: CvProfile;
  onApply: (updatedOverrides: CvProfile['overrides'], updatedSummary?: string) => void;
  onClose: () => void;
}) {
  const [syncSummary, setSyncSummary] = useState(false);
  const [syncExperience, setSyncExperience] = useState(false);
  const [syncProjects, setSyncProjects] = useState(false);
  const [syncSkills, setSyncSkills] = useState(false);

  function handleSync() {
    const nextOverrides = { ...(profile.overrides || {}) };
    let nextSummary = profile.summary;

    if (syncSummary) {
      nextSummary = portfolioData.personal.bio;
    }
    if (syncExperience) {
      // Revert experience overrides
      nextOverrides.experience = {};
    }
    if (syncProjects) {
      // Revert project overrides
      nextOverrides.projects = {};
    }
    if (syncSkills) {
      nextOverrides.skills = {
        selectedCategories: portfolioData.skillCategories.map((c) => c.title),
        selectedSkills: portfolioData.skillCategories.flatMap((c) => c.coreTools),
        categoryLimits: {},
        customSkills: [],
      };
    }

    onApply(nextOverrides as CvProfile['overrides'], syncSummary ? nextSummary : undefined);
  }

  return (
    <div className={s.modalBackdrop} role="presentation">
      <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="sync-modal-title">
        <h2 id="sync-modal-title">Sync From Portfolio</h2>
        <p>
          Select which sections you want to refresh from live portfolio data. Any existing manual overrides in unchecked sections will be kept intact.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '8px 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={syncSummary} onChange={(e) => setSyncSummary(e.target.checked)} />
            Sync Summary bio
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={syncExperience} onChange={(e) => setSyncExperience(e.target.checked)} />
            Reset Experience items to latest portfolio roles
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={syncProjects} onChange={(e) => setSyncProjects(e.target.checked)} />
            Reset Projects to latest portfolio items
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={syncSkills} onChange={(e) => setSyncSkills(e.target.checked)} />
            Reset Toolkit categories to all current skills
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button type="button" className="admin-button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="admin-button primary" onClick={handleSync}>
            Apply Sync
          </button>
        </div>
      </div>
    </div>
  );
}
