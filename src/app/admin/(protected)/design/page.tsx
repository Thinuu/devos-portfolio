import { themePresets } from '@/lib/design/themePresets';

export default function DesignStudio() {
  return (
    <><header className="admin-header"><div><p className="admin-eyebrow">Visual system</p><h1>Design studio</h1></div></header>
      <section className="admin-simple-grid">{themePresets.map((preset) => <article className="admin-simple-card" key={preset.id}><p className="admin-eyebrow">{preset.mode}</p><h2>{preset.name}</h2><div style={{ display: 'flex', gap: 6, marginTop: 14 }}>{[preset.colors.background, preset.colors.surface, preset.colors.accent, preset.colors.text].map((color) => <span key={color} style={{ width: 28, height: 28, borderRadius: 6, background: color, border: '1px solid var(--border)' }} />)}</div></article>)}</section>
    </>
  );
}
