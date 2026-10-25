import type { MetadataRoute } from 'next';
import { portfolioData } from '@/lib/data';

const siteUrl = 'https://thinu-mu.vercel.app';

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
