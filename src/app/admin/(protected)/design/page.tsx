'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Copy, Download, Monitor, RotateCcw, Smartphone, Tablet, Undo2, Redo2, Upload } from 'lucide-react';
import { themePresets } from '@/lib/design/themePresets';
import { lavenderCharcoalConfig } from '@/lib/design/defaults';
import { contrastBadge, contrastRatio, deriveAccentSoft } from '@/lib/design/contrast';
import type { DesignConfig } from '@/lib/schemas/design.schema';
import { readJsonResponse } from '@/lib/http/json';

const tabs = ['Presets', 'Colours', 'Typography', 'Layout', 'Components', 'Backgrounds', 'Animations', 'Sections'] as const;
type Tab = typeof tabs[number];
type PageName = 'Home' | 'Project' | '404';
type Device = 'Desktop' | 'Tablet' | 'Mobile';

const fontPairs = [
  { display: 'Space Grotesk', body: 'Inter', mono: 'JetBrains Mono' },
  { display: 'Sora', body: 'Inter', mono: 'JetBrains Mono' },
  { display: 'Playfair Display', body: 'Inter', mono: 'JetBrains Mono' },
];

function cloneConfig(config: DesignConfig): DesignConfig {
  return JSON.parse(JSON.stringify(config)) as DesignConfig;
}

