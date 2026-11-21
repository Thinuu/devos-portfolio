'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { ArrowDown, ArrowUp, CheckCircle2, ChevronLeft, ChevronRight, Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import { personalSchema, projectSchema, type PortfolioRelease } from '@/lib/schemas/portfolio.schema';
import { AboutEditor, HeroEditor, RepeatEditor } from '@/components/admin/SectionEditors';
import ImageUpload from '@/components/admin/ImageUpload';
import { Field, Input, TagInput, Textarea, Toggle } from '@/components/admin/AdminFields';
import DraftSaveBar from '@/components/admin/DraftSaveBar';
import { readJsonResponse } from '@/lib/http/json';
import RepeaterField from '@/components/admin/RepeaterField';
import { editorRowsToHighlights, highlightsToEditorRows } from '@/lib/projects/highlights';
import { portfolioData } from '@/lib/data';
import type { FormattedValidationIssue } from '@/lib/schemas/validation-issues';

const sections = [
  'Profile','Hero','About','Projects','Skills','Tools','Experience','Education','Certifications','Timeline','Stats','Workflow','Terminal','Contact',
] as const;

type Section = typeof sections[number];
type ProjectInput = z.infer<typeof projectSchema>;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function selectedProjectTitle(project: PortfolioRelease['content']['projects'][number]) {
  return project.title || 'Untitled project';
}

function PersonalEditor({ draft, update }: { draft: PortfolioRelease; update: (next: PortfolioRelease) => void }) {
  const form = useForm({ resolver: zodResolver(personalSchema), defaultValues: draft.content.personal, mode: 'onChange' });
  const hero = (draft.content as unknown as Record<string, { profileImage?: string; profileImageAlt?: string }>).hero;
  const imageUrl = hero?.profileImage || '/images/thinu-profile.png';

  useEffect(() => { form.reset(draft.content.personal); }, [draft.content.personal.name, draft.content.personal.role, draft.content.personal.email, form]);
  function syncPersonal(values: typeof draft.content.personal) {
    update({ ...draft, content: { ...draft.content, personal: values } });
  }
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('admin-section-validation', { detail: { section: 'Profile', error: !form.formState.isValid } }));
  }, [form.formState.isValid]);

  const fields: Array<[keyof typeof draft.content.personal, string, string]> = [
    ['name','Name','text'],['role','Role','text'],['location','Location','text'],['timezone','Timezone','text'],
    ['email','Email','email'],['phone','Phone','tel'],['github','GitHub','url'],['linkedin','LinkedIn','url'],['responseTime','Response time','text'],
  ];
  return <form className="cms-form" onSubmit={(event) => event.preventDefault()} onChange={() => void form.handleSubmit(syncPersonal)()}>
    <div className="cms-form-grid">
      {fields.map(([name,label,type]) => <Field key={name} label={label} required error={form.formState.errors[name]?.message as string | undefined}><Input type={type} {...form.register(name)} /></Field>)}
    </div>
    <Field label="Tagline" required helperText={`${form.watch('tagline')?.length ?? 0}/500 characters`} error={form.formState.errors.tagline?.message as string | undefined}><Textarea maxLength={500} {...form.register('tagline')} /></Field>
    <Field label="Bio" required helperText={`${form.watch('bio')?.length ?? 0}/4000 characters`} error={form.formState.errors.bio?.message as string | undefined}><Textarea maxLength={4000} {...form.register('bio')} /></Field>
    <div className="cms-inline-options">
      <Toggle label="Available for opportunities" checked={form.watch('available')} onChange={(available) => { form.setValue('available', available, { shouldDirty: true }); void form.handleSubmit(syncPersonal)(); }} />
      <label><span>Response time</span><input {...form.register('responseTime')} /><small className="admin-error">{form.formState.errors.responseTime?.message as string}</small></label>
    </div>
    <ImageUpload
      label="Profile image"
      value={imageUrl}
      alt={hero?.profileImageAlt || 'Thinu Upadya'}
      fallback="/images/thinu-profile.png"
      onChange={(path) => {
        update({ ...draft, content: { ...draft.content, hero: { ...(hero ?? {}), profileImage: path } as never } });
      }}
      onAltChange={(alt) => update({ ...draft, content: { ...draft.content, hero: { ...(hero ?? {}), profileImageAlt: alt } as never } })}
    />
  </form>;
}

