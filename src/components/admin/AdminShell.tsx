'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3, BriefcaseBusiness, ChevronLeft, ChevronRight, FileText,
  FolderKanban, History, LayoutDashboard, LayoutTemplate, Mail, Menu,
  Palette, Settings, X, Image, Search, CalendarClock, ClipboardList,
  Rocket, Activity, FileDown,
} from 'lucide-react';
import AdminLogout from '@/components/admin/AdminLogout';
import { readJsonResponse } from '@/lib/http/json';
import type { PortfolioRelease } from '@/lib/schemas/portfolio.schema';

const routeTitles: Record<string, string> = {
  seo: 'SEO', media: 'Media library', design: 'Design studio', publishing: 'Publishing & versions',
  'cv-studio': 'CV Studio', 'cv-templates': 'CV templates', 'cover-letters': 'Cover letters',
  'job-applications': 'Job applications', 'follow-ups': 'Follow-ups', documents: 'Documents',
};
const sectionTitles: Record<string, string> = {
  personal: 'Profile', skillCategories: 'Toolkit', workflow: 'Workflow',
};

function breadcrumb(pathname: string) {
  if (pathname === '/admin') return 'Workspace / Dashboard';
  if (pathname.startsWith('/admin/content')) {
    const section = pathname.split('/')[3];
    const label = section ? sectionTitles[section] || section.replace(/-/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase()) : '';
    return `Workspace / Content manager${label ? ` / ${label}` : ''}`;
  }
  const slug = pathname.split('/').filter(Boolean).pop() || '';
  return `Workspace / ${routeTitles[slug] || slug.replace(/-/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase())}`;
}

function displayDiff(value: unknown) {
  const serialized = JSON.stringify(value ?? null, null, 2);
  return serialized.length > 1400 ? `${serialized.slice(0, 1400)}\n…` : serialized;
}

