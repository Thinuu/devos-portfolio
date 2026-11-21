export type ProjectLink = { label: string; url: string };

function linkKey(url: string) {
  try { return new URL(url).href.replace(/\/$/, '').toLowerCase(); }
  catch { return url.trim().toLowerCase(); }
}

export function getProjectLinks(project: { link?: unknown; linkLabel?: unknown; links?: unknown }): ProjectLink[] {
  const links: ProjectLink[] = [];
  if (typeof project.link === 'string' && project.link.trim()) {
    links.push({ label: typeof project.linkLabel === 'string' && project.linkLabel ? project.linkLabel : 'Visit project', url: project.link });
  }
  if (Array.isArray(project.links)) {
    for (const item of project.links) {
      if (typeof item === 'string') {
        try { links.push({ label: new URL(item).hostname.replace(/^www\./, ''), url: item }); }
        catch { links.push({ label: 'Visit project', url: item }); }
      } else if (item && typeof item === 'object') {
        const row = item as { label?: unknown; url?: unknown };
        if (typeof row.url === 'string' && row.url.trim()) links.push({ label: typeof row.label === 'string' && row.label ? row.label : 'Visit project', url: row.url });
      }
    }
  }
  const seen = new Set<string>();
  return links.filter((item) => {
    const key = linkKey(item.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
