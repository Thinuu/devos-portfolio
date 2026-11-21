'use client';

import { forwardRef, useId, useLayoutEffect, useRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type FieldProps = {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, required = false, helperText, error, className = '', children }: FieldProps) {
  return (
    <label className={`cms-field ${className}`.trim()}>
      <span className="cms-field-label">{label}{required && <> <b aria-hidden="true">*</b></>}</span>
      {children}
      {helperText && <small className="cms-field-helper">{helperText}</small>}
      {error && <small className="cms-field-error" role="alert">{error}</small>}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement>;
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`cms-control ${className}`.trim()} {...props} />;
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className = '', ...props }, ref) {
  return <select ref={ref} className={`cms-control ${className}`.trim()} {...props} />;
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className = '', rows = 4, onInput, ...props }, forwardedRef) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const setRef = (node: HTMLTextAreaElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  const resize = () => {
    const node = localRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${node.scrollHeight}px`;
  };

  useLayoutEffect(resize, [props.value, props.defaultValue]);

  return <textarea
    ref={setRef}
    className={`cms-control cms-textarea ${className}`.trim()}
    rows={Math.min(6, Math.max(4, rows))}
    onInput={(event) => { resize(); onInput?.(event); }}
    {...props}
  />;
});

export function Toggle({ label, checked, onChange, className = '', disabled = false }: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}) {
  return <label className={`cms-toggle cms-toggle-control ${className}`.trim()}><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}

export function TagInput({ label, value, onChange, helperText = 'Press Enter to add a tag. Drag tags to reorder.', placeholder, suggestions = [] }: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  helperText?: string;
  placeholder?: string;
  suggestions?: string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= value.length || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }
  function add(raw: string) {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    if (inputRef.current) inputRef.current.value = '';
  }
  return <div className="cms-field cms-tag-field">
    <span className="cms-field-label">{label}</span>
    <div className="cms-tags">{value.map((tag, index) => <span className="cms-tag" key={`${tag}-${index}`} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); move(Number(event.dataTransfer.getData('text/plain')), index); }}>
      {tag}<button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>×</button>
    </span>)}</div>
    <Input ref={inputRef} list={suggestions.length ? listId : undefined} placeholder={placeholder ?? `Add ${label.toLowerCase()}`} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); add(event.currentTarget.value); }
    }} />
    {suggestions.length > 0 && <datalist id={listId}>{suggestions.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist>}
    {helperText && <small className="cms-field-helper">{helperText}</small>}
  </div>;
}
