import Link from 'next/link';

export default function SeoManager() {
  return (
    <><header className="admin-header"><div><p className="admin-eyebrow">Search visibility</p><h1>SEO</h1></div></header>
      <section className="admin-panel" style={{ display: 'grid', alignItems: 'start' }}>
        <div className="admin-form">
          <label>Base URL<input defaultValue="https://thinu.me" /></label>
          <label>Homepage title<input defaultValue="Thinu Upadya | Full-Stack Developer & Software Engineer" /></label>
          <label>Meta description<textarea rows={4} defaultValue="Explore the portfolio of Thinu Upadya, a full-stack developer and software engineer building modern web applications and digital products." /></label>
          <label>Social image<input defaultValue="/images/thinu-profile.png" /></label>
          <div className="admin-quick-links"><Link className="admin-button primary" href="/">Preview homepage</Link><Link className="admin-button" href="/sitemap.xml" target="_blank">Open sitemap</Link><Link className="admin-button" href="/robots.txt" target="_blank">Open robots.txt</Link></div>
        </div>
      </section>
    </>
  );
}
