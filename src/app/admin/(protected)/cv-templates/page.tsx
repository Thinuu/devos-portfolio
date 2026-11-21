import { getCvTemplates } from '@/lib/repositories/career.repository';
export default async function CvTemplates() {
  const templates = await getCvTemplates();
  return <><header className="admin-header"><div><p className="admin-eyebrow">CV Studio</p><h1>Template gallery</h1></div></header><div className="admin-grid">{templates.map((template) => <article className="admin-card" key={template.id}><span>{template.atsCompatible ? 'ATS compatible' : 'Visual layout'}</span><strong>{template.name}</strong><small>{template.description}</small></article>)}</div></>;
}
