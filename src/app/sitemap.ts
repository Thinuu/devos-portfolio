import type { MetadataRoute } from 'next';
import { portfolioData } from '@/lib/data';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://thinu.me').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    ...portfolioData.projects.map(({ id }) => ({
      url: `${siteUrl}/projects/${id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
