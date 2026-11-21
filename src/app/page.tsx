import PortfolioHome from '@/components/portfolio/PortfolioHome';
import { getPublishedRelease } from '@/lib/repositories/portfolio.repository';
import { defaultAnimationSettings, defaultDesignSettings } from '@/lib/schemas/portfolio.schema';
import { portfolioData } from '@/lib/data';

export const revalidate = 60;

export default async function Home() {
  const release = await getPublishedRelease();
  const content = release?.content ?? portfolioData;
  const design = release?.design ?? defaultDesignSettings;
  const animations = release?.animations ?? defaultAnimationSettings;

  const themeStyle = {
    '--bg': design.colors.background,
    '--bg-soft': design.colors.background,
    '--surface': design.colors.surface,
    '--surface-raised': design.colors.surface,
    '--border': design.colors.border,
    '--text': design.colors.text,
    '--text-soft': design.colors.muted,
    '--muted': design.colors.muted,
    '--accent': design.colors.primary,
    '--accent-soft': design.colors.secondary,
    '--container-max': `${design.maxWidth}px`,
    '--card-radius': `${design.radius}px`,
    '--animation-speed': `${animations.enabled ? animations.speed : 0}s`,
  } as React.CSSProperties;

  return (
    <div style={themeStyle}>
      <PortfolioHome data={content} animations={animations} />
    </div>
  );
}
