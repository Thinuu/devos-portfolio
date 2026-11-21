import { notFound } from 'next/navigation';
import PortfolioHome from '@/components/portfolio/PortfolioHome';
import { getDraftRelease } from '@/lib/repositories/portfolio.repository';

export const dynamic = 'force-dynamic';

export default async function DraftPreviewPage() {
  if (process.env.LOCAL_DRAFT_PREVIEW !== '1') notFound();
  const draft = await getDraftRelease();
  return <PortfolioHome data={draft.content} animations={draft.animations} />;
}
