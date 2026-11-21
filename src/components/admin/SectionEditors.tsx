'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RepeaterField, { type RepeaterItem } from '@/components/admin/RepeaterField';
import ImageUpload from '@/components/admin/ImageUpload';
import type { PortfolioRelease } from '@/lib/schemas/portfolio.schema';

const heroSchema = z.object({
  eyebrow: z.string().min(1).max(200),
  heading: z.string().min(1).max(500),
  description: z.string().min(1).max(2000),
  supporting: z.string().max(2000),
  profileImage: z.string().min(1).max(500),
  profileImageAlt: z.string().max(160).optional(),
  primaryCtaLabel: z.string().max(80).optional(),
  primaryCtaLink: z.union([z.string().url(), z.literal('')]).optional(),
  secondaryCtaLabel: z.string().max(80).optional(),
  secondaryCtaLink: z.union([z.string().url(), z.literal('')]).optional(),
  layout: z.enum(['split', 'centered', 'terminal', 'minimal']).optional(),
});

type HeroValue = z.infer<typeof heroSchema>;
const aboutSchema = z.object({
  title: z.string().min(1).max(200),
  paragraphs: z.array(z.string().min(1).max(2000)).min(1).max(20),
  highlights: z.array(z.object({ title: z.string().min(1).max(160), description: z.string().min(1).max(1000), hidden: z.boolean().optional() })).max(20).optional(),
  portraitImage: z.string().max(500).optional(),
  portraitAlt: z.string().max(160).optional(),
});

