import type { Metadata } from 'next';
import PortfolioHome from '@/components/portfolio/PortfolioHome';
import { getDraftDesign, getPublishedDesign } from '@/lib/repositories/design.repository';
import { getDraftRelease } from '@/lib/repositories/portfolio.repository';
import { requireAdmin } from '@/lib/firebase/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin design preview',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DesignPreview({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ published?: string }>;
}) {
  try { await requireAdmin(); } catch { redirect('/admin/login'); }
  const { page } = await params;
  const { published } = await searchParams;
  const [design, release] = await Promise.all([
    published === '1' ? getPublishedDesign() : getDraftDesign(),
    getDraftRelease(),
  ]);
  const style = {
    '--bg': design.colors.bg,
    '--bg-soft': design.colors.bgSoft,
    '--surface': design.colors.surface,
    '--surface-raised': design.colors.surfaceRaised,
    '--border': design.colors.border,
    '--border-soft': design.colors.borderSoft,
    '--text': design.colors.text,
    '--text-soft': design.colors.textSoft,
    '--muted': design.colors.muted,
    '--accent': design.colors.accent,
    '--accent-soft': design.colors.accentSoft,
    '--container-max': `${design.layout.containerWidth}px`,
    '--card-radius': `${design.layout.radius}px`,
  } as React.CSSProperties;

  if (page === 'project') {
    return <main data-preview-mode="draft" style={style} className="design-preview-fallback"><h1>Project case-study preview</h1><p>Draft design variables are active.</p></main>;
  }
  if (page === '404') {
    return <main data-preview-mode="draft" style={style} className="design-preview-fallback"><h1>404</h1><p>This page could not be found.</p></main>;
  }
  return (
    <div data-preview-mode="draft" style={style}>
      <PortfolioHome data={release.content} animations={release.animations} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.addEventListener('message',(event)=>{if(event.origin!==window.location.origin||event.data?.type!=='design-preview-config')return;const c=event.data.config;if(!c?.colors)return;const r=document.documentElement;Object.entries({--bg:c.colors.bg,'--bg-soft':c.colors.bgSoft,'--surface':c.colors.surface,'--surface-raised':c.colors.surfaceRaised,'--border':c.colors.border,'--border-soft':c.colors.borderSoft,'--text':c.colors.text,'--text-soft':c.colors.textSoft,'--muted':c.colors.muted,'--accent':c.colors.accent,'--accent-soft':c.colors.accentSoft,'--container-max':c.layout.containerWidth+'px','--card-radius':c.layout.radius+'px'}).forEach(([k,v])=>r.style.setProperty(k,v));r.dataset.theme=c.mode;r.dataset.motion=(c.motion.pack||'subtle').toLowerCase();});`,
        }}
      />
    </div>
  );
}
