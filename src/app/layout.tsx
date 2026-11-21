import type { Metadata } from 'next';
import '@/styles/globals.css';
import { portfolioData } from '@/lib/data';
import { getPublishedDesign } from '@/lib/repositories/design.repository';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://thinu.me').replace(/\/$/, '');

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: portfolioData.personal.name,
  jobTitle: 'Full-Stack Developer & Software Engineer',
  url: siteUrl,
  image: `${siteUrl}/images/thinu-profile.png`,
  sameAs: [portfolioData.personal.github, portfolioData.personal.linkedin],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Thinu Upadya | Full-Stack Developer & Software Engineer',
  description: 'Explore the portfolio of Thinu Upadya, a full-stack developer and software engineer building modern web applications, digital products, and thoughtful user experiences.',
  keywords: ['Thinu Upadya', 'Software Engineer', 'Full-Stack Developer', 'React', 'Node.js', 'Sri Lanka'],
  authors: [{ name: 'Thinu Upadya' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Thinu Upadya | Full-Stack Developer & Software Engineer',
    description: 'Engineering ideas. Crafting experiences. Explore the work of Thinu Upadya.',
    type: 'website',
    url: siteUrl,
    images: [{
      url: '/images/thinu-profile.png',
      width: 1024,
      height: 1024,
      alt: 'Thinu Upadya',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thinu Upadya | Full-Stack Developer & Software Engineer',
    description: 'Engineering ideas. Crafting experiences.',
    images: ['/images/thinu-profile.png'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const design = await getPublishedDesign();
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
  return (
    <html
      lang="en"
      data-theme={design.mode}
      data-motion={design.motion.pack.toLowerCase()}
      data-layout={design.layout.sectionSpacing}
      data-card={design.components.cardStyle}
      data-button={design.components.buttonStyle}
      data-nav={design.components.navStyle}
      data-bg={design.background.type}
      style={style}
    >
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
      </body>
    </html>
  );
}
