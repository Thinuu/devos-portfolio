'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import type { CvProfile } from '@/lib/schemas/career.schema';
import { buildResolvedCvView, type ResolvedCvView } from '@/lib/career/view-builder';
import {
  Mail, Phone, MapPin, Github, Linkedin, Globe, AlertTriangle, FileText,
} from 'lucide-react';
import s from './CvPaperPreview.module.css';

interface CvPaperPreviewProps {
  profile: CvProfile;
  zoom?: number; // percentage, e.g. 100
  targetPages?: number; // default 1
  onPageCountChange?: (count: number) => void;
}

export default function CvPaperPreview({
  profile,
  zoom = 100,
  targetPages = 1,
  onPageCountChange,
}: CvPaperPreviewProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const [detectedPages, setDetectedPages] = useState(1);

  const view: ResolvedCvView = useMemo(() => buildResolvedCvView(profile), [profile]);

  // Page dimensions
  const isA4 = profile.pageSize === 'A4';
  // A4 ratio 210 x 297mm (1:1.414). At 794px width (standard 96dpi A4), height is 1123px.
  // Letter ratio 8.5 x 11in (1:1.294). At 816px width, height is 1056px.
  const pageHeightPx = isA4 ? 1123 : 1056;

  useEffect(() => {
    if (!paperRef.current) return;
    const scrollHeight = paperRef.current.scrollHeight;
    const computedPages = Math.max(1, Math.ceil((scrollHeight - 10) / pageHeightPx));
    setDetectedPages(computedPages);
    onPageCountChange?.(computedPages);
  }, [view, pageHeightPx, onPageCountChange]);

  const templateId = profile.templateId || 'ats-classic';
  const design = profile.design;

  // Font family mapping
  const fontFamilyStyle = useMemo(() => {
    switch (design.font) {
      case 'Arial':
        return 'Arial, Helvetica, sans-serif';
      case 'Calibri':
        return 'Calibri, Candara, Segoe, "Segoe UI", sans-serif';
      case 'Georgia':
        return 'Georgia, Cambria, "Times New Roman", serif';
      case 'Times New Roman':
        return '"Times New Roman", Times, Georgia, serif';
      case 'JetBrains Mono':
        return 'var(--font-mono), monospace';
      case 'Space Grotesk & Inter':
      default:
        return 'var(--font-body), Inter, sans-serif';
    }
  }, [design.font]);

  const headerFontFamily = design.font === 'Space Grotesk & Inter'
    ? 'var(--font-display), "Space Grotesk", sans-serif'
    : fontFamilyStyle;

  // Margin sizes
  const marginPadding = useMemo(() => {
    switch (design.margins) {
      case 'compact': return '36px 36px';
      case 'spacious': return '60px 60px';
      case 'normal':
      default: return '48px 48px';
    }
  }, [design.margins]);

  // Font size scale
  const baseFontSize = useMemo(() => {
    switch (design.fontSize) {
      case 'compact': return '12px';
      case 'relaxed': return '14px';
      case 'normal':
      default: return '13px';
    }
  }, [design.fontSize]);

  // Line spacing
  const lineHeight = useMemo(() => {
    switch (design.lineSpacing) {
      case 'tight': return 1.25;
      case 'relaxed': return 1.65;
      case 'normal':
      default: return 1.45;
    }
  }, [design.lineSpacing]);

  const hasOverflow = detectedPages > targetPages;

  return (
    <div className={s.wrapper}>
      {hasOverflow && (
        <div className={s.overflowBanner} role="status">
          <AlertTriangle size={15} />
          <span>
            Content spans <strong>{detectedPages} pages</strong> (target is {targetPages} page{targetPages > 1 ? 's' : ''}). Try compact spacing, reducing bullets, or the &ldquo;Fit to one page&rdquo; helper.
          </span>
        </div>
      )}

      <div
        className={s.zoomStage}
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
      >
        <div
          ref={paperRef}
          className={`${s.paper} ${s[`tpl_${templateId.replace(/-/g, '_')}`] || s.tpl_ats_classic}`}
          style={{
            minHeight: `${pageHeightPx}px`,
            padding: marginPadding,
            fontFamily: fontFamilyStyle,
            fontSize: baseFontSize,
            lineHeight,
            color: design.text,
            '--cv-accent': design.primary,
            '--cv-text': design.text,
            '--cv-muted': design.muted,
            '--cv-header-font': headerFontFamily,
          } as React.CSSProperties}
        >
          {/* Render based on Template */}
          {templateId === 'modern-two-column' ? (
            <TwoColumnLayout view={view} design={design} headerFontFamily={headerFontFamily} />
          ) : (
            <SingleColumnLayout view={view} templateId={templateId} design={design} headerFontFamily={headerFontFamily} />
          )}

          {/* Page break marker lines for multi-page documents */}
          {detectedPages > 1 && Array.from({ length: detectedPages - 1 }).map((_, i) => (
            <div
              key={i}
              className={s.pageBreakLine}
              style={{ top: `${(i + 1) * pageHeightPx}px` }}
              title={`Page ${i + 1} break`}
            >
              <span>Page {i + 2} starts here</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactRow({ items, showIcons = true }: { items: ResolvedCvView['contactItems']; showIcons?: boolean }) {
  if (!items.length) return null;
  return (
    <div className={s.contactRow}>
      {items.map((item, idx) => {
        const Icon = item.type === 'email' ? Mail
          : item.type === 'phone' ? Phone
          : item.type === 'location' ? MapPin
          : item.type === 'github' ? Github
          : item.type === 'linkedin' ? Linkedin
          : Globe;

        return (
          <span key={idx} className={s.contactItem}>
            {showIcons && <Icon size={12} className={s.contactIcon} />}
            {item.href ? (
              <a href={item.href} target="_blank" rel="noreferrer">{item.value}</a>
            ) : (
              <span>{item.value}</span>
            )}
            {idx < items.length - 1 && <span className={s.contactSep}>•</span>}
          </span>
        );
      })}
    </div>
  );
}

function SingleColumnLayout({
  view,
  templateId,
  design,
  headerFontFamily,
}: {
  view: ResolvedCvView;
  templateId: string;
  design: CvProfile['design'];
  headerFontFamily: string;
}) {
  return (
    <div className={s.singleCol}>
      {/* Header */}
      <header className={`${s.header} ${s[`header_${templateId.replace(/-/g, '_')}`] || ''}`}>
        <h1 className={s.name} style={{ fontFamily: headerFontFamily }}>{view.personal.name}</h1>
        <p className={s.targetTitle}>{view.personal.role}</p>
        <ContactRow items={view.contactItems} showIcons={design.showIcons} />
        {design.showDividers && <hr className={s.headerDivider} />}
      </header>

      {/* Sections according to configured order */}
      <div className={s.sectionList}>
        {view.sections.filter((sec) => sec.enabled).map((sec) => {
          switch (sec.id) {
            case 'summary':
              return view.summary ? (
                <section key={sec.id} className={s.section}>
                  <h2 className={s.sectionTitle} style={{ fontFamily: headerFontFamily }}>{sec.title}</h2>
                  <p className={s.summaryText}>{view.summary}</p>
                </section>
              ) : null;

            case 'skills':
              return view.skillsByCategory.length > 0 ? (
                <section key={sec.id} className={s.section}>
                  <h2 className={s.sectionTitle} style={{ fontFamily: headerFontFamily }}>{sec.title}</h2>
                  <div className={s.skillsGrid}>
                    {view.skillsByCategory.map((cat, idx) => (
                      <div key={idx} className={s.skillGroup}>
                        <strong className={s.skillCategoryName}>{cat.category}: </strong>
                        <span className={s.skillList}>{cat.skills.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'experience':
              return view.experience.length > 0 ? (
                <section key={sec.id} className={s.section}>
                  <h2 className={s.sectionTitle} style={{ fontFamily: headerFontFamily }}>{sec.title}</h2>
                  <div className={s.experienceList}>
                    {view.experience.map((item) => (
                      <div key={item.id} className={s.entry}>
                        <div className={s.entryHeader}>
                          <div>
                            <span className={s.entryTitle}>{item.role}</span>
                            <span className={s.entryCompany}> — {item.company}</span>
                            {item.parent && <span className={s.entryParent}> ({item.parent})</span>}
                          </div>
                          <span className={s.entryMeta}>{item.period}</span>
                        </div>
                        {item.location && <div className={s.entryLocation}>{item.location}</div>}
                        {item.bullets.length > 0 && (
                          <ul className={s.bulletList} data-bullet={design.bulletStyle}>
                            {item.bullets.map((b, bIdx) => (
                              <li key={bIdx}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'projects':
              return view.projects.length > 0 ? (
                <section key={sec.id} className={s.section}>
                  <h2 className={s.sectionTitle} style={{ fontFamily: headerFontFamily }}>{sec.title}</h2>
                  <div className={s.projectList}>
                    {view.projects.map((proj) => (
                      <div key={proj.id} className={s.entry}>
                        <div className={s.entryHeader}>
                          <div>
                            <span className={s.entryTitle}>{proj.title}</span>
                            {proj.tech.length > 0 && (
                              <span className={s.entryTech}> [{proj.tech.join(', ')}]</span>
                            )}
                          </div>
                          {proj.year && <span className={s.entryMeta}>{proj.year}</span>}
                        </div>
                        {proj.shortDesc && <p className={s.entryDesc}>{proj.shortDesc}</p>}
                        {proj.highlights.length > 0 && (
                          <ul className={s.bulletList} data-bullet={design.bulletStyle}>
                            {proj.highlights.map((h, hIdx) => (
                              <li key={hIdx}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'education':
              return view.education.length > 0 ? (
                <section key={sec.id} className={s.section}>
                  <h2 className={s.sectionTitle} style={{ fontFamily: headerFontFamily }}>{sec.title}</h2>
                  <div className={s.educationList}>
                    {view.education.map((item) => (
                      <div key={item.id} className={s.entry}>
                        <div className={s.entryHeader}>
                          <div>
                            <span className={s.entryTitle}>{item.degree}</span>
                            <span className={s.entryCompany}> — {item.institution}</span>
                            {item.note && <span className={s.entryNote}> ({item.note})</span>}
                          </div>
                          <span className={s.entryMeta}>{item.period}</span>
                        </div>
                        {item.bullets && item.bullets.length > 0 && (
                          <ul className={s.bulletList} data-bullet={design.bulletStyle}>
                            {item.bullets.map((b, bIdx) => (
                              <li key={bIdx}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            case 'certifications':
              return view.certifications.length > 0 ? (
                <section key={sec.id} className={s.section}>
                  <h2 className={s.sectionTitle} style={{ fontFamily: headerFontFamily }}>{sec.title}</h2>
                  <div className={s.certList}>
                    {view.certifications.map((cert) => (
                      <div key={cert.id} className={s.certItem}>
                        <span className={s.certName}>{cert.name}</span>
                        <span className={s.certIssuer}> — {cert.issuer}</span>
                        {cert.date && <span className={s.certDate}> ({cert.date})</span>}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null;

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

function TwoColumnLayout({
  view,
  design,
  headerFontFamily,
}: {
  view: ResolvedCvView;
  design: CvProfile['design'];
  headerFontFamily: string;
}) {
  return (
    <div className={s.twoColLayout}>
      {/* Sidebar Left Column */}
      <aside className={s.twoColSidebar}>
        <div className={s.twoColBrand}>
          <h1 className={s.name} style={{ fontFamily: headerFontFamily }}>{view.personal.name}</h1>
          <p className={s.targetTitle}>{view.personal.role}</p>
        </div>

        {/* Contact */}
        <div className={s.sidebarSection}>
          <h3 className={s.sidebarTitle}>Contact</h3>
          <div className={s.sidebarContactList}>
            {view.contactItems.map((item, idx) => (
              <div key={idx} className={s.sidebarContactItem}>
                <span className={s.sidebarContactLabel}>{item.label}</span>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer">{item.value}</a>
                ) : (
                  <span>{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        {view.skillsByCategory.length > 0 && (
          <div className={s.sidebarSection}>
            <h3 className={s.sidebarTitle}>Technical Skills</h3>
            <div className={s.sidebarSkillGroups}>
              {view.skillsByCategory.map((cat, idx) => (
                <div key={idx} className={s.sidebarSkillGroup}>
                  <strong>{cat.category}</strong>
                  <p>{cat.skills.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {view.education.length > 0 && (
          <div className={s.sidebarSection}>
            <h3 className={s.sidebarTitle}>Education</h3>
            {view.education.map((item) => (
              <div key={item.id} className={s.sidebarEduItem}>
                <strong>{item.degree}</strong>
                <p>{item.institution}</p>
                <small>{item.period}</small>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {view.certifications.length > 0 && (
          <div className={s.sidebarSection}>
            <h3 className={s.sidebarTitle}>Certifications</h3>
            {view.certifications.map((item) => (
              <div key={item.id} className={s.sidebarCertItem}>
                <strong>{item.name}</strong>
                <p>{item.issuer}</p>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Right Column */}
      <main className={s.twoColMain}>
        {view.summary && (
          <section className={s.section}>
            <h2 className={s.sectionTitle} style={{ fontFamily: headerFontFamily }}>Profile</h2>
            <p className={s.summaryText}>{view.summary}</p>
          </section>
        )}

        {view.experience.length > 0 && (
          <section className={s.section}>
            <h2 className={s.sectionTitle} style={{ fontFamily: headerFontFamily }}>Work Experience</h2>
            <div className={s.experienceList}>
              {view.experience.map((item) => (
                <div key={item.id} className={s.entry}>
                  <div className={s.entryHeader}>
                    <div>
                      <span className={s.entryTitle}>{item.role}</span>
                      <span className={s.entryCompany}> — {item.company}</span>
                    </div>
                    <span className={s.entryMeta}>{item.period}</span>
                  </div>
                  {item.bullets.length > 0 && (
                    <ul className={s.bulletList} data-bullet={design.bulletStyle}>
                      {item.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {view.projects.length > 0 && (
          <section className={s.section}>
            <h2 className={s.sectionTitle} style={{ fontFamily: headerFontFamily }}>Projects</h2>
            <div className={s.projectList}>
              {view.projects.map((proj) => (
                <div key={proj.id} className={s.entry}>
                  <div className={s.entryHeader}>
                    <span className={s.entryTitle}>{proj.title}</span>
                    {proj.year && <span className={s.entryMeta}>{proj.year}</span>}
                  </div>
                  {proj.shortDesc && <p className={s.entryDesc}>{proj.shortDesc}</p>}
                  {proj.highlights.length > 0 && (
                    <ul className={s.bulletList} data-bullet={design.bulletStyle}>
                      {proj.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
