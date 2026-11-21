'use client';

import { RotateCcw, Save } from 'lucide-react';

export default function DraftSaveBar({
  state,
  dirty,
  error,
  onDiscard,
  onSave,
  onRetry,
}: {
  state: string;
  dirty: boolean;
  error?: string;
  onDiscard: () => void;
  onSave: () => void;
  onRetry: () => void;
}) {
  function discard() {
    if (dirty && !window.confirm('Discard unsaved changes and restore the last saved draft?')) return;
    onDiscard();
  }

  return (
    <div className="cms-sticky-actions" role="region" aria-label="Draft actions" aria-live="polite" aria-busy={state === 'Saving…'}>
      <div className="cms-savebar-status">
        <span className={dirty ? 'is-dirty' : ''}>{state}</span>
        {error && <button type="button" className="cms-savebar-retry" onClick={onRetry}>Retry</button>}
      </div>
      <div className="cms-savebar-buttons">
        <button type="button" className="admin-button" disabled={!dirty || state === 'Saving…'} onClick={discard}><RotateCcw size={15} /> Discard</button>
        <button type="button" className="admin-button primary" disabled={!dirty || state === 'Saving…'} onClick={onSave}><Save size={15} /> {state === 'Saving…' ? 'Saving…' : 'Save draft'}</button>
      </div>
    </div>
  );
}