function AdvancedJson({ value, onApply, title, validate }: { value: unknown; onApply: (value: unknown) => void; title: string; validate?: (value: unknown) => { success: boolean; error?: z.ZodError } }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => setText(JSON.stringify(value, null, 2)), [value]);
  return (
    <details className="cms-advanced" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Advanced: edit {title} as JSON</summary>
      <textarea className="cms-json" rows={14} value={text} onChange={(event) => setText(event.target.value)} />
      <button type="button" className="admin-button" onClick={() => {
        try {
          const parsed = JSON.parse(text);
          const checked = validate?.(parsed);
          if (checked && !checked.success) {
            setError(checked.error?.issues.map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`).join(' | ') || 'Invalid value. Check required fields and types.');
            return;
          }
          onApply(parsed); setError('');
        } catch { setError('Invalid JSON or schema format.'); }
      }}>Apply JSON</button>
      {error && <small className="admin-error">{error}</small>}
    </details>
  );
}

type RepeatRow = RepeaterItem & Record<string, unknown>;

export function AboutEditor({ draft, update }: { draft: PortfolioRelease; update: (next: PortfolioRelease) => void }) {
  const record = draft.content as unknown as Record<string, unknown>;
  const value = (record.about as {
    title?: string;
    paragraphs?: string[];
    highlights?: Array<{ title: string; description: string; hidden?: boolean }>;
    portraitImage?: string;
    portraitAlt?: string;
  } | undefined) ?? { title: '' };
  const paragraphs = value.paragraphs?.length ? value.paragraphs : [];

  function patchAbout(patch: Record<string, unknown>) {
    update({ ...draft, content: { ...draft.content, about: { ...value, ...patch } } as PortfolioRelease['content'] });
  }

  return (
    <div className="cms-profile-layout">
      <div className="cms-form">
        {!record.about && <p className="cms-warning">Existing About data was missing; safe defaults are shown.</p>}
        <label><span>Heading <b>*</b></span><input value={value.title || ''} maxLength={200} onChange={(event) => patchAbout({ title: event.target.value })} /></label>
        <RepeaterField
          title="Paragraphs"
          items={paragraphs.map((text, index) => ({ id: `paragraph-${index}`, text }))}
          onChange={(rows) => patchAbout({ paragraphs: rows.map((row) => String(row.text ?? '')) })}
          createItem={() => ({ id: `paragraph-${Date.now()}`, text: '' })}
          itemLabel="Paragraph"
          emptyTitle="No paragraphs yet"
          emptyDescription="Paragraphs form the main About text. Add one or more short sections."
          getSummary={(row) => String(row.text || '').slice(0, 48) || 'Untitled paragraph'}
          renderItem={(row, _index, patch) => <label><span>Paragraph</span><textarea rows={4} maxLength={2000} value={String(row.text ?? '')} onChange={(event) => patch({ text: event.target.value })} /><small className="cms-character-count">{String(row.text ?? '').length}/2000</small></label>}
        />
        <RepeaterField
          title="Highlights"
          items={(value.highlights ?? []).map((row, index) => ({ id: `highlight-${index}`, ...row }))}
          onChange={(rows) => patchAbout({ highlights: rows.map(({ id: _id, ...row }) => row) })}
          createItem={() => ({ id: `highlight-${Date.now()}`, title: '', description: '' })}
          itemLabel="Highlight"
          emptyTitle="No highlights yet"
          emptyDescription="Highlights appear as short bullet points beside your About text."
          getSummary={(row) => String(row.title || row.description || '') || 'Untitled highlight'}
          renderItem={(row, _index, patch) => <div className="cms-form-grid"><label><span>Title <b>*</b></span><input value={String(row.title ?? '')} onChange={(event) => patch({ title: event.target.value })} /></label><label><span>Description</span><textarea rows={3} value={String(row.description ?? '')} onChange={(event) => patch({ description: event.target.value })} /></label></div>}
        />
        <ImageUpload
          label="Portrait"
          value={value.portraitImage}
          alt={value.portraitAlt}
          fallback="/images/thinu-profile.png"
          onChange={(path) => patchAbout({ portraitImage: path })}
          onAltChange={(alt) => patchAbout({ portraitAlt: alt })}
        />
        <AdvancedJson title="About" value={value} validate={(next) => aboutSchema.safeParse(next)} onApply={(next) => update({ ...draft, content: { ...draft.content, about: next as never } })} />
      </div>
      <Preview title="About preview"><h3>{value.title}</h3>{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</Preview>
    </div>
  );
}

export function RepeatEditor({ draft, update, section }: {
  draft: PortfolioRelease;
  update: (next: PortfolioRelease) => void;
  section: 'Stats' | 'Timeline' | 'Tools' | 'Workflow' | 'Terminal' | 'Contact' | 'Skills' | 'Experience' | 'Education' | 'Certifications';
}) {
  const record = draft.content as unknown as Record<string, unknown>;
  let items: RepeatRow[] = [];

  if (section === 'Stats') items = ((record.stats as RepeatRow[] | undefined) ?? []).map((row, index) => ({ ...row, id: String(row.id ?? `stat-${index}`) }));
  if (section === 'Timeline') items = ((record.timeline as RepeatRow[] | undefined) ?? []).map((row, index) => ({ ...row, id: String(row.id ?? `timeline-${index}`) }));
  if (section === 'Tools') items = ((record.tools as RepeatRow[] | undefined) ?? []).map((row, index) => ({ ...row, id: String(row.id ?? `tool-${index}`) }));
  if (section === 'Workflow') items = ((record.workflow as RepeatRow[] | undefined) ?? []).map((row, index) => ({ ...row, id: String(row.id ?? `workflow-${index}`) }));
  if (section === 'Experience') items = ((record.experience as RepeatRow[] | undefined) ?? []).map((row, index) => ({ ...row, id: String(row.id ?? `experience-${index}`) }));
  if (section === 'Education') items = ((record.education as RepeatRow[] | undefined) ?? []).map((row, index) => ({ ...row, id: String(row.id ?? `education-${index}`) }));
  if (section === 'Certifications') items = ((record.certifications as RepeatRow[] | undefined) ?? []).map((row, index) => ({ ...row, id: String(row.id ?? `certification-${index}`) }));
  if (section === 'Contact') items = (((record.contact as { links?: RepeatRow[] } | undefined)?.links) ?? []).map((row, index) => ({ ...row, id: String(row.id ?? `contact-${index}`) }));
  if (section === 'Terminal') items = (((record.terminal as { commands?: RepeatRow[] } | undefined)?.commands) ?? []).map((row, index) => ({ ...row, id: String(row.id ?? `terminal-${index}`) }));
  if (section === 'Skills') {
    items = Object.entries((record.skills as Record<string, unknown> | undefined) ?? {}).flatMap(([category, rows]) =>
      ((rows as Array<{ name: string; years: number }> | undefined) ?? []).map((row, index) => ({ id: `${category}-${index}`, name: row.name, years: row.years, category }))
    );
  }

  function change(next: RepeatRow[]) {
    if (section === 'Stats') update({ ...draft, content: { ...draft.content, stats: next as never } });
    if (section === 'Timeline') update({ ...draft, content: { ...draft.content, timeline: next as never } });
    if (section === 'Tools') update({ ...draft, content: { ...draft.content, tools: next as never } });
    if (section === 'Workflow') update({ ...draft, content: { ...draft.content, workflow: next as never } });
    if (section === 'Experience') update({ ...draft, content: { ...draft.content, experience: next as never } });
    if (section === 'Education') update({ ...draft, content: { ...draft.content, education: next as never } });
    if (section === 'Certifications') update({ ...draft, content: { ...draft.content, certifications: next as never } });
    if (section === 'Contact') update({ ...draft, content: { ...draft.content, contact: { ...(record.contact as object), links: next } } as unknown as PortfolioRelease['content'] });
    if (section === 'Terminal') update({ ...draft, content: { ...draft.content, terminal: { ...(record.terminal as object), commands: next } } as unknown as PortfolioRelease['content'] });
    if (section === 'Skills') {
      const skills: Record<string, Array<{ name: string; years: number }>> = {};
      next.forEach((row) => {
        const category = String(row.category || 'languages');
        if (!skills[category]) skills[category] = [];
        skills[category].push({ name: String(row.name || ''), years: Number(row.years || 0) });
      });
      update({ ...draft, content: { ...draft.content, skills } as PortfolioRelease['content'] });
    }
  }

  function createItem(): RepeatRow {
    if (section === 'Stats') return { id: `stat-${Date.now()}`, label: '', value: '', icon: 'calendar' };
    if (section === 'Timeline') return { id: `timeline-${Date.now()}`, year: '', title: '', description: '', type: 'education' };
    if (section === 'Tools') return { id: `tool-${Date.now()}`, name: '', description: '', category: '' };
    if (section === 'Workflow') return { id: `workflow-${Date.now()}`, label: '', description: '', tools: [] };
    if (section === 'Terminal') return { id: `terminal-${Date.now()}`, command: '', output: [] };
    if (section === 'Contact') return { id: `contact-${Date.now()}`, label: '', url: '', icon: 'Mail' };
    if (section === 'Experience') return { id: `experience-${Date.now()}`, role: '', company: '', period: '', type: 'Full-Time', commits: [] };
    if (section === 'Education') return { id: `education-${Date.now()}`, degree: '', institution: '', period: '', type: 'Degree' };
    if (section === 'Certifications') return { id: `certification-${Date.now()}`, name: '', issuer: '' };
    return { id: `skill-${Date.now()}`, name: '', years: 1, category: 'languages' };
  }

  function renderItem(row: RepeatRow, _index: number, patch: (value: Partial<RepeatRow>) => void) {
    const textField = (label: string, name: string, type = 'text') => (
      <label><span>{label} <b>*</b></span><input type={type} value={String(row[name] ?? '')} onChange={(event) => patch({ [name]: event.target.value })} /></label>
    );
    if (section === 'Stats') return <div className="cms-form-grid">{textField('Label', 'label')}{textField('Value', 'value')}<label><span>Icon</span><select value={String(row.icon || 'calendar')} onChange={(event) => patch({ icon: event.target.value })}>{['calendar','folder','cpu','server','award','briefcase','graduation','code','database','globe'].map((icon) => <option key={icon}>{icon}</option>)}</select></label></div>;
    if (section === 'Timeline') return <div className="cms-form-grid">{textField('Year', 'year')}{textField('Title', 'title')}<label><span>Type</span><select value={String(row.type || 'education')} onChange={(event) => patch({ type: event.target.value })}>{['education','work','promotion','achievement'].map((type) => <option key={type}>{type}</option>)}</select></label><label><span>Description</span><textarea rows={4} value={String(row.description || '')} onChange={(event) => patch({ description: event.target.value })} /></label></div>;
    if (section === 'Tools') return <div className="cms-form-grid">{textField('Name', 'name')}<label><span>Category</span><input value={String(row.category || '')} onChange={(event) => patch({ category: event.target.value })} /></label><label><span>Description</span><textarea rows={3} value={String(row.description || '')} onChange={(event) => patch({ description: event.target.value })} /></label></div>;
    if (section === 'Workflow') return <div className="cms-form-grid">{textField('Label', 'label')}<label><span>Description</span><textarea rows={3} value={String(row.description || '')} onChange={(event) => patch({ description: event.target.value })} /></label><label><span>Tools (comma separated)</span><input value={(row.tools as string[] | undefined)?.join(', ') || ''} onChange={(event) => patch({ tools: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })} /></label></div>;
    if (section === 'Terminal') return <div className="cms-form-grid">{textField('Command', 'command')}<label><span>Output lines</span><textarea rows={6} value={(row.output as string[] | undefined)?.join('\n') || ''} onChange={(event) => patch({ output: event.target.value.split('\n') })} /><small className="cms-terminal-preview">$ {String(row.command || '')}<br />{(row.output as string[] | undefined)?.join(' · ')}</small></label></div>;
    if (section === 'Contact') return <div className="cms-form-grid">{textField('Label', 'label')}{textField('URL', 'url', 'url')}<label><span>Icon</span><select value={String(row.icon || 'Mail')} onChange={(event) => patch({ icon: event.target.value })}>{['Mail','Phone','Github','Linkedin','MapPin','ArrowUpRight','Resume'].map((icon) => <option key={icon}>{icon}</option>)}</select></label></div>;
    if (section === 'Experience') return <div className="cms-form-grid">{textField('Role', 'role')}{textField('Company', 'company')}{textField('Subsidiary', 'parent')}{textField('Period', 'period')}<label><span>Type</span><input value={String(row.type || '')} onChange={(event) => patch({ type: event.target.value })} /></label><label><span>Type badge text</span><input value={String(row.typeBadge || '')} onChange={(event) => patch({ typeBadge: event.target.value })} /></label><label><span>Commits (one per line)</span><textarea rows={6} value={(row.commits as string[] | undefined)?.join('\n') || ''} onChange={(event) => patch({ commits: event.target.value.split('\n').filter(Boolean) })} /></label></div>;
    if (section === 'Education') return <div className="cms-form-grid">{textField('Degree', 'degree')}{textField('Institution', 'institution')}{textField('Period', 'period')}<label><span>Status label</span><input value={String(row.statusLabel || '')} onChange={(event) => patch({ statusLabel: event.target.value })} /></label><label><span>Status year</span><input value={String(row.statusYear || row.year || '')} onChange={(event) => patch({ statusYear: event.target.value, year: event.target.value })} /></label><label><span>Badge</span><input value={String(row.badge || row.note || '')} onChange={(event) => patch({ badge: event.target.value, note: event.target.value })} /></label><label><span>Type</span><input value={String(row.type || '')} onChange={(event) => patch({ type: event.target.value })} /></label></div>;
    if (section === 'Certifications') return <div className="cms-form-grid">{textField('Name', 'name')}{textField('Issuer', 'issuer')}{textField('Year', 'year')}{textField('Credential URL', 'credentialUrl', 'url')}</div>;
    return <div className="cms-form-grid">{textField('Skill name', 'name')}<label><span>Category</span><input value={String(row.category || 'languages')} onChange={(event) => patch({ category: event.target.value })} /></label><label><span>Years</span><input type="number" min="0" max="50" value={Number(row.years || 0)} onChange={(event) => patch({ years: Number(event.target.value) })} /></label></div>;
  }

  const advancedValue = section === 'Contact' ? record.contact : section === 'Terminal' ? record.terminal : record[section.toLowerCase()];
  const itemLabel = section === 'Stats' ? 'Stat' : section === 'Timeline' ? 'Timeline entry' : section === 'Tools' ? 'Tool' : section === 'Workflow' ? 'Workflow step' : section === 'Terminal' ? 'Command' : section === 'Contact' ? 'Contact link' : section === 'Skills' ? 'Skill' : section === 'Experience' ? 'Experience entry' : section === 'Education' ? 'Education entry' : 'Certification';
  const emptyDescriptions: Partial<Record<typeof section, string>> = {
    Stats: 'Stats appear as compact portfolio metrics.',
    Timeline: 'Timeline entries show milestones and career progress.',
    Tools: 'Tools are grouped into categories on the public portfolio.',
    Workflow: 'Workflow steps explain your development process.',
    Terminal: 'Commands populate the interactive terminal preview.',
    Contact: 'Contact links appear in the public contact section.',
    Skills: 'Skills are displayed in category groups on the portfolio.',
    Experience: 'Experience entries appear in the journey timeline.',
    Education: 'Education entries appear in the learning section.',
    Certifications: 'Certifications appear in your CV and portfolio.',
  };
  const getSummary = (row: RepeatRow) => String(row.label || row.title || row.name || row.role || row.degree || row.command || row.year || row.issuer || '') || 'Untitled';
  return (
    <div className="cms-profile-layout">
      <div>
        {!Array.isArray(items) && <p className="cms-warning">Existing data could not be read; safe defaults are shown.</p>}
        <RepeaterField title={section} items={items} onChange={change} createItem={createItem} renderItem={renderItem} itemLabel={itemLabel} emptyTitle={`No ${itemLabel.toLowerCase()}s yet`} emptyDescription={emptyDescriptions[section]} showVisibility={section === 'Tools' || section === 'Workflow'} getSummary={getSummary} />
        <AdvancedJson title={section} value={advancedValue} onApply={(value) => update({ ...draft, content: { ...draft.content, [section.toLowerCase()]: value } } as PortfolioRelease)} />
      </div>
      <Preview title={`${section} preview`}>
        {items.slice(0, 6).map((item) => <p key={String(item.id)}><strong>{String(item.label || item.title || item.name || item.role || item.degree || item.command || '')}</strong>{item.description ? ` — ${String(item.description)}` : ''}</p>)}
      </Preview>
    </div>
  );
}

function Preview({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <aside className="cms-live-preview">
      <div className="cms-preview-header"><h2>{title}</h2><button type="button" className="admin-button" onClick={() => setOpen((value) => !value)}>{open ? 'Collapse' : 'Expand'}</button></div>
      {open && <div className="cms-preview-hero">{children}</div>}
    </aside>
  );
}

export function HeroEditor({ draft, update }: { draft: PortfolioRelease; update: (next: PortfolioRelease) => void }) {
  const record = draft.content as unknown as Record<string, unknown>;
  const fallback: HeroValue = { eyebrow: '', heading: '', description: '', supporting: '', profileImage: '/images/thinu-profile.png', profileImageAlt: 'Thinu Upadya', layout: 'split' };
  const parsed = heroSchema.safeParse(record.hero ?? fallback);
  const form = useForm<HeroValue>({ resolver: zodResolver(heroSchema), defaultValues: parsed.success ? parsed.data : fallback, mode: 'onChange' });
  useEffect(() => { if (parsed.success) form.reset(parsed.data); }, [JSON.stringify(record.hero)]);

  function sync(values: HeroValue) {
    update({ ...draft, content: { ...draft.content, hero: values } as PortfolioRelease['content'] });
  }

  const values = form.watch();
  return (
    <div className="cms-profile-layout">
      <form className="cms-form" onSubmit={(event) => event.preventDefault()} onChange={() => void form.handleSubmit(sync)()}>
        {!parsed.success && <p className="cms-warning">Existing Hero data was malformed; safe defaults are shown.</p>}
        <div className="cms-form-grid">
          <label><span>Eyebrow <b>*</b></span><input {...form.register('eyebrow')} /><small className="admin-error">{form.formState.errors.eyebrow?.message}</small></label>
          <label><span>Layout</span><select {...form.register('layout')}><option value="split">Split</option><option value="centered">Centered</option><option value="terminal">Terminal</option><option value="minimal">Minimal</option></select></label>
        </div>
        <label><span>Heading <b>*</b></span><input {...form.register('heading')} /><small className="admin-error">{form.formState.errors.heading?.message}</small></label>
        <label><span>Description <b>*</b></span><textarea rows={5} maxLength={2000} {...form.register('description')} /><small className="cms-character-count">{form.watch('description')?.length ?? 0}/2000</small></label>
        <label><span>Supporting text</span><textarea rows={4} maxLength={2000} {...form.register('supporting')} /><small className="cms-character-count">{form.watch('supporting')?.length ?? 0}/2000</small></label>
        <div className="cms-form-grid">
          <label><span>Primary CTA label</span><input {...form.register('primaryCtaLabel')} /></label>
          <label><span>Primary CTA link</span><input type="url" {...form.register('primaryCtaLink')} /><small className="admin-error">{form.formState.errors.primaryCtaLink?.message}</small></label>
          <label><span>Secondary CTA label</span><input {...form.register('secondaryCtaLabel')} /></label>
          <label><span>Secondary CTA link</span><input type="url" {...form.register('secondaryCtaLink')} /><small className="admin-error">{form.formState.errors.secondaryCtaLink?.message}</small></label>
        </div>
        <ImageUpload
          label="Hero image"
          value={form.watch('profileImage')}
          alt={form.watch('profileImageAlt')}
          onChange={(path) => { form.setValue('profileImage', path, { shouldDirty: true }); sync({ ...form.getValues(), profileImage: path }); }}
          onAltChange={(alt) => { form.setValue('profileImageAlt', alt, { shouldDirty: true }); sync({ ...form.getValues(), profileImageAlt: alt }); }}
        />
        <AdvancedJson title="Hero" value={record.hero ?? fallback} validate={(value) => heroSchema.safeParse(value)} onApply={(value) => { const result = heroSchema.safeParse(value); if (result.success) sync(result.data); }} />
      </form>
      <Preview title="Hero preview"><span className="cms-preview-eyebrow">{values.eyebrow}</span><h3>{values.heading}</h3><p>{values.description}</p><p>{values.supporting}</p></Preview>
    </div>
  );
}
