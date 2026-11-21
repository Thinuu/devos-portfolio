'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText, Download, FileDown, Calendar, Layers, ArrowUpRight,
} from 'lucide-react';
import { readJsonResponse } from '@/lib/http/json';
import type { CvDocument } from '@/lib/schemas/career.schema';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<CvDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/documents')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load documents.');
        const data = await readJsonResponse<{ documents: CvDocument[] }>(res);
        setDocuments(data?.documents || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleRedownload(doc: CvDocument) {
    try {
      const res = await fetch('/api/admin/cv/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId: doc.cvId, format: doc.format }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = doc.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      } else {
        alert('Failed to re-generate document.');
      }
    } catch {
      alert('Error downloading document.');
    }
  }

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Audit Trail &amp; Export Archive</p>
          <h1>Exported Documents</h1>
          <p style={{ color: 'var(--text-soft)', margin: '4px 0 0', fontSize: 13 }}>
            History of all generated PDF, DOCX, and custom Word exports with associated CV profiles and versions.
          </p>
        </div>
      </header>

      {loading ? (
        <p className="admin-status">Loading document archive…</p>
      ) : error ? (
        <p className="admin-error">{error}</p>
      ) : documents.length === 0 ? (
        <section className="admin-simple-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FileDown size={36} color="var(--muted)" style={{ margin: '0 auto 12px' }} />
          <h2>No exported documents yet</h2>
          <p style={{ color: 'var(--text-soft)', maxWidth: 440, margin: '4px auto 16px' }}>
            When you export a PDF, DOCX, or template-based resume from CV Studio, an archival snapshot is automatically registered here.
          </p>
          <Link href="/admin/cv-studio" className="admin-button primary" style={{ margin: '0 auto' }}>
            Open CV Studio
          </Link>
        </section>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)', color: 'var(--text-soft)', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Filename</th>
                  <th style={{ padding: '12px 16px' }}>CV Profile</th>
                  <th style={{ padding: '12px 16px' }}>Template</th>
                  <th style={{ padding: '12px 16px' }}>Format</th>
                  <th style={{ padding: '12px 16px' }}>Exported At</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={16} color="var(--accent)" />
                        <span>{doc.filename}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link href={`/admin/cv-studio/${doc.cvId}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        {doc.cvName} <ArrowUpRight size={11} style={{ display: 'inline' }} />
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-soft)' }}>
                      {doc.templateId}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: doc.format === 'pdf' ? 'rgba(233, 138, 149, 0.15)' : 'rgba(110, 208, 156, 0.15)',
                        color: doc.format === 'pdf' ? '#e98a95' : '#6ed09c',
                        border: `1px solid ${doc.format === 'pdf' ? '#e98a95' : '#6ed09c'}`,
                      }}>
                        {doc.format}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                      {new Date(doc.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="admin-button"
                        style={{ height: 30, fontSize: 11, padding: '0 10px', gap: 4 }}
                        onClick={() => handleRedownload(doc)}
                      >
                        <Download size={13} /> Re-download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
