'use client';

import { useState } from 'react';
import { Field, Input } from '@/components/admin/AdminFields';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { readJsonResponse } from '@/lib/http/json';

export default function ImageUpload({
  value,
  alt,
  onChange,
  onAltChange,
  fallback = '/images/thinu-profile.png',
  label = 'Image',
  neutralPlaceholder = false,
  altRequired = false,
  altError,
}: {
  value?: string;
  alt?: string;
  onChange: (path: string) => void;
  onAltChange: (alt: string) => void;
  fallback?: string;
  label?: string;
  neutralPlaceholder?: boolean;
  altRequired?: boolean;
  altError?: string;
}) {
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const preview = value || fallback;

  async function upload(file?: File) {
    if (!file) return;
    setError('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('PNG, JPG, and WebP files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('The image must be 5MB or smaller.');
      return;
    }
    setProgress(12);
    const formData = new FormData();
    formData.set('file', file);
    const response = await fetch('/api/admin/media/upload', { method: 'POST', body: formData });
    if (!response.ok) {
      const payload = await readJsonResponse<{ error?: string }>(response);
      setError(payload?.error || 'Unable to upload the image.');
      setProgress(0);
      return;
    }
    const result = await readJsonResponse<{ url: string }>(response);
    if (!result?.url) {
      setError('Upload returned no image URL.');
      setProgress(0);
      return;
    }
    setProgress(100);
    onChange(result.url);
  }

  return (
    <div className="cms-image-upload">
      <div
        className={`cms-dropzone${dragging ? ' is-dragging' : ''}`}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files[0]); }}
      >
        {neutralPlaceholder && !value ? (
          <div className="cms-image-placeholder" role="img" aria-label="No thumbnail"><ImageIcon size={24} /><span>No thumbnail</span></div>
        ) : (
          <img src={preview} alt={alt || `${label} preview`} />
        )}
        <div className="cms-dropzone-copy">
          <span><Upload size={16} /> Drop a {label.toLowerCase()} here</span>
          <small>PNG, JPG, or WebP · Max 5MB</small>
          <div className="cms-upload-actions">
            <label className="admin-button"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void upload(event.target.files?.[0])} /> Replace</label>
            <button type="button" className="admin-button" onClick={() => onChange(fallback)}><X size={14} /> Remove</button>
          </div>
        </div>
      </div>
      {progress > 0 && progress < 100 && <progress className="cms-upload-progress" max={100} value={progress} />}
      {progress === 100 && <small className="cms-upload-success">Upload complete</small>}
      {error && <small className="admin-error" role="alert">{error}</small>}
      <Field label={`${label} alt text`} required={altRequired && Boolean(value)} error={altError}><Input value={alt || ''} onChange={(event) => onAltChange(event.target.value)} /></Field>
    </div>
  );
}
