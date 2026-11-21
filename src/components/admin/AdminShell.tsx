'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3, BriefcaseBusiness, ChevronLeft, ChevronRight, FileText,
  FolderKanban, History, LayoutDashboard, LayoutTemplate, Mail, Menu,
  Palette, Settings, X, Image, Search, CalendarClock, ClipboardList,
  Rocket, Activity,
} from 'lucide-react';
import AdminLogout from '@/components/admin/AdminLogout';
import { readJsonResponse } from '@/lib/http/json';

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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState('Draft workspace');
  const [unpublishedChanges, setUnpublishedChanges] = useState(0);
  const [publishedTime, setPublishedTime] = useState<Date | null>(null);
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

  function requestPublish() {
    window.dispatchEvent(new CustomEvent('admin-publish-request'));
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
          <span className="admin-breadcrumb">{pathname === '/admin' ? 'Workspace / Dashboard' : pathname.startsWith('/admin/content') ? `Workspace / Content manager${pathname.split('/')[3] ? ` / ${pathname.split('/')[3].replace(/^\w/, (letter) => letter.toUpperCase())}` : ''}` : `Workspace / ${pathname.split('/').pop()?.replace(/-/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase())}`}</span>
          <div className="admin-topbar-actions">
            <span className="admin-status-chip" title={publishedTime ? publishedTime.toLocaleString() : undefined}><span /> {publishedTime ? `Published · ${formatPublished(publishedTime)}` : publishStatus} <strong className="admin-change-count">{unpublishedChanges} unpublished change{unpublishedChanges === 1 ? '' : 's'}</strong></span>
            <a href="/" target="_blank" rel="noreferrer">Preview</a>
            <button className="admin-topbar-publish" type="button" onClick={requestPublish}>Publish</button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