function ProjectsEditor({ draft, update }: { draft: PortfolioRelease; update: (next: PortfolioRelease) => void }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [slugEdited, setSlugEdited] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const projects = draft.content.projects;
  const filtered = projects.map((project, index) => ({ project, index })).filter(({ project }) => {
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || project.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });
  const form = useForm<ProjectInput>({ resolver: zodResolver(projectSchema), defaultValues: (projects[selected] as unknown as ProjectInput) ?? projectSchema.parse({ id:'',title:'',shortDesc:'',fullDesc:'',stack:[],type:'',category:'',status:'',year:'',employer:'' }), mode:'onChange' });
  useEffect(() => { if (projects[selected]) form.reset(projects[selected] as unknown as ProjectInput); setSlugEdited(false); }, [selected]);

  function syncProject(values: ProjectInput) {
    const next = [...projects];
    next[selected] = values as unknown as (typeof projects)[number];
    update({ ...draft, content: { ...draft.content, projects: next } });
  }

  function add() {
    const project = projectSchema.parse({ id:`project-${Date.now()}`,title:'New project',shortDesc:'',fullDesc:'',stack:[],type:'',category:'',status:'Draft',year:String(new Date().getFullYear()),employer:'' });
    update({ ...draft, content: { ...draft.content, projects: [...projects, project as unknown as (typeof projects)[number]] } }); setSelected(projects.length);
  }
  function remove(index: number) {
    if (!window.confirm('Delete this project?')) return;
    const next = projects.filter((_, itemIndex) => itemIndex !== index); update({ ...draft, content: { ...draft.content, projects: next } }); setSelected(0);
  }
  function duplicate(index: number) {
    const source = projects[index]; const copy = { ...source, id: `${source.id}-copy`, title: `${source.title} Copy` } as unknown as (typeof projects)[number]; const next = [...projects]; next.splice(index + 1, 0, copy); update({ ...draft, content: { ...draft.content, projects: next } }); setSelected(index + 1);
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction; if (target < 0 || target >= projects.length) return; const next = [...projects]; [next[index],next[target]]=[next[target],next[index]]; update({ ...draft, content: { ...draft.content, projects: next } }); setSelected(target);
  }
  function reorderProject(from: number, to: number) {
    if (to < 0 || to >= projects.length || from === to) return;
    const next = [...projects];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update({ ...draft, content: { ...draft.content, projects: next } });
  }

  const statuses = Array.from(new Set(projects.map((project) => project.status).filter(Boolean)));
  const categories = Array.from(new Set(projects.map((project) => project.category).filter(Boolean)));
  const types = Array.from(new Set(projects.map((project) => project.type).filter(Boolean)));
  const skillSuggestions = Array.from(new Set(Object.values(draft.content.skills).flatMap((skills) => skills.map((skill) => skill.name))));
  const highlightRows = highlightsToEditorRows(form.watch('highlights'));

  if (!projects.length) return <div className="admin-empty"><button className="admin-button primary" onClick={add}><Plus size={15}/> Add first project</button></div>;
  const project = projects[selected];
  const slug = form.watch('id');
  const duplicateIds = projects.filter((item) => item.id === slug).length > 1;

  function ProjectListContent() {
    return (
      <>
        <div className="cms-project-count">{projects.length} project{projects.length === 1 ? '' : 's'}<button type="button" className="admin-button primary" onClick={add}><Plus size={15} /> Add</button></div>
        <div className="cms-project-filters">
          <input aria-label="Search projects" placeholder="Search projects..." value={search} onChange={(event)=>setSearch(event.target.value)} />
          <select aria-label="Filter by status" value={statusFilter} onChange={(event)=>setStatusFilter(event.target.value)}><option>All</option>{statuses.map((status)=><option key={status}>{status}</option>)}</select>
          <select aria-label="Filter by category" value={categoryFilter} onChange={(event)=>setCategoryFilter(event.target.value)}><option>All</option>{categories.map((category)=><option key={category}>{category}</option>)}</select>
        </div>
        <div className="cms-project-list-items">
          {filtered.length === 0 && <p className="cms-empty-filter">No projects match these filters.</p>}
          {filtered.map(({project:item,index}) => (
            <article
              className={`cms-project-item${selected===index?' is-active':''}${(item as unknown as {hidden?:boolean}).hidden?' is-hidden':''}`}
              key={item.id}
              draggable
              onDragStart={(event)=>event.dataTransfer.setData('application/project-index',String(index))}
              onDragOver={(event)=>event.preventDefault()}
              onDrop={(event)=>{event.preventDefault();reorderProject(Number(event.dataTransfer.getData('application/project-index')),index)}}
            >
              <button type="button" className="cms-project-select" onClick={()=>{setSelected(index);setMobileListOpen(false)}} title={item.title}>
                <GripVertical size={14}/>
                <span><strong>{item.title}</strong><small>{item.category || 'Uncategorised'}</small></span>
                <em>{item.status || 'Draft'}</em>
              </button>
              <div className="cms-project-actions">
                <label title="Visible on the public portfolio"><input type="checkbox" checked={(item as unknown as {hidden?:boolean}).hidden !== true} onChange={(event)=>{const next=[...projects];next[index]={...item,hidden:!event.target.checked} as unknown as typeof item;update({...draft,content:{...draft.content,projects:next}})}}/> Visible</label>
                <button type="button" className="admin-button" aria-label={`Duplicate ${item.title}`} title="Duplicate" onClick={()=>duplicate(index)}><Copy size={13}/></button>
                <button type="button" className="admin-button" aria-label={`Delete ${item.title}`} title="Delete" onClick={()=>remove(index)}><Trash2 size={13}/></button>
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }
  return <div className="cms-projects">
    <details className="cms-project-mobile" open={mobileListOpen} onToggle={(event) => setMobileListOpen(event.currentTarget.open)}>
      <summary>{selectedProjectTitle(project)} · {projects.length} projects</summary>
      <aside className="cms-project-list"><ProjectListContent /></aside>
    </details>
    <aside className="cms-project-list cms-project-list-desktop"><ProjectListContent /></aside>
    {project && <form className="cms-project-form cms-form" onSubmit={(event)=>event.preventDefault()} onChange={()=>void form.handleSubmit(syncProject)()}>
      <div className="cms-form-actions"><button type="button" className="admin-button" onClick={()=>duplicate(selected)}><Copy size={15}/> Duplicate</button><button type="button" className="admin-button" onClick={()=>move(selected,-1)}><ArrowUp size={15}/></button><button type="button" className="admin-button" onClick={()=>move(selected,1)}><ArrowDown size={15}/></button><button type="button" className="admin-button" onClick={()=>remove(selected)}><Trash2 size={15}/> Delete</button></div>
      <details className="cms-form-section" open><summary>Basics</summary><div className="cms-form-grid">
        <Field label="Title" required error={form.formState.errors.title?.message as string | undefined}><Input {...form.register('title')} onChange={(event)=>{const title=event.target.value;form.setValue('title',title,{shouldDirty:true,shouldValidate:true});if(!slugEdited){const id=slugify(title);form.setValue('id',id,{shouldDirty:true,shouldValidate:true});syncProject({...form.getValues(),title,id})}else syncProject({...form.getValues(),title})}}/></Field>
        <Field label="Slug / URL" required helperText={`Changing this changes /projects/${slug}`} error={duplicateIds ? 'Slug must be unique.' : form.formState.errors.id?.message as string | undefined}><Input value={slug} onChange={(event)=>{setSlugEdited(true);const value=slugify(event.target.value);form.setValue('id',value,{shouldDirty:true,shouldValidate:true});syncProject({...form.getValues(),id:value})}}/></Field>
        <Field label="Status"><Input list="project-statuses" {...form.register('status')}/><datalist id="project-statuses">{statuses.map((status)=><option key={status} value={status}/>)}</datalist></Field>
        <Field label="Year"><Input {...form.register('year')}/></Field>
        <Field label="Type"><Input list="project-types" {...form.register('type')}/><datalist id="project-types">{types.map((type)=><option key={type} value={type}/>)}</datalist></Field>
        <Field label="Category"><Input list="project-categories" {...form.register('category')}/><datalist id="project-categories">{categories.map((category)=><option key={category} value={category}/>)}</datalist></Field>
        <TagInput label="Additional categories" value={form.watch('additionalCategories') ?? []} onChange={(additionalCategories)=>{form.setValue('additionalCategories',additionalCategories,{shouldDirty:true});syncProject({...form.getValues(),additionalCategories})}} />
        <Field label="Monogram"><Input maxLength={12} {...form.register('monogram')} /></Field>
        <Field label="Period"><Input maxLength={40} {...form.register('period')} /></Field>
        <Toggle label="Featured project" checked={form.watch('featured') === true} onChange={(featured)=>{form.setValue('featured',featured,{shouldDirty:true});syncProject({...form.getValues(),featured})}} />
        <Toggle label="Visible on portfolio" checked={form.watch('visible') !== false} onChange={(visible)=>{form.setValue('visible',visible,{shouldDirty:true});syncProject({...form.getValues(),visible})}} />
        <Field label="Artwork caption"><Input maxLength={200} {...form.register('artworkCaption')}/></Field>
      </div></details>
      <details className="cms-form-section"><summary>Descriptions</summary><div className="cms-form-grid"><Field label="Short description" helperText={`${form.watch('shortDesc')?.length ?? 0}/500 characters`}><Textarea maxLength={500} {...form.register('shortDesc')}/></Field><Field label="Full description" helperText={`${form.watch('fullDesc')?.length ?? 0}/5000 characters`}><Textarea maxLength={5000} {...form.register('fullDesc')}/></Field></div></details>
      <details className="cms-form-section"><summary>Details</summary><div className="cms-form-grid">{(['employer','role','challenge','solution','architecture','scopeNotice','collaborationNote','projectStatusNote','techStackNote'] as const).map((name)=><Field key={name} label={name.replace(/([A-Z])/g,' $1').replace(/^./,(letter)=>letter.toUpperCase())}><Textarea {...form.register(name)}/></Field>)}</div></details>
      <details className="cms-form-section"><summary>Links</summary>
        <RepeaterField
          title="Project links"
          items={(form.watch('links') ?? []).map((link, index) => typeof link === 'string'
            ? { id: `link-${index}`, label: '', url: link, icon: 'ArrowUpRight' }
            : { id: `link-${index}`, ...link })}
          itemLabel="Link"
          emptyTitle="No project links"
          emptyDescription="Add labels and URLs for all live sites or external project links."
          getSummary={(row) => String(row.label || row.url || '')}
          createItem={() => ({ id: `link-${Date.now()}`, label: '', url: '', icon: 'ArrowUpRight' })}
          onChange={(rows) => {
            const links = rows.map(({ label, url, icon }) => ({
              label: String(label || ''),
              url: String(url || ''),
              icon: String(icon || 'ArrowUpRight'),
            }));
            form.setValue('links', links as ProjectInput['links'], { shouldDirty: true, shouldValidate: true });
            syncProject({ ...form.getValues(), links: links as ProjectInput['links'] });
          }}
          renderItem={(row, _index, patch) => (
            <div className="cms-form-grid">
              <Field label="Label" required><Input value={String(row.label || '')} onChange={(event) => patch({ label: event.target.value })} /></Field>
              <Field label="URL" required><Input type="url" value={String(row.url || '')} onChange={(event) => patch({ url: event.target.value })} /></Field>
              <Field label="Icon"><Input value={String(row.icon || 'ArrowUpRight')} onChange={(event) => patch({ icon: event.target.value })} /></Field>
            </div>
          )}
        />
      </details>
      <details className="cms-form-section"><summary>Workflow</summary><RepeaterField
        title="Workflow steps"
        items={(form.watch('workflow') ?? []).map((step,index)=>typeof step === 'string'
          ? {id:`step-${index}`,label:step,description:''}
          : {id:String(step.id||`step-${index}`),...step})}
        itemLabel="Step"
        emptyTitle="No workflow steps"
        emptyDescription="Add ordered steps for the project process or case-study flow."
        getSummary={(row)=>String(row.label||'')}
        createItem={()=>({id:`step-${Date.now()}`,label:'',description:''})}
        onChange={(rows)=>{const workflow=rows.map(({id,label,description})=>({id:String(id),label:String(label||''),description:String(description||'')}));form.setValue('workflow',workflow,{shouldDirty:true,shouldValidate:true});syncProject({...form.getValues(),workflow:workflow as ProjectInput['workflow']})}}
        renderItem={(row,_index,patch)=><div className="cms-form-grid"><Field label="Step label" required><Input value={String(row.label||'')} onChange={(event)=>patch({label:event.target.value})}/></Field><Field label="Description"><Textarea value={String(row.description||'')} onChange={(event)=>patch({description:event.target.value})}/></Field></div>}
      /></details>
      <details className="cms-form-section" open><summary>Stack</summary><TagInput label="Stack" value={form.watch('stack') ?? []} onChange={(stack)=>{form.setValue('stack',stack,{shouldDirty:true,shouldValidate:true});syncProject({...form.getValues(),stack})}} suggestions={skillSuggestions} placeholder="Type a technology and press Enter" /></details>
      <details className="cms-form-section" open><summary>Highlights</summary><RepeaterField title="Project highlights" items={highlightRows} itemLabel="Highlight" emptyTitle="No highlights yet" emptyDescription="Highlights summarize the project's key outcomes." getSummary={(row)=>String(row.text||'')||'Untitled highlight'} createItem={()=>({id:`highlight-${Date.now()}`,text:'',icon:'check'})} onChange={(rows)=>{const highlights=editorRowsToHighlights(rows.map((row)=>({id:String(row.id),text:String(row.text??''),icon:String(row.icon||'check')})));form.setValue('highlights',highlights as unknown as ProjectInput['highlights'],{shouldDirty:true,shouldValidate:true});syncProject({...form.getValues(),highlights:highlights as unknown as ProjectInput['highlights']})}} renderItem={(row,_index,patch)=><div className="cms-form-grid"><Field label="Highlight text"><Textarea value={String(row.text??'')} onChange={(event)=>patch({text:event.target.value})}/></Field><Field label="Icon"><Input value={String(row.icon||'check')} onChange={(event)=>patch({icon:event.target.value})}/></Field></div>}/></details>
      <details className="cms-form-section"><summary>Media</summary>
        <ImageUpload label="Project thumbnail" value={form.watch('thumbnail')} alt={form.watch('thumbnailAlt')} fallback="" neutralPlaceholder onChange={(path)=>{form.setValue('thumbnail',path,{shouldDirty:true,shouldValidate:true});syncProject({...form.getValues(),thumbnail:path})}} onAltChange={(alt)=>{form.setValue('thumbnailAlt',alt,{shouldDirty:true,shouldValidate:true});syncProject({...form.getValues(),thumbnailAlt:alt})}}/>
        <ImageUpload label="Case-study cover" value={form.watch('coverImage')} alt={form.watch('coverImageAlt')} fallback="" neutralPlaceholder onChange={(path)=>{form.setValue('coverImage',path,{shouldDirty:true,shouldValidate:true});syncProject({...form.getValues(),coverImage:path})}} onAltChange={(alt)=>{form.setValue('coverImageAlt',alt,{shouldDirty:true,shouldValidate:true});syncProject({...form.getValues(),coverImageAlt:alt})}}/>
      </details>
      <aside className="cms-project-live-preview"><div className="cms-preview-header"><h2>Project preview</h2></div><article className="cms-project-preview-card"><span className="cms-preview-eyebrow">{form.watch('category') || 'Project'} · {form.watch('year') || 'Year'}</span><h3>{form.watch('title')}</h3><p>{form.watch('shortDesc')}</p><small>{form.watch('employer') || ''}</small><small>{form.watch('status') || 'Draft'}</small><div className="cms-tags">{(form.watch('stack') ?? []).map((tag)=><span className="cms-tag" key={tag}>{tag}</span>)}</div></article></aside>
    </form>}
  </div>;
}

export default function ContentManager({ section }: { section: Section }) {
  const router = useRouter();
  const [draft,setDraft]=useState<PortfolioRelease|null>(null);
  const [published,setPublished]=useState<PortfolioRelease|null>(null);
  const [saveState,setSaveState]=useState('Loading draft…');
  const [saveError,setSaveError]=useState('');
  const [dirty,setDirty]=useState(false);
  const [toast,setToast]=useState<{type:'success'|'error';text:string}|null>(null);
  const [review,setReview]=useState(false);
  const [previewOpen,setPreviewOpen]=useState(true);
  const [tabsOverflow,setTabsOverflow]=useState({left:false,right:false});
  const [errorSections,setErrorSections]=useState<Set<string>>(new Set());
  const [validationFailures,setValidationFailures]=useState<FormattedValidationIssue[]>([]);
  const tabsRef=useRef<HTMLDivElement|null>(null);
  const baseline=useRef<PortfolioRelease|null>(null);
  const latest=useRef<PortfolioRelease|null>(null);
  latest.current=draft;

  const load=useCallback(async()=>{try{const [draftResponse,publishedResponse]=await Promise.all([fetch('/api/admin/draft'),fetch('/api/admin/publish')]);if(!draftResponse.ok)throw new Error('Unable to load draft');const loaded=await readJsonResponse<PortfolioRelease>(draftResponse);if(!loaded)throw new Error('Draft response was empty or invalid.');const normalized=JSON.parse(JSON.stringify(loaded)) as PortfolioRelease;const content=normalized.content as unknown as Record<string,unknown>;let seeded=false;const contact=(content.contact&&typeof content.contact==='object'?content.contact:{}) as Record<string,unknown>;const contactDefaults=portfolioData.contact as Record<string,unknown>;if(!String(contact.title||'').trim()){contact.title=contactDefaults.title;seeded=true}if(!String(contact.description||'').trim()){contact.description=contactDefaults.description;seeded=true}if(!String(contact.buttonLabel||'').trim()){contact.buttonLabel=contactDefaults.buttonLabel;seeded=true}if(!Array.isArray(contact.links)||contact.links.length===0){contact.links=contactDefaults.links;seeded=true}else{const links=contact.links as Array<Record<string,unknown>>;const clean=links.filter((link)=>String(link.label||'').trim()||String(link.url||'').trim());if(clean.length!==links.length){contact.links=clean;seeded=true}if(clean.length===0){contact.links=contactDefaults.links;seeded=true}}content.contact=contact;const terminal=(content.terminal&&typeof content.terminal==='object'?content.terminal:{}) as Record<string,unknown>;const terminalDefaults=portfolioData.terminal as Record<string,unknown>;if(!String(terminal.welcome||'').trim()){terminal.welcome=terminalDefaults.welcome;seeded=true}if(!String(terminal.prompt||'').trim()){terminal.prompt=terminalDefaults.prompt;seeded=true}if(!Array.isArray(terminal.help)||terminal.help.length===0){terminal.help=terminalDefaults.help;seeded=true}if(!Array.isArray(terminal.commands)||terminal.commands.length===0){terminal.commands=terminalDefaults.commands;seeded=true}else{const commands=terminal.commands as Array<Record<string,unknown>>;const clean=commands.filter((command)=>String(command.command||'').trim());if(clean.length!==commands.length){terminal.commands=clean;seeded=true}if(clean.length===0){terminal.commands=terminalDefaults.commands;seeded=true}}content.terminal=terminal;const skills=(content.skills&&typeof content.skills==='object'?content.skills:{}) as Record<string,unknown>;for(const [category,rows] of Object.entries(skills)){if(!Array.isArray(rows))continue;const clean=rows.filter((row)=>row&&typeof row==='object'&&String((row as {name?:unknown}).name||'').trim());if(clean.length!==rows.length){skills[category]=clean;seeded=true}}content.skills=skills;setDraft(normalized);baseline.current=JSON.parse(JSON.stringify(normalized));if(publishedResponse.ok)setPublished(await readJsonResponse<PortfolioRelease>(publishedResponse));if(seeded){setDirty(true);setSaveState('Empty items removed; defaults repaired');}else setSaveState('No unsaved changes');}catch(error){setSaveState(error instanceof Error?error.message:'Unable to load draft')}},[]);
  useEffect(()=>{load()},[load]);
  useEffect(()=>{function publishRequest(){setReview(true)}window.addEventListener('admin-publish-request',publishRequest);return()=>window.removeEventListener('admin-publish-request',publishRequest)},[]);
  useEffect(()=>{function validation(event:Event){const detail=(event as CustomEvent<{section:string;error:boolean}>).detail;setErrorSections((current)=>{const next=new Set(current);detail.error?next.add(detail.section):next.delete(detail.section);return next})}window.addEventListener('admin-section-validation',validation);return()=>window.removeEventListener('admin-section-validation',validation)},[]);

  const save=useCallback(async(next?:PortfolioRelease)=>{
    if(!latest.current&&!next)return;
    const value=next??latest.current!;
    setSaveError('');
    setSaveState('Saving…');
    try{const response=await fetch('/api/admin/draft',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});if(!response.ok){const payload=await readJsonResponse<{error?:string;failures?:FormattedValidationIssue[]}>(response);setValidationFailures(payload?.failures??[]);throw new Error(payload?.error||'Draft validation failed');}setValidationFailures([]);setDirty(false);baseline.current=JSON.parse(JSON.stringify(value));setSaveState(`Saved ${new Intl.DateTimeFormat('en',{hour:'numeric',minute:'2-digit'}).format(new Date())}`);window.dispatchEvent(new CustomEvent('admin-draft-changed',{detail:{count:1}}));}catch(error){const message=error instanceof Error?error.message:'Unable to save draft';setSaveState(message);setSaveError(message)}},
  []);
  useEffect(()=>{if(!dirty||!draft)return;setSaveState('Unsaved changes');const timer=window.setTimeout(()=>save(draft),1500);return()=>window.clearTimeout(timer)},[draft,dirty,save]);
  useEffect(()=>{function beforeUnload(event:BeforeUnloadEvent){if(dirty){event.preventDefault();event.returnValue=''}}window.addEventListener('beforeunload',beforeUnload);return()=>window.removeEventListener('beforeunload',beforeUnload)},[dirty]);

  const update = useCallback((next: PortfolioRelease) => {
    setDraft((current) => {
      if (JSON.stringify(current) === JSON.stringify(next)) return current;
      return next;
    });
    setDirty((current) => current || true);
  }, []);
  function discard() {
    if (baseline.current) setDraft(JSON.parse(JSON.stringify(baseline.current)));
    setDirty(false);
    setSaveError('');
    setSaveState('No unsaved changes');
  }
  async function publish(){if(!draft)return;try{setSaveState('Publishing…');const response=await fetch('/api/admin/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});if(!response.ok){const payload=await readJsonResponse<{error?:string}>(response);throw new Error(payload?.error||'Publishing failed');}const result=await readJsonResponse<{publishedAt?:string}>(response);setPublished(draft);setDirty(false);setSaveState(`Published ${new Intl.DateTimeFormat('en',{dateStyle:'medium',timeStyle:'short'}).format(new Date())}`);setReview(false);setToast({type:'success',text:'Portfolio published successfully.'});window.dispatchEvent(new CustomEvent('admin-published',{detail:{time:result?.publishedAt}}));}catch(error){setReview(false);setToast({type:'error',text:error instanceof Error?error.message:'Unable to publish. Please retry.'})}}

  useEffect(()=>{if(!toast)return;const timer=window.setTimeout(()=>setToast(null),5000);return()=>window.clearTimeout(timer)},[toast]);

  const activeSection=useMemo(()=>section.toLowerCase(),[section]);
  useEffect(() => {
    const element = tabsRef.current;
    if (!element) return;
    const updateOverflow = () => setTabsOverflow({ left: element.scrollLeft > 2, right: element.scrollLeft + element.clientWidth < element.scrollWidth - 2 });
    updateOverflow();
    element.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    element.addEventListener('scroll', updateOverflow);
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);
    return () => { element.removeEventListener('scroll', updateOverflow); observer.disconnect(); };
  }, [activeSection]);

  function sectionChanged(item: typeof sections[number]) {
    if (!draft || !baseline.current) return false;
    const key = item.toLowerCase();
    if (key === 'profile' || key === 'hero' || key === 'about' || key === 'contact') {
      const draftRecord = draft.content as unknown as Record<string, unknown>;
      const baseRecord = baseline.current.content as unknown as Record<string, unknown>;
      return JSON.stringify(draftRecord[key === 'profile' ? 'personal' : key]) !== JSON.stringify(baseRecord[key === 'profile' ? 'personal' : key]);
    }
    return JSON.stringify((draft.content as unknown as Record<string, unknown>)[key]) !== JSON.stringify((baseline.current.content as unknown as Record<string, unknown>)[key]);
  }
  function tabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % sections.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + sections.length) % sections.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = sections.length - 1;
    router.push(`/admin/content/${sections[next].toLowerCase()}`);
  }
  if(!draft)return <p className="admin-empty">{saveState}</p>;
  return <>
    <header className="admin-header"><div><p className="admin-eyebrow">Draft editor</p><h1>Content manager</h1><p className={`cms-save-state${dirty?' is-dirty':''}`} role="status">{dirty?'Unsaved changes · ':''}{saveState}</p></div></header>
    <div className={`cms-tabs-shell${tabsOverflow.left?' fade-left':''}${tabsOverflow.right?' fade-right':''}`}>
      {tabsOverflow.left && <button type="button" className="cms-tab-scroll left" aria-label="Scroll tabs left" onClick={()=>tabsRef.current?.scrollBy({left:-220,behavior:'smooth'})}><ChevronLeft size={16}/></button>}
      <div className="cms-tabs" role="tablist" aria-label="Portfolio sections" ref={tabsRef}>{sections.map((item,index)=>{const key=item.toLowerCase();const changed=sectionChanged(item);const error=errorSections.has(item);return <button key={item} role="tab" aria-selected={activeSection===key} tabIndex={activeSection===key?0:-1} className={activeSection===key?'is-active':''} onClick={()=>router.push(`/admin/content/${key}`)} onKeyDown={(event)=>tabKeyDown(event,index)}>{error?<span className="cms-status-dot is-error" title={`${item} has validation errors`}/>:changed&&<span className="cms-status-dot is-draft" title={`${item} has unpublished changes`}/>}<span>{item}</span></button>})}</div>
      {tabsOverflow.right && <button type="button" className="cms-tab-scroll right" aria-label="Scroll tabs right" onClick={()=>tabsRef.current?.scrollBy({left:220,behavior:'smooth'})}><ChevronRight size={16}/></button>}
    </div>
    <select className="cms-mobile-select" aria-label="Portfolio section" value={activeSection} onChange={(event)=>router.push(`/admin/content/${event.target.value}`)}>{sections.map(item=>{const key=item.toLowerCase();return <option value={key} key={key}>{item}</option>})}</select>
    <section className="cms-editor">
      {validationFailures.length>0&&<section className="cms-validation-summary" aria-labelledby="validation-summary-title"><h2 id="validation-summary-title">Draft validation needs attention</h2><ul>{validationFailures.map((failure,index)=><li key={`${failure.tab}-${failure.field}-${index}`}><a href={`/admin/content/${failure.tab.toLowerCase()}${failure.itemIndex===undefined?'':`#item-${failure.itemIndex}`}`}><strong>{failure.tab}</strong> · {failure.item} · {failure.field}: {failure.message}</a></li>)}</ul></section>}
      {section==='Profile'&&<div className="cms-profile-layout"><PersonalEditor draft={draft} update={update}/><aside className={`cms-live-preview${previewOpen?'':' is-collapsed'}`}><div className="cms-preview-header"><h2>Live preview</h2><button type="button" className="admin-button" onClick={()=>setPreviewOpen((value)=>!value)}>{previewOpen?'Collapse':'Expand'}</button></div>{previewOpen&&<div className="cms-preview-hero"><span className="cms-preview-eyebrow">{draft.content.personal.role}</span><h3>{draft.content.personal.name}</h3><p>{draft.content.personal.tagline}</p><p>{draft.content.personal.bio}</p><div className="cms-preview-links"><span>{draft.content.personal.github}</span><span>{draft.content.personal.linkedin}</span></div></div>}</aside></div>}
      {section==='Projects'&&<ProjectsEditor draft={draft} update={update}/>}
      {section==='Skills'&&<RepeatEditor section="Skills" draft={draft} update={update}/>}
      {section==='Hero'&&<HeroEditor draft={draft} update={update}/>}
      {section==='About'&&<AboutEditor draft={draft} update={update}/>}
      {section==='Tools'&&<RepeatEditor section="Tools" draft={draft} update={update}/>}
      {section==='Experience'&&<RepeatEditor section="Experience" draft={draft} update={update}/>}
      {section==='Education'&&<RepeatEditor section="Education" draft={draft} update={update}/>}
      {section==='Certifications'&&<RepeatEditor section="Certifications" draft={draft} update={update}/>}
      {section==='Timeline'&&<RepeatEditor section="Timeline" draft={draft} update={update}/>}
      {section==='Stats'&&<RepeatEditor section="Stats" draft={draft} update={update}/>}
      {section==='Workflow'&&<RepeatEditor section="Workflow" draft={draft} update={update}/>}
      {section==='Terminal'&&<RepeatEditor section="Terminal" draft={draft} update={update}/>}
      {section==='Contact'&&<RepeatEditor section="Contact" draft={draft} update={update}/>}
    </section>
    <DraftSaveBar state={saveState} dirty={dirty} error={saveError} onDiscard={discard} onSave={()=>void save()} onRetry={()=>void save()} />
    {review&&<div className="cms-dialog-backdrop" role="presentation"><div className="cms-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-title"><p className="admin-eyebrow">Review changes</p><h2 id="publish-title">Publish portfolio</h2><p>Changed sections will replace the live public release after confirmation.</p><div className="cms-diff">{sections.filter(item=>item==='Profile'||item==='Projects'||item==='Hero'||item==='About'||item==='Skills'||item==='Tools'||item==='Experience'||item==='Education'||item==='Certifications'||item==='Timeline'||item==='Stats'||item==='Workflow'||item==='Terminal'||item==='Contact').map(item=><div key={item}><span>{item}</span><span className={dirty?'is-changed':'is-current'}>{dirty?'Draft changed':'Unchanged'}</span></div>)}</div><div className="cms-dialog-actions"><button className="admin-button" onClick={()=>setReview(false)}>Cancel</button><button className="admin-button primary" onClick={publish}>Confirm publish</button></div></div></div>}
    {toast&&<div className={`cms-toast ${toast.type}`} role="status" aria-live="polite"><CheckCircle2 size={18}/><span>{toast.text}</span>{toast.type==='error'&&<button onClick={publish}>Retry</button>}</div>}
  </>;
}
