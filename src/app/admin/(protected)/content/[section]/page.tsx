import ContentManager from '@/components/admin/ContentManager';

const sections = ['Profile','Hero','About','Projects','Skills','Tools','Experience','Education','Certifications','Timeline','Stats','Workflow','Terminal','Contact'] as const;

export default async function ContentSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const label = sections.find((item) => item.toLowerCase() === section) ?? 'Profile';
  return <ContentManager section={label} />;
}
