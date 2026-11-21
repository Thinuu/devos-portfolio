'use client';

import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Input, Select, Toggle } from '@/components/admin/AdminFields';

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
  requiredFields = [],
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
  primaryField?: { key: string; label: string; type?: string };
  requiredFields?: Array<{ key: string; label: string; type?: string }>;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [newValues, setNewValues] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'visible' | 'hidden'>('all');
  const initialized = useRef(false);
  const newItemFields = primaryField ? [primaryField, ...requiredFields] : [];

  useEffect(() => {
    if (initialized.current || items.length === 0) return;
    initialized.current = true;
    setOpen((value) => Object.keys(value).length ? value : { [items[0].id]: true });
  }, [items]);

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
    if (!primaryField || newItemFields.some((field) => !newValues[field.key]?.trim())) return;
    const item = createItem(primaryField ? newValues[primaryField.key].trim() : undefined);
    for (const field of requiredFields) (item as Record<string, unknown>)[field.key] = newValues[field.key].trim();
    onChange([...items, item]);
    setOpen((value) => ({ ...value, [item.id]: true }));
    setNewValues({});
    initialized.current = true;
  }

  const visibleItems = items.map((item, index) => ({ item, index })).filter(({ item, index }) => {
    const summary = (getSummary?.(item, index) || '').toLowerCase();
    const matchesSearch = !search.trim() || `${summary} ${itemLabel} ${index + 1}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesVisibility = visibility === 'all' || (visibility === 'visible' ? item.hidden !== true : item.hidden === true);
    return matchesSearch && matchesVisibility;
  });

  return (
    <section className="cms-repeater">
      <div className="cms-repeater-heading">
        <h2>{title}</h2>
        <div className="cms-repeater-add">{newItemFields.map((field) => <Input key={field.key} type={field.type || 'text'} aria-label={`New ${field.label}`} value={newValues[field.key] || ''} placeholder={`Enter ${field.label.toLowerCase()}`} onChange={(event) => setNewValues((value) => ({ ...value, [field.key]: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addItem(); } }} />)}<button type="button" className="admin-button" disabled={!primaryField || newItemFields.some((field) => !newValues[field.key]?.trim())} onClick={addItem}><Plus size={15} /> Add item</button></div>
      </div>
      {items.length > 10 && <div className="cms-repeater-tools"><Input aria-label={`Search ${title}`} placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={(event) => setSearch(event.target.value)} /><Select aria-label={`${title} visibility filter`} value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)}><option value="all">All items</option><option value="visible">Visible</option><option value="hidden">Hidden</option></Select><button type="button" className="admin-button" onClick={() => setOpen(Object.fromEntries(items.map((item) => [item.id, false])))}>Collapse all</button></div>}
      {items.length === 0 ? (
        <div className="cms-repeater-empty">
          <h3>{emptyTitle || `No ${itemLabel.toLowerCase()}s yet`}</h3>
          <p>{emptyDescription || `Add a ${itemLabel.toLowerCase()} to this section.`}</p>
          <button type="button" className="admin-button primary" disabled={!primaryField || newItemFields.some((field) => !newValues[field.key]?.trim())} onClick={addItem}><Plus size={15} /> Add {itemLabel}</button>
        </div>
      ) : <div className="cms-repeater-list">
        {visibleItems.length === 0 && <p className="cms-empty-filter">No items match this search or visibility filter.</p>}
        {visibleItems.map(({ item, index }) => (
          <article className="cms-repeater-item" id={`item-${index}`} key={item.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData('application/repeater-index')); if (Number.isInteger(from) && from !== index) { const next = [...items]; const [dragged] = next.splice(from, 1); next.splice(index, 0, dragged); onChange(next); } }}>
            <div className="cms-repeater-toolbar">
              <button type="button" className="cms-repeater-drag" draggable aria-label={`Reorder ${itemLabel.toLowerCase()} ${index + 1}; use the up and down arrow keys`} aria-keyshortcuts="ArrowUp ArrowDown" onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('application/repeater-index', String(index)); }} onKeyDown={(event) => { if (event.key === 'ArrowUp') { event.preventDefault(); move(index, -1); } else if (event.key === 'ArrowDown') { event.preventDefault(); move(index, 1); } }}><GripVertical size={16} aria-hidden="true" /></button>
              <button type="button" className="cms-repeater-collapse" aria-expanded={open[item.id] === true} onClick={() => setOpen((value) => ({ ...value, [item.id]: value[item.id] !== true }))}>
                {itemLabel} {index + 1} — {(getSummary?.(item, index) || '').trim() || `${itemLabel} ${index + 1}`}
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
