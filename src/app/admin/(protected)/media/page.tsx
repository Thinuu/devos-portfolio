import fs from 'node:fs';
import path from 'node:path';

export default function MediaLibrary() {
  const imageDirectory = path.join(process.cwd(), 'public', 'images');
  const files = fs.existsSync(imageDirectory)
    ? fs.readdirSync(imageDirectory).filter((file) => /\.(png|jpe?g|webp|svg)$/i.test(file)).sort()
    : [];

  return (
    <><header className="admin-header"><div><p className="admin-eyebrow">Portfolio assets</p><h1>Media library</h1></div></header>
      {files.length === 0 ? <div className="admin-empty"><div className="admin-simple-card"><h2>No media found</h2><p>Add optimized images to public/images to make them available here.</p></div></div> :
        <section className="admin-simple-grid">{files.map((file) => <article className="admin-simple-card" key={file}><img src={`/images/${file}`} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, background: 'var(--bg-soft)' }} /><h3>{file}</h3><p>/images/{file}</p></article>)}</section>}
    </>
  );
}
