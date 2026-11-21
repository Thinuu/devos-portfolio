const sectionLabels: Record<string, string> = {
  personal: 'Profile', hero: 'Hero', about: 'About', projects: 'Projects', skills: 'Skills',
  skillCategories: 'Skills', tools: 'Tools', experience: 'Experience', education: 'Education',
  certifications: 'Certifications', timeline: 'Timeline', stats: 'Stats', workflow: 'Workflow',
  terminal: 'Terminal', contact: 'Contact', navigation: 'Navigation', footer: 'Footer', sections: 'Sections',
};

const collectionKeys: Record<string, string> = {
  projects: 'projects', tools: 'tools', experience: 'experience', education: 'education',
  certifications: 'certifications', timeline: 'timeline', stats: 'stats', workflow: 'workflow',
};

export type FormattedValidationIssue = {
  tab: string;
  item: string;
  field: string;
  message: string;
  itemIndex?: number;
};

export function formatValidationIssues(
  issues: Array<{ path: PropertyKey[]; message: string }>,
  content: unknown,
): FormattedValidationIssue[] {
  const root = content && typeof content === 'object' ? content as Record<string, unknown> : {};
  return issues.map((issue) => {
    const path = issue.path.map(String);
    if (path[0] === 'content') path.shift();
    let sectionKey = path[0] || 'content';
    if (sectionKey === 'skillCategories') sectionKey = 'skillCategories';
    const tab = sectionLabels[sectionKey] || 'Profile';
    let item = 'Section';
    let itemIndex: number | undefined;
    let fieldPath = path.slice(1);
    const firstValue = root[sectionKey];
    if (sectionKey === 'contact' || sectionKey === 'terminal') {
      const record = firstValue && typeof firstValue === 'object' ? firstValue as Record<string, unknown> : {};
      const collection = sectionKey === 'contact' ? 'links' : 'commands';
      if (fieldPath[0] === collection && /^\d+$/.test(fieldPath[1] || '')) {
        itemIndex = Number(fieldPath[1]);
        const entry = Array.isArray(record[collection]) ? record[collection][itemIndex] as Record<string, unknown> | undefined : undefined;
        item = String(entry?.label || entry?.command || (sectionKey === 'contact' ? 'Contact link' : 'Command'));
        fieldPath = fieldPath.slice(2);
      } else item = sectionKey === 'contact' ? 'Contact details' : 'Terminal settings';
    } else if (collectionKeys[sectionKey] && /^\d+$/.test(fieldPath[0] || '')) {
      itemIndex = Number(fieldPath[0]);
      const rows = firstValue as Array<Record<string, unknown>> | undefined;
      const row = Array.isArray(rows) ? rows[itemIndex] : undefined;
      item = String(row?.title || row?.name || row?.role || row?.degree || row?.label || row?.issuer || sectionKey);
      fieldPath = fieldPath.slice(1);
    } else if (sectionKey === 'projects' && /^\d+$/.test(fieldPath[0] || '')) {
      itemIndex = Number(fieldPath[0]);
      const rows = root.projects as Array<Record<string, unknown>> | undefined;
      item = String(Array.isArray(rows) ? rows[itemIndex]?.title || 'Project' : 'Project');
      fieldPath = fieldPath.slice(1);
    } else {
      item = sectionKey === 'skillCategories' ? 'Toolkit category' : sectionLabels[sectionKey] || 'Section';
    }
    return { tab, item, field: fieldPath.join('.') || sectionKey, message: issue.message, itemIndex };
  });
}
