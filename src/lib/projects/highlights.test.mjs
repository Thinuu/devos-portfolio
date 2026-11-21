import assert from 'node:assert/strict';
import test from 'node:test';
import { editorRowsToHighlights, highlightsToEditorRows } from './highlights.ts';

test('legacy string highlights map to editable objects without changing text', () => {
  const rows = highlightsToEditorRows(['Ships reliable features']);
  assert.deepEqual(editorRowsToHighlights(rows), [{ text: 'Ships reliable features', icon: 'check' }]);
});

test('object highlights preserve text and icon through the editor mapping', () => {
  const rows = highlightsToEditorRows([{ text: 'Improved delivery', icon: 'rocket' }]);
  assert.deepEqual(rows, [{ id: 'highlight-0', text: 'Improved delivery', icon: 'rocket' }]);
  assert.deepEqual(editorRowsToHighlights(rows), [{ text: 'Improved delivery', icon: 'rocket' }]);
});
