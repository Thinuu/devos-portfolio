'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText, Plus, Copy, Trash2, Edit3, Globe, Search, ArrowUpRight,
  CheckCircle2, AlertCircle, RefreshCw, Layers,
} from 'lucide-react';
import { readJsonResponse } from '@/lib/http/json';
import type { CvProfile } from '@/lib/schemas/career.schema';
import s from './cv-list.module.css';

export default function CvStudioListPage() {
  const [profiles, setProfiles] = useState<CvProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all');

  // Modals state
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newMode, setNewMode] = useState<'portfolio' | 'blank'>('portfolio');
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [creating, setCreating] = useState(false);

  const [renameTarget, setRenameTarget] = useState<CvProfile | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<CvProfile | null>(null);
  const [publicConfirmTarget, setPublicConfirmTarget] = useState<CvProfile | null>(null);
  const [publishPublicModalOpen, setPublishPublicModalOpen] = useState(false);
  const [publicActionBusy, setPublicActionBusy] = useState(false);
  const [publicInfo, setPublicInfo] = useState<{ publicProfile: CvProfile | null; publicUrl: string; fileStats: { mtime: string; size: number } | null } | null>(null);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [listRes, pubRes] = await Promise.all([
        fetch('/api/admin/cv'),
        fetch('/api/admin/cv/public'),
      ]);

      if (listRes.ok) {
        const data = await readJsonResponse<{ profiles?: CvProfile[] }>(listRes);
        setProfiles(data?.profiles || []);
      } else {
        setError('Failed to load CV profiles.');
      }

      if (pubRes.ok) {
        const pubData = await readJsonResponse<{
          publicProfile: CvProfile | null;
          publicUrl: string;
          fileStats: { mtime: string; size: number } | null;
        }>(pubRes);
        setPublicInfo(pubData || null);
      }
    } catch {
      setError('Network error while loading CV profiles.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateCv(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          mode: newMode,
          targetTitle: newTitle.trim(),
          company: newCompany.trim(),
        }),
      });
      if (res.ok) {
        const data = await readJsonResponse<{ profile: CvProfile }>(res);
        setNewModalOpen(false);
        setNewName('');
        setNewTitle('');
        setNewCompany('');
        if (data?.profile?.id) {
          window.location.assign(`/admin/cv-studio/${data.profile.id}`);
          return;
        }
        loadData();
      } else {
        alert('Failed to create CV profile.');
      }
    } catch {
      alert('Error creating CV profile.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDuplicate(p: CvProfile) {
    const copyName = prompt(`Enter name for copy of "${p.name}":`, `${p.name} (Copy)`);
    if (!copyName || !copyName.trim()) return;

    try {
      const res = await fetch(`/api/admin/cv/${p.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: copyName.trim() }),
      });
      if (res.ok) {
        loadData();
      } else {
        alert('Failed to duplicate CV profile.');
      }
    } catch {
      alert('Error duplicating CV profile.');
    }
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;
    try {
      const res = await fetch(`/api/admin/cv/${renameTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (res.ok) {
        setRenameTarget(null);
        loadData();
      } else {
        alert('Failed to rename CV profile.');
      }
    } catch {
      alert('Error renaming CV profile.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/cv/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        loadData();
      } else {
        alert('Failed to delete CV profile.');
      }
    } catch {
      alert('Error deleting CV profile.');
    }
  }

  async function handleSetPublic() {
    if (!publicConfirmTarget) return;
    try {
      const res = await fetch(`/api/admin/cv/${publicConfirmTarget.id}/public`, { method: 'POST' });
      if (res.ok) {
        setPublicConfirmTarget(null);
        loadData();
      } else {
        alert('Failed to set public CV.');
      }
    } catch {
      alert('Error setting public CV.');
    }
  }

  async function handlePublishPublicCv() {
    const targetCvId = publicInfo?.publicProfile?.id || profiles.find((p) => p.isPublic)?.id || profiles[0]?.id;
    if (!targetCvId) {
      alert('No CV selected for publication.');
      return;
    }

    setPublicActionBusy(true);
    try {
      const res = await fetch('/api/admin/cv/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId: targetCvId }),
      });
      if (res.ok) {
        setPublishPublicModalOpen(false);
        loadData();
        alert('Public CV PDF generated and published to live website!');
      } else {
        alert('Failed to publish public CV.');
      }
    } catch {
      alert('Error publishing public CV.');
    } finally {
      setPublicActionBusy(false);
    }
  }

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.targetTitle || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.jobTarget?.company || '').toLowerCase().includes(search.toLowerCase());
    const matchesTemplate = templateFilter === 'all' || p.templateId === templateFilter;
    return matchesSearch && matchesTemplate;
  });

  const currentPublicCv = profiles.find((p) => p.isPublic) || publicInfo?.publicProfile;

  return (
    <div className={s.container}>
      {/* Top Header */}
      <div className={s.header}>
        <div className={s.headerTitle}>
          <p className="admin-eyebrow">Career &amp; Documents</p>
          <h1>CV &amp; Resume Studio</h1>
          <p>Create targeted, versioned CVs with full portfolio override control.</p>
        </div>
        <div className={s.headerActions}>
          <button
            type="button"
            className="admin-button primary"
            onClick={() => {
              setNewName('');
              setNewTitle('');
              setNewCompany('');
              setNewModalOpen(true);
            }}
          >
            <Plus size={16} /> New CV
          </button>
        </div>
      </div>

      {/* Public CV Banner */}
      <div className={s.publicStatusBanner}>
        <div className={s.publicStatusInfo}>
          <span className={s.publicStatusLabel}>
            <Globe size={14} /> Live Public CV
          </span>
          <p className={s.publicStatusTitle}>
            {currentPublicCv ? currentPublicCv.name : 'Default Portfolio CV'}
          </p>
          <p className={s.publicStatusMeta}>
            Served at {publicInfo?.publicUrl || '/THINU_UPADYA_CV_Updated.pdf'}
            {publicInfo?.fileStats?.mtime
              ? ` · Generated ${new Date(publicInfo.fileStats.mtime).toLocaleDateString()}`
              : ''}
          </p>
        </div>
        <button
          type="button"
          className="admin-button"
          onClick={() => setPublishPublicModalOpen(true)}
        >
          <RefreshCw size={14} /> Publish Public CV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={s.controlsBar}>
        <div className={s.searchBox}>
          <Search size={16} className={s.searchIcon} />
          <input
            type="text"
            placeholder="Search by CV name, target title, or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={s.filterSelect}
          value={templateFilter}
          onChange={(e) => setTemplateFilter(e.target.value)}
        >
          <option value="all">All Templates</option>
          <option value="ats-classic">ATS Classic</option>
          <option value="modern-professional">Modern Professional</option>
          <option value="software-engineer">Software Engineer</option>
          <option value="full-stack-developer">Full Stack Developer</option>
          <option value="minimal-elegant">Minimal Elegant</option>
          <option value="compact-one-page">Compact One-Page</option>
          <option value="executive-professional">Executive Professional</option>
          <option value="modern-two-column">Modern Two-Column</option>
        </select>
      </div>

      {/* Content Area */}
      {loading ? (
        <p className="admin-status">Loading CV profiles…</p>
      ) : error ? (
        <p className="admin-error">{error}</p>
      ) : filtered.length === 0 ? (
        <div className={s.emptyState}>
          <FileText size={36} color="var(--muted)" />
          <h3>No CV profiles match your query</h3>
          <p>Create a new targeted CV or adjust your search filters above.</p>
        </div>
      ) : (
        <div className={s.grid}>
          {filtered.map((cv) => (
            <article key={cv.id} className={s.card}>
              <div className={s.cardTop}>
                <div className={s.cardBadges}>
                  {cv.isPublic && (
                    <span className={s.badgePublic}>
                      <Globe size={11} /> Public CV
                    </span>
                  )}
                  <span className={s.badgeTemplate}>
                    {cv.templateId.replace(/-/g, ' ')}
                  </span>
                </div>
                <span className={s.badgeVersion}>
                  v{cv.versionCount || 1}
                </span>
              </div>

              <div>
                <h3 className={s.cardTitle}>{cv.name}</h3>
                {cv.targetTitle && <p className={s.cardRole}>{cv.targetTitle}</p>}
                {cv.jobTarget?.company && (
                  <p className={s.cardCompany}>Target: {cv.jobTarget.company}</p>
                )}
              </div>

              <div className={s.cardFooter}>
                <span className={s.cardMeta}>
                  {new Date(cv.updatedAt).toLocaleDateString()}
                </span>
                <div className={s.cardActions}>
                  <button
                    type="button"
                    className={s.actionBtn}
                    title="Duplicate CV"
                    onClick={() => handleDuplicate(cv)}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    className={s.actionBtn}
                    title="Rename CV"
                    onClick={() => {
                      setRenameTarget(cv);
                      setRenameValue(cv.name);
                    }}
                  >
                    <Edit3 size={14} />
                  </button>
                  {!cv.isPublic && (
                    <button
                      type="button"
                      className={s.actionBtn}
                      title="Set as Public CV"
                      onClick={() => setPublicConfirmTarget(cv)}
                    >
                      <Globe size={14} />
                    </button>
                  )}
                  {profiles.length > 1 && (
                    <button
                      type="button"
                      className={s.actionBtn}
                      title="Delete CV"
                      onClick={() => setDeleteTarget(cv)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <Link href={`/admin/cv-studio/${cv.id}`} className={s.openBtn}>
                    Open <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* New CV Modal */}
      {newModalOpen && (
        <div className={s.modalBackdrop} role="presentation">
          <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="new-cv-title">
            <h2 id="new-cv-title">Create New CV</h2>
            <p>Choose whether to start with your portfolio data or a blank template.</p>

            <form onSubmit={handleCreateCv} className={s.modalForm}>
              <div>
                <label className="cms-field-label">Start with:</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="mode"
                      value="portfolio"
                      checked={newMode === 'portfolio'}
                      onChange={() => setNewMode('portfolio')}
                    />
                    Populate from portfolio
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="mode"
                      value="blank"
                      checked={newMode === 'blank'}
                      onChange={() => setNewMode('blank')}
                    />
                    Blank document
                  </label>
                </div>
              </div>

              <div>
                <label className="cms-field-label" htmlFor="cv-name">CV Name *</label>
                <input
                  id="cv-name"
                  type="text"
                  required
                  className="cms-control"
                  placeholder="e.g. Senior Frontend Engineer - Fintech"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="cms-field-label" htmlFor="cv-target-role">Target Role (optional)</label>
                <input
                  id="cv-target-role"
                  type="text"
                  className="cms-control"
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="cms-field-label" htmlFor="cv-target-company">Target Company (optional)</label>
                <input
                  id="cv-target-company"
                  type="text"
                  className="cms-control"
                  placeholder="e.g. Stripe"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                />
              </div>

              <div className={s.modalActions}>
                <button
                  type="button"
                  className="admin-button"
                  onClick={() => setNewModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button primary"
                  disabled={creating || !newName.trim()}
                >
                  {creating ? 'Creating…' : 'Create & Open'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className={s.modalBackdrop} role="presentation">
          <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="rename-title">
            <h2 id="rename-title">Rename CV</h2>
            <form onSubmit={handleRename} className={s.modalForm}>
              <input
                type="text"
                required
                className="cms-control"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
              />
              <div className={s.modalActions}>
                <button type="button" className="admin-button" onClick={() => setRenameTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-button primary" disabled={!renameValue.trim()}>
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={s.modalBackdrop} role="presentation">
          <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <h2 id="delete-title">Delete CV Profile</h2>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className={s.modalActions}>
              <button type="button" className="admin-button" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-button"
                style={{ background: '#e98a95', color: '#111', borderColor: '#e98a95' }}
                onClick={handleDelete}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set as Public CV Confirmation Modal */}
      {publicConfirmTarget && (
        <div className={s.modalBackdrop} role="presentation">
          <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="public-title">
            <h2 id="public-title">Set as Public CV</h2>
            <p>
              Mark <strong>{publicConfirmTarget.name}</strong> as the active public CV? To update the live download on the portfolio site, you will also need to click &ldquo;Publish Public CV&rdquo;.
            </p>
            <div className={s.modalActions}>
              <button type="button" className="admin-button" onClick={() => setPublicConfirmTarget(null)}>
                Cancel
              </button>
              <button type="button" className="admin-button primary" onClick={handleSetPublic}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Public CV Modal */}
      {publishPublicModalOpen && (
        <div className={s.modalBackdrop} role="presentation">
          <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="publish-modal-title">
            <h2 id="publish-modal-title">Publish Live Public CV</h2>
            <p>
              This will generate a fresh PDF from{' '}
              <strong>{currentPublicCv ? currentPublicCv.name : 'the default profile'}</strong> and replace the live PDF served by all &ldquo;Download CV&rdquo; buttons across the website.
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              Target: /THINU_UPADYA_CV_Updated.pdf
            </p>
            <div className={s.modalActions}>
              <button
                type="button"
                className="admin-button"
                onClick={() => setPublishPublicModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-button primary"
                disabled={publicActionBusy}
                onClick={handlePublishPublicCv}
              >
                {publicActionBusy ? 'Generating & Publishing…' : 'Confirm & Publish to Site'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
