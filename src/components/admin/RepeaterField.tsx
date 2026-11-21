'use client';

import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Input, Toggle } from '@/components/admin/AdminFields';

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
  primaryField,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, change: (patch: Partial<T>) => void) => ReactNode;
  createItem: (primaryValue?: string) => T;
  itemLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  showVisibility?: boolean;
  getSummary?: (item: T, index: number) => string;
  primaryField?: { key: string; label: string };
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [newPrimaryValue, setNewPrimaryValue] = useState('');

  useEffect(() => {
    const index = Number(window.location.hash.match(/^#item-(\d+)$/)?.[1]);
    if (!Number.isInteger(index) || index < 0 || !items[index]) return;
    setOpen((value) => ({ ...value, [items[index].id]: true }));
    requestAnimationFrame(() => document.getElementById(`item-${index}`)?.scrollIntoView({ block: 'center' }));
  }, []);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addItem() {
    const primaryValue = newPrimaryValue.trim();
    if (primaryField && !primaryValue) return;
    const item = createItem(primaryField ? primaryValue : undefined);
    onChange([...items, item]);
    setOpen((value) => ({ ...value, [item.id]: true }));
    setNewPrimaryValue('');
  }

  return (
    <section className="cms-repeater">
      <div className="cms-repeater-heading">
        <h2>{title}</h2>
        <div className="cms-repeater-add">{primaryField&&<Input aria-label={`New ${primaryField.label}`} value={newPrimaryValue} placeholder={`Enter ${primaryField.label.toLowerCase()}`} onChange={(event)=>setNewPrimaryValue(event.target.value)} onKeyDown={(event)=>{if(event.key==='Enter'){event.preventDefault();addItem()}}}/>}<button type="button" className="admin-button" disabled={Boolean(primaryField&&!newPrimaryValue.trim())} onClick={addItem}><Plus size={15} /> Add item</button></div>
      </div>
      {items.length === 0 ? (
        <div className="cms-repeater-empty">
          <h3>{emptyTitle || `No ${itemLabel.toLowerCase()}s yet`}</h3>
          <p>{emptyDescription || `Add a ${itemLabel.toLowerCase()} to this section.`}</p>
          <button type="button" className="admin-button primary" disabled={Boolean(primaryField&&!newPrimaryValue.trim())} onClick={addItem}><Plus size={15} /> Add {itemLabel}</button>
        </div>
      ) : <div className="cms-repeater-list">
        {items.map((item, index) => (
          <article className="cms-repeater-item" id={`item-${index}`} key={item.id}>
            <div className="cms-repeater-toolbar">
              <GripVertical size={16} aria-hidden="true" />
              <button type="button" className="cms-repeater-collapse" aria-expanded={open[item.id] === true} onClick={() => setOpen((value) => ({ ...value, [item.id]: value[item.id] !== true }))}>
                {itemLabel} {index + 1}{getSummary ? ` — ${getSummary(item, index)}` : ''}
                {open[item.id] === true ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showVisibility && <Toggle className="cms-visible-toggle" label="Visible" checked={item.hidden !== true} onChange={(visible) => onChange(items.map((row, rowIndex) => rowIndex === index ? { ...row, hidden: !visible } : row))} />}
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
