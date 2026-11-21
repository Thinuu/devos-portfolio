import type { Metadata } from 'next';
import '@/styles/globals.css';
import { portfolioData } from '@/lib/data';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
