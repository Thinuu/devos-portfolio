export default function AdminSettings() {
  return (
    <><header className="admin-header"><div><p className="admin-eyebrow">Administrator</p><h1>Settings &amp; security</h1></div></header>
      <section className="admin-dashboard-columns"><article className="admin-panel"><p className="admin-eyebrow">Session</p><h2>Protected session</h2><p className="admin-panel-copy">Administrator access uses Firebase session cookies with revocable server verification.</p></article><article className="admin-panel"><p className="admin-eyebrow">Preferences</p><h2>Admin appearance</h2><p className="admin-panel-copy">The admin console follows the public charcoal/lavender design tokens.</p></article></section>
    </>
  );
}