export default function DesignStudio() {
  const [config, setConfig] = useState<DesignConfig>(lavenderCharcoalConfig);
  const [published, setPublished] = useState<DesignConfig>(lavenderCharcoalConfig);
  const [baseline, setBaseline] = useState<DesignConfig>(lavenderCharcoalConfig);
  const [tab, setTab] = useState<Tab>('Presets');
  const [page, setPage] = useState<PageName>('Home');
  const [device, setDevice] = useState<Device>('Desktop');
  const [zoom, setZoom] = useState(100);
  const [compare, setCompare] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState('Loading design…');
  const [error, setError] = useState('');
  const [review, setReview] = useState(false);
  const [toast, setToast] = useState('');
  const [undoStack, setUndoStack] = useState<DesignConfig[]>([]);
  const [redoStack, setRedoStack] = useState<DesignConfig[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/design/draft'),
      fetch('/api/admin/design/publish'),
    ]).then(async ([draftResponse, publishedResponse]) => {
      if (draftResponse.ok) {
        const draft = await readJsonResponse<{ config: DesignConfig }>(draftResponse);
        if (draft?.config) {
          setConfig(draft.config);
          setBaseline(cloneConfig(draft.config));
        }
      }
      if (publishedResponse.ok) {
        const pub = await readJsonResponse<{ config: DesignConfig }>(publishedResponse);
        if (pub?.config) setPublished(pub.config);
      }
      setSaveState('Saved');
    }).catch(() => setSaveState('Unable to load design'));
  }, []);

  const update = useCallback((next: DesignConfig) => {
    setConfig((current) => {
      if (JSON.stringify(current) === JSON.stringify(next)) return current;
      setUndoStack((stack) => [...stack.slice(-29), cloneConfig(current)]);
      setRedoStack([]);
      setDirty(true);
      setSaveState('Unsaved changes');
      return cloneConfig(next);
    });
  }, []);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({ type: 'design-preview-config', config }, window.location.origin);
  }, [config, page, device]);

  useEffect(() => {
    if (!dirty) return;
    setSaveState('Unsaved changes');
    const timer = window.setTimeout(() => void saveDraft(), 1500);
    return () => window.clearTimeout(timer);
  }, [config, dirty]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  useEffect(() => {
    const openReview = () => setReview(true);
    window.addEventListener('admin-publish-request', openReview);
    return () => window.removeEventListener('admin-publish-request', openReview);
  }, []);

  async function saveDraft() {
    setSaveState('Saving…');
    setError('');
    const response = await fetch('/api/admin/design/draft', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configRef.current),
    });
    if (!response.ok) {
      const payload = await readJsonResponse<{ error?: string }>(response);
      setError(payload?.error || 'Unable to save design draft.');
      setSaveState('Save failed');
      return;
    }
    setBaseline(cloneConfig(configRef.current));
    setDirty(false);
    setSaveState(`Saved ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date())}`);
  }

  function undo() {
    if (!undoStack.length) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((stack) => [...stack, cloneConfig(config)]);
    setUndoStack((stack) => stack.slice(0, -1));
    setConfig(cloneConfig(previous));
    setDirty(true);
  }

  function redo() {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack, cloneConfig(config)]);
    setRedoStack((stack) => stack.slice(0, -1));
    setConfig(cloneConfig(next));
    setDirty(true);
  }

  function resetToPublished() {
    setConfig(cloneConfig(published));
    setDirty(true);
  }

  function discard() {
    setConfig(cloneConfig(baseline));
    setDirty(false);
    setSaveState('Saved');
  }

  async function publish() {
    setSaveState('Publishing…');
    const response = await fetch('/api/admin/design/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const payload = await readJsonResponse<{ error?: string }>(response);
      setError(payload?.error || 'Unable to publish design.');
      setReview(false);
      setSaveState('Publish failed');
      setToast(payload?.error || 'Unable to publish design.');
      return;
    }
    const payload = await readJsonResponse<{ publishedAt?: string }>(response);
    setPublished(cloneConfig(config));
    setBaseline(cloneConfig(config));
    setDirty(false);
    setReview(false);
    setSaveState(`Published ${payload?.publishedAt ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(payload.publishedAt)) : 'now'}`);
    setToast('Design published successfully.');
  }

  function selectPreset(next: DesignConfig) {
    update({ ...cloneConfig(next), presetId: next.presetId, name: next.name });
  }

  function updateColor(key: keyof DesignConfig['colors'], value: string) {
    const next = cloneConfig(config);
    next.colors[key] = value;
    if (key === 'accent') {
      next.colors.accentSoft = deriveAccentSoft(value);
    }
    update(next);
  }

  function duplicatePreset() {
    const copy = cloneConfig(config);
    copy.presetId = `custom-${Date.now()}`;
    copy.name = `${config.name || 'Custom preset'} Copy`;
    copy.customPresets = [...(config.customPresets || [])];
    update(copy);
  }

  function saveNamedPreset() {
    const name = window.prompt('Preset name');
    if (!name?.trim()) return;
    const next = cloneConfig(config);
    next.presetId = `custom-${Date.now()}`;
    next.name = name.trim();
    next.customPresets = [...(next.customPresets || []), { id: next.presetId, name: next.name, config: JSON.parse(JSON.stringify(next)) as unknown as Record<string, unknown> }];
    update(next);
  }

  function exportPreset() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(config.name || 'design-preset').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importPreset(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        update(parsed as DesignConfig);
      } catch {
        setError('Preset JSON is invalid.');
      }
    };
    reader.readAsText(file);
  }

  const previewSrc = `/admin/preview/${page === 'Home' ? 'home' : page === 'Project' ? 'project' : '404'}`;
  const previewWidth = device === 'Desktop' ? '100%' : device === 'Tablet' ? '768px' : '390px';

  return (
    <>
      <header className="design-workspace-header">
        <div><p className="admin-eyebrow">Visual system</p><h1>Design studio</h1><p className="design-active-name">{config.name || 'Custom preset'} <span className={dirty ? 'is-dirty' : 'is-applied'}>{dirty ? 'Unsaved changes' : 'Applied'}</span></p></div>
      </header>
      <div className="design-workspace">
        <aside className="design-controls">
          <nav className="design-tabs" aria-label="Design studio sections" role="tablist">
            {tabs.map((item) => <button type="button" role="tab" aria-selected={tab === item} key={item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>{item}</button>)}
          </nav>
          {tab === 'Presets' && (
            <section className="design-tab-panel">
              <div className="design-panel-heading"><h2>Presets</h2><button type="button" className="admin-button" onClick={() => update(cloneConfig(lavenderCharcoalConfig))}><RotateCcw size={14} /> Reset to default</button></div>
              <div className="design-preset-grid">
                {themePresets.map((preset) => (
                  <button type="button" className={`design-preset-card${config.presetId === preset.presetId ? ' is-active' : ''}`} key={preset.presetId} onClick={() => selectPreset(preset)}>
                    <div className="design-preset-mini" style={{ background: preset.colors.bg, color: preset.colors.text }}>
                      <span style={{ background: preset.colors.surface }} /><strong style={{ color: preset.colors.accent }}>Aa</strong>
                    </div>
                    <span>{preset.name}</span>{config.presetId === preset.presetId && <Check size={14} />}
                  </button>
                ))}
              </div>
              <div className="design-actions-row">
                <button type="button" className="admin-button" onClick={duplicatePreset}><Copy size={14} /> Duplicate</button>
                <button type="button" className="admin-button" onClick={saveNamedPreset}>Save as preset</button>
                <button type="button" className="admin-button" onClick={exportPreset}><Download size={14} /> Export</button>
                <label className="admin-button"><Upload size={14} /> Import<input type="file" accept="application/json" hidden onChange={(event) => importPreset(event.target.files?.[0])} /></label>
              </div>
            </section>
          )}
          {tab === 'Colours' && (
            <section className="design-tab-panel">
              <h2>Colours</h2>
              {(['Surfaces','Text','Accent','Status'] as const).map((group) => (
                <fieldset className="design-fieldset" key={group}><legend>{group}</legend>
                  {(group === 'Surfaces'
                    ? ['bg','bgSoft','surface','surfaceRaised','border'] as const
                    : group === 'Text'
                      ? ['text','textSoft','muted'] as const
                      : group === 'Accent'
                        ? ['accent','accentSoft','borderSoft'] as const
                        : ['success','warning','danger'] as const).map((key) => (
                    <label className="design-token-row" key={key}>
                      <span>{key}</span>
                      <input type="color" value={String(config.colors[key]).startsWith('#') ? config.colors[key] : '#777777'} onChange={(event) => updateColor(key as keyof DesignConfig['colors'], event.target.value)} />
                      <input type="text" value={config.colors[key]} onChange={(event) => /^#[0-9a-f]{6}$/i.test(event.target.value) && updateColor(key as keyof DesignConfig['colors'], event.target.value)} />
                    </label>
                  ))}
                </fieldset>
              ))}
              <div className="design-contrast">
                {(['text','textSoft','accent'] as const).map((key) => {
                  const ratio = contrastRatio(config.colors[key], config.colors.bg);
                  const badge = contrastBadge(ratio);
                  return <div key={key}><span>{key}</span><strong>{ratio.toFixed(2)}:1</strong><em className={badge === 'Fail' ? 'is-fail' : ''}>{badge}</em></div>;
                })}
              </div>
            </section>
          )}
          {tab === 'Typography' && (
            <section className="design-tab-panel">
              <h2>Typography</h2>
              {fontPairs.map((pair) => <button type="button" className="design-font-pair" key={pair.display} onClick={() => update({ ...cloneConfig(config), typography: { ...config.typography, display: pair.display, body: pair.body, mono: pair.mono } })}><strong style={{ fontFamily: pair.display }}>{pair.display} + {pair.body}</strong><small>{pair.mono}</small></button>)}
              {(['display','body','mono'] as const).map((key) => <label className="design-control" key={key}><span>{key} font</span><select value={config.typography[key]} onChange={(event) => update({ ...cloneConfig(config), typography: { ...config.typography, [key]: event.target.value } })}>{['Space Grotesk','Inter','JetBrains Mono','Sora','Playfair Display','Arial'].map((font) => <option key={font}>{font}</option>)}</select></label>)}
              <label className="design-control"><span>Base size <b>{config.typography.baseSize}px</b></span><input type="range" min="14" max="22" value={config.typography.baseSize} onChange={(event) => update({ ...cloneConfig(config), typography: { ...config.typography, baseSize: Number(event.target.value) } })} /></label>
              <label className="design-control"><span>Scale ratio <b>{config.typography.scaleRatio.toFixed(2)}</b></span><input type="range" min="105" max="150" value={Math.round(config.typography.scaleRatio * 100)} onChange={(event) => update({ ...cloneConfig(config), typography: { ...config.typography, scaleRatio: Number(event.target.value) / 100 } })} /></label>
            </section>
          )}
          {tab === 'Layout' && (
            <section className="design-tab-panel">
              <h2>Layout</h2>
              <label className="design-control"><span>Container <b>{config.layout.containerWidth}px</b></span><input type="range" min="960" max="1600" step="8" value={config.layout.containerWidth} onChange={(event) => update({ ...cloneConfig(config), layout: { ...config.layout, containerWidth: Number(event.target.value) } })} /></label>
              <label className="design-control"><span>Radius <b>{config.layout.radius}px</b></span><input type="range" min="0" max="40" value={config.layout.radius} onChange={(event) => update({ ...cloneConfig(config), layout: { ...config.layout, radius: Number(event.target.value) } })} /></label>
              <label className="design-control"><span>Section spacing</span><select value={config.layout.sectionSpacing} onChange={(event) => update({ ...cloneConfig(config), layout: { ...config.layout, sectionSpacing: event.target.value as DesignConfig['layout']['sectionSpacing'] } })}><option>compact</option><option>comfortable</option><option>spacious</option></select></label>
            </section>
          )}
          {tab === 'Components' && (
            <section className="design-tab-panel">
              <h2>Components</h2>
              {(['buttonStyle','cardStyle','navStyle','headingAccentStyle','linkHoverStyle'] as const).map((key) => (
                <label className="design-control" key={key}><span>{key.replace(/([A-Z])/g, ' $1')}</span><select value={config.components[key]} onChange={(event) => update({ ...cloneConfig(config), components: { ...config.components, [key]: event.target.value } as DesignConfig['components'] })}>{key === 'buttonStyle' ? ['solid','outline','ghost','pill'].map((value)=><option key={value}>{value}</option>) : key === 'cardStyle' ? ['flat','bordered','glass','raised'].map((value)=><option key={value}>{value}</option>) : key === 'navStyle' ? ['sticky blur','floating','minimal','transparent'].map((value)=><option key={value}>{value}</option>) : key === 'headingAccentStyle' ? ['colour','underline','gradient','highlight'].map((value)=><option key={value}>{value}</option>) : ['accent','underline','lift'].map((value)=><option key={value}>{value}</option>)}</select></label>
              ))}
            </section>
          )}
          {tab === 'Backgrounds' && (
            <section className="design-tab-panel">
              <h2>Background</h2>
              <label className="design-control"><span>Type</span><select value={config.background.type} onChange={(event) => update({ ...cloneConfig(config), background: { ...config.background, type: event.target.value as DesignConfig['background']['type'] } })}>{['solid','gradient','grid','noise','orbit drift','floating code glyphs','particles','aurora','none'].map((value)=><option key={value}>{value}</option>)}</select></label>
              <label className="design-control"><span>Intensity <b>{config.background.intensity}%</b></span><input type="range" min="0" max="100" value={config.background.intensity} onChange={(event) => update({ ...cloneConfig(config), background: { ...config.background, intensity: Number(event.target.value) } })} /></label>
              <label className="design-control"><span>Speed <b>{config.background.speed}%</b></span><input type="range" min="0" max="100" value={config.background.speed} onChange={(event) => update({ ...cloneConfig(config), background: { ...config.background, speed: Number(event.target.value) } })} /></label>
            </section>
          )}
          {tab === 'Animations' && (
            <section className="design-tab-panel">
              <h2>Motion</h2>
              {(['Subtle','Cinematic','Playful','Terminal','Minimal','None'] as const).map((pack) => <button type="button" className={`design-motion-card${config.motion.pack === pack ? ' is-active' : ''}`} key={pack} onClick={() => update({ ...cloneConfig(config), motion: { ...config.motion, pack } })}><strong>{pack}</strong><span className="design-motion-demo" /></button>)}
              <label className="design-control"><span>Intensity <b>{config.motion.intensity}%</b></span><input type="range" min="0" max="100" value={config.motion.intensity} onChange={(event) => update({ ...cloneConfig(config), motion: { ...config.motion, intensity: Number(event.target.value) } })} /></label>
              {([
                ['pageTransitions','Page transitions'],['scrollReveal','Scroll reveals'],['hoverTap','Hover and tap'],['sectionEntrances','Section entrances'],['introBootSequence','Intro sequence'],['floatingGlyphs','Floating glyphs'],['cursorEffects','Cursor effects'],
              ] as const).map(([key,label]) => <label className="design-toggle" key={key}><input type="checkbox" checked={config.motion[key]} onChange={(event) => update({ ...cloneConfig(config), motion: { ...config.motion, [key]: event.target.checked } })} /> {label}</label>)}
            </section>
          )}
          {tab === 'Sections' && (
            <section className="design-tab-panel">
              <h2>Section overrides</h2>
              {(['hero','about','journey','toolkit','work','education','contact'] as const).map((section) => (
                <fieldset className="design-fieldset" key={section}>
                  <legend>{section}</legend>
                  <label className="design-control"><span>Layout</span><select value={config.sections[section]?.layout || 'inherit'} onChange={(event) => update({ ...cloneConfig(config), sections: { ...config.sections, [section]: { ...config.sections[section], layout: event.target.value as 'inherit' } } })}><option>inherit</option><option>split</option><option>centred</option><option>list</option><option>grid</option><option>expandable</option><option>compact tags</option></select></label>
                  <label className="design-control"><span>Animation</span><select value={config.sections[section]?.animation || 'inherit'} onChange={(event) => update({ ...cloneConfig(config), sections: { ...config.sections, [section]: { ...config.sections[section], animation: event.target.value as 'inherit' } } })}><option>inherit</option>{['Subtle','Cinematic','Playful','Terminal','Minimal','None'].map((value)=><option key={value}>{value}</option>)}</select></label>
                  <label className="design-control"><span>Spacing</span><select value={config.sections[section]?.spacing || 'inherit'} onChange={(event) => update({ ...cloneConfig(config), sections: { ...config.sections, [section]: { ...config.sections[section], spacing: event.target.value as 'inherit' } } })}><option>inherit</option><option>compact</option><option>comfortable</option><option>spacious</option></select></label>
                </fieldset>
              ))}
            </section>
          )}
        </aside>
        <main className="design-preview-column">
          <div className="design-preview-toolbar">
            <label><select value={page} onChange={(event) => setPage(event.target.value as PageName)}><option>Home</option><option>Project</option><option>404</option></select></label>
            <div className="design-device-toggle">{(['Desktop','Tablet','Mobile'] as const).map((value) => <button type="button" className={device === value ? 'is-active' : ''} key={value} onClick={() => setDevice(value)}>{value === 'Desktop' ? <Monitor size={14}/> : value === 'Tablet' ? <Tablet size={14}/> : <Smartphone size={14}/>} {value}</button>)}</div>
            <label className="design-zoom"><ChevronDown size={13}/><select value={zoom} onChange={(event)=>setZoom(Number(event.target.value))}>{[50,75,100,125].map((value)=><option key={value}>{value}%</option>)}</select></label>
            <label className="design-compare"><input type="checkbox" checked={compare} onChange={(event)=>setCompare(event.target.checked)} /> Compare</label>
            <button type="button" className="admin-button" onClick={() => window.open(previewSrc, '_blank', 'noopener,noreferrer')}>Open in new tab</button>
          </div>
          <div className={`design-preview-stage device-${device.toLowerCase()}${compare ? ' is-comparing' : ''}`}>
            {compare && <iframe className="design-preview-frame compare-published" title="Published design preview" src={`/admin/preview/${page === 'Home' ? 'home' : page === 'Project' ? 'project' : '404'}?published=1`} style={{ width: previewWidth, transform: `scale(${zoom / 100})` }} />}
            <iframe ref={iframeRef} className="design-preview-frame" title="Draft design preview" src={previewSrc} style={{ width: previewWidth, transform: `scale(${zoom / 100})` }} onLoad={() => iframeRef.current?.contentWindow?.postMessage({ type: 'design-preview-config', config }, window.location.origin)} />
          </div>
        </main>
      </div>
      <div className="cms-sticky-actions" aria-live="polite">
        <span className={dirty ? 'is-dirty' : ''}>{error || saveState}</span>
        <div>
          <button type="button" className="admin-button" disabled={!undoStack.length} onClick={undo}><Undo2 size={15}/> Undo</button>
          <button type="button" className="admin-button" disabled={!redoStack.length} onClick={redo}><Redo2 size={15}/> Redo</button>
          <button type="button" className="admin-button" onClick={resetToPublished}>Reset to published</button>
          <button type="button" className="admin-button" disabled={!dirty} onClick={discard}>Discard</button>
          <button type="button" className="admin-button primary" disabled={!dirty || saveState === 'Saving…'} onClick={() => void saveDraft()}>Save draft</button>
        </div>
      </div>
      {review && (
        <div className="cms-dialog-backdrop" role="presentation">
          <div className="cms-dialog" role="dialog" aria-modal="true" aria-labelledby="design-publish-title">
            <p className="admin-eyebrow">Review design changes</p><h2 id="design-publish-title">Publish design</h2>
            <p>Preset: <strong>{config.name || config.presetId}</strong></p>
            <div className="cms-diff"><div><span>Colours</span><span className="is-changed">Draft changed</span></div><div><span>Typography</span><span className="is-changed">Draft changed</span></div><div><span>Layout and motion</span><span className="is-changed">Draft changed</span></div></div>
            <div className="cms-dialog-actions"><button type="button" className="admin-button" onClick={() => setReview(false)}>Cancel</button><button type="button" className="admin-button primary" onClick={() => void publish()}>Confirm publish</button></div>
          </div>
        </div>
      )}
      {toast && <div className="cms-toast success" role="status" aria-live="polite"><Check size={16}/><span>{toast}</span><button type="button" onClick={() => setToast('')}>Dismiss</button></div>}
    </>
  );
}
