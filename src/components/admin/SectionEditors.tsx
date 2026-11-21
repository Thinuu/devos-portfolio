'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RepeaterField, { type RepeaterItem } from '@/components/admin/RepeaterField';
import ImageUpload from '@/components/admin/ImageUpload';
import { Field, Input, Select, TagInput, Textarea, Toggle } from '@/components/admin/AdminFields';
import type { PortfolioRelease } from '@/lib/schemas/portfolio.schema';
import { portfolioData } from '@/lib/data';
import { deriveFlatSkills } from '@/lib/projects/toolkit';

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
  intro: z.string().max(1000).optional(),
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
    intro?: string;
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
        <Field label="Heading" required><Input value={value.title || ''} maxLength={200} onChange={(event) => patchAbout({ title: event.target.value })} /></Field>
        <Field label="Intro line"><Input value={value.intro || ''} maxLength={1000} onChange={(event) => patchAbout({ intro: event.target.value })} /></Field>
        <RepeaterField
          title="Paragraphs"
          items={paragraphs.map((text, index) => ({ id: `paragraph-${index}`, text }))}
          onChange={(rows) => patchAbout({ paragraphs: rows.map((row) => String(row.text ?? '')) })}
          createItem={(text) => ({ id: `paragraph-${Date.now()}`, text: text || '' })}
          primaryField={{ key: 'text', label: 'paragraph text' }}
          itemLabel="Paragraph"
          emptyTitle="No paragraphs yet"
          emptyDescription="Paragraphs form the main About text. Add one or more short sections."
          getSummary={(row) => String(row.text || '').slice(0, 48)}
          renderItem={(row, _index, patch) => <Field label="Paragraph" helperText={`${String(row.text ?? '').length}/2000 characters`}><Textarea maxLength={2000} value={String(row.text ?? '')} onChange={(event) => patch({ text: event.target.value })} /></Field>}
        />
        <RepeaterField
          title="Highlights"
          items={(value.highlights ?? []).map((row, index) => ({ id: `highlight-${index}`, ...row }))}
          onChange={(rows) => patchAbout({ highlights: rows.map(({ id: _id, ...row }) => row) })}
          createItem={(title) => ({ id: `highlight-${Date.now()}`, title: title || '', description: '' })}
          primaryField={{ key: 'title', label: 'highlight title' }}
          itemLabel="Highlight"
          emptyTitle="No highlights yet"
          emptyDescription="Highlights appear as short bullet points beside your About text."
          getSummary={(row) => String(row.title || row.description || '')}
          renderItem={(row, _index, patch) => <div className="cms-form-grid"><Field label="Title" required><Input value={String(row.title ?? '')} onChange={(event) => patch({ title: event.target.value })} /></Field><Field label="Description"><Textarea value={String(row.description ?? '')} onChange={(event) => patch({ description: event.target.value })} /></Field></div>}
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
      <Preview title="About preview"><h3>{value.title}</h3>{value.intro&&<p>{value.intro}</p>}{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</Preview>
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
    const categories=(record.skillCategories as Array<Record<string,unknown>>|undefined) ?? (portfolioData.skillCategories as unknown as Array<Record<string,unknown>>);
    items=categories.map((row,index)=>({ ...row,id:String(row.id||`skill-category-${index}`),title:String(row.title||''),description:String(row.description||''),icon:String(row.icon||'frontend'),order:Number(row.order??index),visible:row.visible!==false,coreTools:Array.isArray(row.coreTools)?row.coreTools:Array.isArray(row.core)?row.core:[],alsoExplored:Array.isArray(row.alsoExplored)?row.alsoExplored:Array.isArray(row.more)?row.more:[] })) as RepeatRow[];
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
      const skillCategories=next.map((row,index)=>({title:String(row.title||''),description:String(row.description||''),icon:String(row.icon||'frontend'),order:index,visible:row.visible!==false,coreTools:Array.isArray(row.coreTools)?row.coreTools.map(String):[],alsoExplored:Array.isArray(row.alsoExplored)?row.alsoExplored.map(String):[]}));
      const skills=deriveFlatSkills(skillCategories);
      update({ ...draft, content: { ...draft.content, skillCategories, skills } as unknown as PortfolioRelease['content'] });
      return;
    }
  }

  function createItem(primaryValue?: string): RepeatRow {
    if (section === 'Stats') return { id: `stat-${Date.now()}`, label: primaryValue || '', value: '', icon: 'calendar' };
    if (section === 'Timeline') return { id: `timeline-${Date.now()}`, year: '', title: primaryValue || '', description: '', type: 'education' };
    if (section === 'Tools') return { id: `tool-${Date.now()}`, name: primaryValue || '', description: '', category: '' };
    if (section === 'Workflow') return { id: `workflow-${Date.now()}`, label: primaryValue || '', description: '', tools: [] };
    if (section === 'Terminal') return { id: `terminal-${Date.now()}`, command: primaryValue || '', output: [] };
    if (section === 'Contact') return { id: `contact-${Date.now()}`, label: primaryValue || '', url: '', icon: 'Mail' };
    if (section === 'Experience') return { id: `experience-${Date.now()}`, role: primaryValue || '', company: '', period: '', type: 'Full-Time', commits: [] };
    if (section === 'Education') return { id: `education-${Date.now()}`, degree: primaryValue || '', institution: '', period: '', type: 'Degree' };
    if (section === 'Certifications') return { id: `certification-${Date.now()}`, name: primaryValue || '', issuer: '' };
    return { id: `skill-category-${Date.now()}`, title: primaryValue || '', description: '', icon: 'frontend', order: 0, visible: true, coreTools: [], alsoExplored: [] };
  }

  function renderItem(row: RepeatRow, _index: number, patch: (value: Partial<RepeatRow>) => void) {
    const textField = (label: string, name: string, type = 'text', required = false) => <Field label={label} required={required}><Input type={type} value={String(row[name] ?? '')} onChange={(event) => patch({ [name]: event.target.value })} /></Field>;
    const selectField = (label: string, name: string, options: string[]) => <Field label={label}><Select value={String(row[name] || options[0])} onChange={(event) => patch({ [name]: event.target.value })}>{options.map((option) => <option key={option}>{option}</option>)}</Select></Field>;
    const longField = (label: string, name: string) => <Field label={label}><Textarea value={String(row[name] || '')} onChange={(event) => patch({ [name]: event.target.value })} /></Field>;
    if (section === 'Stats') return <div className="cms-form-grid">{textField('Label', 'label', 'text', true)}{textField('Value', 'value', 'text', true)}{selectField('Icon', 'icon', ['calendar','folder','cpu','server','award','briefcase','graduation','code','database','globe'])}</div>;
    if (section === 'Timeline') return <div className="cms-form-grid">{textField('Year', 'year', 'text', true)}{textField('Title', 'title', 'text', true)}{selectField('Type', 'type', ['education','work','promotion','achievement'])}{longField('Description', 'description')}</div>;
    if (section === 'Tools') return <div className="cms-form-grid">{textField('Name', 'name', 'text', true)}{textField('Category', 'category')}{longField('Description', 'description')}</div>;
    if (section === 'Workflow') return <div className="cms-form-grid">{textField('Label', 'label', 'text', true)}{longField('Description', 'description')}<TagInput label="Tools" value={Array.isArray(row.tools) ? (row.tools as string[]).map(String) : []} onChange={(tools) => patch({ tools })} /></div>;
    if (section === 'Terminal') return <div className="cms-form-grid">{textField('Command', 'command', 'text', true)}<Field label="Output lines"><Textarea value={(row.output as string[] | undefined)?.join('\n') || ''} onChange={(event) => patch({ output: event.target.value.split('\n') })} /><small className="cms-terminal-preview">$ {String(row.command || '')}<br />{(row.output as string[] | undefined)?.join(' | ')}</small></Field></div>;
    if (section === 'Contact') return <div className="cms-form-grid">{textField('Label', 'label', 'text', true)}{textField('URL', 'url', 'url', true)}{selectField('Icon', 'icon', ['Mail','Phone','Github','Linkedin','MapPin','ArrowUpRight','Resume'])}</div>;
    if (section === 'Experience') return <div className="cms-form-grid">{textField('Role', 'role', 'text', true)}{textField('Company', 'company', 'text', true)}{textField('Subsidiary', 'parent')}{textField('Period', 'period', 'text', true)}{textField('Type', 'type')}{textField('Type badge text', 'typeBadge')}<Field label="Highlights"><Textarea value={(row.commits as string[] | undefined)?.join('\n') || ''} onChange={(event) => patch({ commits: event.target.value.split('\n').filter(Boolean) })} /></Field></div>;
    if (section === 'Education') return <div className="cms-form-grid">{textField('Qualification', 'degree', 'text', true)}{textField('Institution', 'institution', 'text', true)}{textField('Period', 'period')}{textField('Status label', 'statusLabel')}{textField('Status year', 'statusYear')}{textField('Badge', 'badge')}{textField('Type', 'type')}</div>;
    if (section === 'Certifications') return <div className="cms-form-grid">{textField('Name', 'name', 'text', true)}{textField('Issuer', 'issuer')}{textField('Year', 'year')}{textField('Credential URL', 'credentialUrl', 'url')}</div>;
    if (section === 'Skills') return <><div className="cms-form-grid"><Field label="Category title" required><Input value={String(row.title||'')} onChange={(event)=>patch({title:event.target.value})}/></Field><Field label="Icon"><Input value={String(row.icon||'')} onChange={(event)=>patch({icon:event.target.value})}/></Field><Field label="Description" className="cms-wide-field"><Textarea value={String(row.description||'')} onChange={(event)=>patch({description:event.target.value})}/></Field><Field label="Display order"><Input type="number" min="0" value={Number(row.order??0)} onChange={(event)=>patch({order:Number(event.target.value)})}/></Field><Toggle label="Shown on site" checked={row.visible!==false} onChange={(visible)=>patch({visible})}/></div><TagInput label="Core tools" value={Array.isArray(row.coreTools)?row.coreTools.map(String):[]} onChange={(coreTools)=>patch({coreTools})}/><TagInput label="Also explored" value={Array.isArray(row.alsoExplored)?row.alsoExplored.map(String):[]} onChange={(alsoExplored)=>patch({alsoExplored})}/></>;
    return <div className="cms-form-grid">{textField('Skill name', 'name', 'text', true)}{textField('Category', 'category')}{textField('Years', 'years', 'number')}</div>;
  }

  const advancedValue = section === 'Contact' ? record.contact : section === 'Terminal' ? record.terminal : section === 'Skills' ? record.skillCategories : record[section.toLowerCase()];
  const itemLabel = section === 'Stats' ? 'Stat' : section === 'Timeline' ? 'Timeline entry' : section === 'Tools' ? 'Tool' : section === 'Workflow' ? 'Workflow step' : section === 'Terminal' ? 'Command' : section === 'Contact' ? 'Contact link' : section === 'Skills' ? 'Toolkit category' : section === 'Experience' ? 'Experience entry' : section === 'Education' ? 'Education entry' : 'Certification';
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
  const getSummary = (row: RepeatRow) => String(row.label || row.title || row.name || row.role || row.degree || row.command || row.year || row.issuer || '');
  const requiredNewFields: Partial<Record<typeof section, Array<{ key: string; label: string; type?: string }>>> = {
    Stats: [{ key: 'value', label: 'stat value' }],
    Contact: [{ key: 'url', label: 'contact URL', type: 'url' }],
    Experience: [{ key: 'company', label: 'company' }, { key: 'period', label: 'period' }],
    Education: [{ key: 'institution', label: 'institution' }],
  };
  return (
    <div className="cms-profile-layout">
      <div>
        {!Array.isArray(items) && <p className="cms-warning">Existing data could not be read; safe defaults are shown.</p>}
        {section==='Skills'&&<Field label="Toolkit note"><Textarea value={String(record.familiarityNote||'')} onChange={(event)=>update({...draft,content:{...draft.content,familiarityNote:event.target.value} as PortfolioRelease['content']})}/></Field>}
        {section==='Contact'&&<div className="cms-form cms-contact-copy"><div className="cms-form-grid"><Field label="Heading"><Input value={String((record.contact as Record<string,unknown>|undefined)?.title||'')} onChange={(event)=>update({...draft,content:{...draft.content,contact:{...(record.contact as object),title:event.target.value}} as PortfolioRelease['content']})}/></Field><Field label="Button text"><Input value={String((record.contact as Record<string,unknown>|undefined)?.buttonLabel||'')} onChange={(event)=>update({...draft,content:{...draft.content,contact:{...(record.contact as object),buttonLabel:event.target.value}} as PortfolioRelease['content']})}/></Field></div><Field label="Paragraph"><Textarea value={String((record.contact as Record<string,unknown>|undefined)?.description||'')} onChange={(event)=>update({...draft,content:{...draft.content,contact:{...(record.contact as object),description:event.target.value}} as PortfolioRelease['content']})}/></Field></div>}
        <RepeaterField title={section} items={items} onChange={change} createItem={createItem} primaryField={{key:section==='Stats'?'label':section==='Timeline'?'title':section==='Tools'?'name':section==='Workflow'?'label':section==='Terminal'?'command':section==='Contact'?'label':section==='Experience'?'role':section==='Education'?'degree':section==='Skills'?'title':'name',label:section==='Stats'?'stat label':section==='Timeline'?'milestone title':section==='Tools'?'tool name':section==='Workflow'?'step label':section==='Terminal'?'command':section==='Contact'?'contact label':section==='Experience'?'role':section==='Education'?'degree':section==='Skills'?'category title':'certification name'}} requiredFields={requiredNewFields[section]} renderItem={renderItem} itemLabel={itemLabel} emptyTitle={`No ${itemLabel.toLowerCase()}s yet`} emptyDescription={emptyDescriptions[section]} showVisibility={section === 'Tools' || section === 'Workflow'} getSummary={getSummary} />
        <AdvancedJson title={section} value={advancedValue} onApply={(value) => section==='Skills' ? (Array.isArray(value)&&change(value as RepeatRow[])) : update({ ...draft, content: { ...draft.content, [section.toLowerCase()]: value } } as PortfolioRelease)} />
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
          <Field label="Eyebrow" required error={form.formState.errors.eyebrow?.message}><Input {...form.register('eyebrow')} /></Field>
          <Field label="Layout"><Select {...form.register('layout')}><option value="split">Split</option><option value="centered">Centered</option><option value="terminal">Terminal</option><option value="minimal">Minimal</option></Select></Field>
        </div>
        <Field label="Heading" required error={form.formState.errors.heading?.message}><Input {...form.register('heading')} /></Field>
        <Field label="Description" required helperText={`${form.watch('description')?.length ?? 0}/2000 characters`}><Textarea maxLength={2000} {...form.register('description')} /></Field>
        <Field label="Supporting text" helperText={`${form.watch('supporting')?.length ?? 0}/2000 characters`}><Textarea maxLength={2000} {...form.register('supporting')} /></Field>
        <div className="cms-form-grid">
          <Field label="Primary CTA label"><Input {...form.register('primaryCtaLabel')} /></Field>
          <Field label="Primary CTA link" error={form.formState.errors.primaryCtaLink?.message}><Input type="url" {...form.register('primaryCtaLink')} /></Field>
          <Field label="Secondary CTA label"><Input {...form.register('secondaryCtaLabel')} /></Field>
          <Field label="Secondary CTA link" error={form.formState.errors.secondaryCtaLink?.message}><Input type="url" {...form.register('secondaryCtaLink')} /></Field>
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