const groups = [
  {
    label: 'Overview',
    links: [['Dashboard', '/admin', LayoutDashboard]] as const,
  },
  {
    label: 'Portfolio',
    links: [
      ['Content manager', '/admin/content', FolderKanban],
      ['Design studio', '/admin/design', Palette],
      ['Media library', '/admin/media', Image],
      ['SEO', '/admin/seo', Search],
      ['Publishing & versions', '/admin/publishing', Rocket],
    ] as const,
  },
  {
    label: 'Career & documents',
    links: [
      ['CV Studio', '/admin/cv-studio', FileText],
      ['CV templates', '/admin/cv-templates', LayoutTemplate],
      ['Documents', '/admin/documents', FileDown],
      ['Cover letters', '/admin/cover-letters', Mail],
      ['Job applications', '/admin/job-applications', BriefcaseBusiness],
      ['Interviews', '/admin/interviews', CalendarClock],
      ['Follow-ups', '/admin/follow-ups', ClipboardList],
    ] as const,
  },
  {
    label: 'Insights',
    links: [
      ['Analytics', '/admin/analytics', BarChart3],
      ['Activity log', '/admin/activity', Activity],
      ['Settings', '/admin/settings', Settings],
    ] as const,
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/admin';
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState('Draft workspace');
  const [unpublishedChanges, setUnpublishedChanges] = useState(0);
  const [publishedTime, setPublishedTime] = useState<Date | null>(null);
  const [publishReview, setPublishReview] = useState<{ draft: PortfolioRelease; published: PortfolioRelease | null } | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishConfirmed, setPublishConfirmed] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishFailures, setPublishFailures] = useState<Array<{ tab: string; item: string; field: string; message: string }>>([]);
  const [publishToast, setPublishToast] = useState('');
  const formatPublished = (date: Date) => new Intl.DateTimeFormat(undefined, {
    day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(date);

  useEffect(() => {
    Promise.all([fetch('/api/admin/draft'), fetch('/api/admin/publish')]).then(async ([draftResponse, publishResponse]) => {
      if (!draftResponse.ok) return;
      const draft = await draftResponse.json();
      if (publishResponse.ok) {
        const published = await readJsonResponse<{ content?: unknown; publishedAt?: string }>(publishResponse);
        setUnpublishedChanges(JSON.stringify(draft.content) === JSON.stringify(published?.content) ? 0 : 1);
        if (published?.publishedAt) {
          const date = new Date(published.publishedAt);
          if (!Number.isNaN(date.getTime())) setPublishedTime(date);
        }
      } else {
        setUnpublishedChanges(1);
      }
    }).catch(() => setUnpublishedChanges(0));
    function changed(event: Event) {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      setUnpublishedChanges((count) => count + (detail?.count ?? 1));
    }
    function published(event: Event) {
      setUnpublishedChanges(0);
      const detail = (event as CustomEvent<{ time?: string }>).detail;
      if (detail?.time) {
        const date = new Date(detail.time);
        if (!Number.isNaN(date.getTime())) setPublishedTime(date);
      }
      setPublishStatus('Published');
    }
    window.addEventListener('admin-draft-changed', changed);
    window.addEventListener('admin-published', published);
    return () => {
      window.removeEventListener('admin-draft-changed', changed);
      window.removeEventListener('admin-published', published);
    };
  }, []);

  async function requestPublish() {
    setPublishLoading(true);
    setPublishError('');
    setPublishFailures([]);
    setPublishConfirmed(false);
    try {
      const [draftResponse, publishedResponse] = await Promise.all([fetch('/api/admin/draft'), fetch('/api/admin/publish')]);
      if (!draftResponse.ok) throw new Error('Unable to load the current draft for review.');
      const draft = await readJsonResponse<PortfolioRelease>(draftResponse);
      const published = publishedResponse.ok ? await readJsonResponse<PortfolioRelease>(publishedResponse) : null;
      if (!draft?.content) throw new Error('The draft response was empty or invalid.');
      setPublishReview({ draft, published });
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Unable to open the publish review.');
    } finally {
      setPublishLoading(false);
    }
  }

  async function confirmPublish() {
    if (!publishReview || !publishConfirmed) return;
    setPublishLoading(true);
    setPublishError('');
    setPublishFailures([]);
    try {
      const response = await fetch('/api/admin/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(publishReview.draft) });
      const result = await readJsonResponse<{ error?: string; publishedAt?: string; failures?: typeof publishFailures }>(response);
      if (!response.ok) {
        setPublishFailures(result?.failures || []);
        throw new Error(result?.error || 'Publishing failed.');
      }
      const date = result?.publishedAt ? new Date(result.publishedAt) : new Date();
      setPublishedTime(date);
      setPublishStatus('Published');
      setUnpublishedChanges(0);
      setPublishReview(null);
      setPublishToast('Portfolio published successfully.');
      window.dispatchEvent(new CustomEvent('admin-published', { detail: { time: date.toISOString() } }));
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Unable to publish the draft.');
    } finally {
      setPublishLoading(false);
    }
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className={`admin-shell${collapsed ? ' is-collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      <button className="admin-mobile-toggle" type="button" aria-label="Open admin navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
      <aside className="admin-sidebar">
        <div className="admin-brand-row">
          <div className="admin-brand">TU <span>CMS</span></div>
          <button className="admin-collapse" type="button" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} onClick={() => setCollapsed((value) => !value)}>
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
          <button className="admin-mobile-close" type="button" aria-label="Close admin navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
        <nav className="admin-nav-groups" aria-label="Admin navigation">
          {groups.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <span className="admin-nav-label">{group.label}</span>
              {group.links.map(([label, href, Icon]) => (
                <Link className={isActive(href) ? 'is-active' : ''} aria-current={isActive(href) ? 'page' : undefined} href={href} key={href} title={collapsed ? label : undefined} onClick={() => setMobileOpen(false)}>
                  <Icon size={17} /><span>{label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <AdminLogout />
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <span className="admin-breadcrumb">{breadcrumb(pathname)}</span>
          <div className="admin-topbar-actions">
            {!pathname.startsWith('/admin/cv-') && !pathname.startsWith('/admin/documents') && (
              <>
                <span className="admin-status-chip" title={publishedTime ? publishedTime.toLocaleString() : undefined}>
                  <span /> {publishedTime ? `Published · ${formatPublished(publishedTime)}` : publishStatus}{' '}
                  <strong className="admin-change-count">{unpublishedChanges} unpublished change{unpublishedChanges === 1 ? '' : 's'}</strong>
                </span>
                <a href="/" target="_blank" rel="noreferrer">Preview</a>
                <button className="admin-topbar-publish" type="button" onClick={requestPublish} disabled={publishLoading}>
                  {publishLoading ? 'Loading…' : 'Publish'}
                </button>
              </>
            )}
          </div>
        </div>
        {children}
      </main>
      {publishReview && (() => {
        const before = publishReview.published?.content as unknown as Record<string, unknown> | undefined;
        const after = publishReview.draft.content as unknown as Record<string, unknown>;
        const keys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after)]));
        const changed = keys.filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after[key]));
        const labels: Record<string, string> = { personal: 'Profile', skillCategories: 'Toolkit', sections: 'Section visibility', navigation: 'Navigation', footer: 'Footer', familiarityNote: 'Toolkit note' };
        return <div className="cms-dialog-backdrop" role="presentation"><section className="cms-dialog cms-publish-review" role="dialog" aria-modal="true" aria-labelledby="global-publish-title">
          <p className="admin-eyebrow">Review changes</p><h2 id="global-publish-title">Publish portfolio</h2>
          <p>Confirm the draft changes below before replacing the published portfolio.</p>
          {changed.length ? <div className="cms-diff cms-review-diff">{changed.map((key) => <details key={key}><summary><strong>{labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^\w/, (letter) => letter.toUpperCase())}</strong></summary><div className="cms-review-values"><div><span>Published</span><pre>{displayDiff(before?.[key])}</pre></div><div><span>Draft</span><pre>{displayDiff(after[key])}</pre></div></div></details>)}</div> : <p className="cms-review-no-changes">No content differences from the current published release.</p>}
          <label className="cms-review-confirm"><input type="checkbox" checked={publishConfirmed} onChange={(event) => setPublishConfirmed(event.target.checked)} /> I reviewed these changes and want to publish them.</label>
          {publishError && <p className="cms-field-error" role="alert">{publishError}</p>}
          {publishFailures.length > 0 && <ul className="cms-review-failures">{publishFailures.map((failure, index) => <li key={`${failure.tab}-${failure.field}-${index}`}>{failure.tab} &gt; {failure.item} &gt; {failure.field}: {failure.message}</li>)}</ul>}
          <div className="cms-dialog-actions"><button className="admin-button" type="button" onClick={() => setPublishReview(null)}>Cancel</button><button className="admin-button primary" type="button" disabled={!publishConfirmed || publishLoading} onClick={() => void confirmPublish()}>{publishLoading ? 'Publishing…' : 'Confirm publish'}</button></div>
        </section></div>;
      })()}
      {publishToast && <div className="cms-toast success" role="status">{publishToast}<button type="button" onClick={() => setPublishToast('')}>Dismiss</button></div>}
    </div>
  );
}
