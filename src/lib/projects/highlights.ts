export type ProjectHighlight = string | { text: string; icon?: string };

export type HighlightEditorRow = { id: string; text: string; icon: string };

export function highlightsToEditorRows(value: unknown): HighlightEditorRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (typeof item === 'string') return { id: `highlight-${index}`, text: item, icon: 'check' };
    if (item && typeof item === 'object') {
      const record = item as { text?: unknown; icon?: unknown };
      return {
        id: `highlight-${index}`,
        text: typeof record.text === 'string' ? record.text : '',
        icon: typeof record.icon === 'string' && record.icon ? record.icon : 'check',
      };
    }
    return { id: `highlight-${index}`, text: '', icon: 'check' };
  });
}

export function editorRowsToHighlights(rows: HighlightEditorRow[]): Array<{ text: string; icon: string }> {
  return rows.map(({ text, icon }) => ({ text: String(text ?? ''), icon: String(icon || 'check') }));
}

export function projectHighlightText(value: ProjectHighlight): string {
  return typeof value === 'string' ? value : value.text;
}
