'use client';

import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export type RepeaterItem = { id: string; hidden?: boolean };

export default function RepeaterField<T extends RepeaterItem>({
  title,
  items,
  onChange,
  renderItem,
  createItem,
  itemLabel = 'Item',
  emptyTitle,
  emptyDescription,
  showVisibility = false,
  getSummary,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, change: (patch: Partial<T>) => void) => ReactNode;
  createItem: () => T;
  itemLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  showVisibility?: boolean;
  getSummary?: (item: T, index: number) => string;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <section className="cms-repeater">
      <div className="cms-repeater-heading">
        <h2>{title}</h2>
        <button type="button" className="admin-button" onClick={() => onChange([...items, createItem()])}>
          <Plus size={15} /> Add item
        </button>
      </div>
      {items.length === 0 ? (
        <div className="cms-repeater-empty">
          <h3>{emptyTitle || `No ${itemLabel.toLowerCase()}s yet`}</h3>
          <p>{emptyDescription || `Add a ${itemLabel.toLowerCase()} to this section.`}</p>
          <button type="button" className="admin-button primary" onClick={() => onChange([...items, createItem()])}><Plus size={15} /> Add {itemLabel}</button>
        </div>
      ) : <div className="cms-repeater-list">
        {items.map((item, index) => (
          <article className="cms-repeater-item" key={item.id}>
            <div className="cms-repeater-toolbar">
              <GripVertical size={16} aria-hidden="true" />
              <button type="button" className="cms-repeater-collapse" aria-expanded={open[item.id] === true} onClick={() => setOpen((value) => ({ ...value, [item.id]: value[item.id] !== true }))}>
                {itemLabel} {index + 1}{getSummary ? ` — ${getSummary(item, index)}` : ''}
                {open[item.id] === true ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showVisibility && <label className="cms-visible-toggle"><input type="checkbox" checked={item.hidden !== true} onChange={(event) => onChange(items.map((row, rowIndex) => rowIndex === index ? { ...row, hidden: !event.target.checked } : row))} /> Visible</label>}
              <button type="button" className="admin-button" title="Move up" aria-label={`Move item ${index + 1} up`} onClick={() => move(index, -1)}><ChevronUp size={14} /></button>
              <button type="button" className="admin-button" title="Move down" aria-label={`Move item ${index + 1} down`} onClick={() => move(index, 1)}><ChevronDown size={14} /></button>
              <button type="button" className="admin-button" title="Duplicate" aria-label={`Duplicate item ${index + 1}`} onClick={() => onChange([...items.slice(0, index + 1), { ...item, id: `${item.id}-copy-${Date.now()}` } as T, ...items.slice(index + 1)])}><Copy size={14} /></button>
              <button type="button" className="admin-button" title="Delete" aria-label={`Delete item ${index + 1}`} onClick={() => {
                if (window.confirm('Delete this item?')) onChange(items.filter((_, rowIndex) => rowIndex !== index));
              }}><Trash2 size={14} /></button>
            </div>
            {open[item.id] === true && (
              <div className="cms-repeater-fields">
                {renderItem(item, index, (patch) => onChange(items.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row)))}
              </div>
            )}
          </article>
        ))}
      </div>}
    </section>
  );
}
