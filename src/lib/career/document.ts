import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';
import PDFDocument from 'pdfkit';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import type { CvProfile } from '@/lib/schemas/career.schema';
import { buildResolvedCvView, type ResolvedCvView } from '@/lib/career/view-builder';

export function getCvView(profile: CvProfile): ResolvedCvView {
  return buildResolvedCvView(profile);
}

function cleanHex(hex: string, fallback = '000000'): string {
  if (!hex) return fallback;
  return hex.replace(/^#/, '').substring(0, 6);
}

export async function createDocx(profile: CvProfile): Promise<Buffer> {
  const view = getCvView(profile);
  const design = profile.design;
  const isTwoCol = profile.templateId === 'modern-two-column';
  const primaryHex = cleanHex(design.primary, '6B46C1');

  // Contact text or links
  const contactRuns = view.contactItems.flatMap((item, idx) => {
    const runs: (TextRun | ExternalHyperlink)[] = [];
    if (item.href) {
      runs.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: item.value,
              style: 'Hyperlink',
              color: primaryHex,
              size: 19, // 9.5 pt
            }),
          ],
          link: item.href,
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: item.value,
          size: 19,
          color: '555555',
        })
      );
    }
    if (idx < view.contactItems.length - 1) {
      runs.push(new TextRun({ text: '  •  ', size: 19, color: '888888' }));
    }
    return runs;
  });

  if (isTwoCol) {
    // Two-Column Word Table Layout
    const sidebarParagraphs: Paragraph[] = [
      new Paragraph({
        text: 'Contact',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 100, after: 80 },
      }),
      ...view.contactItems.map((c) => new Paragraph({
        children: [
          new TextRun({ text: `${c.label}: `, bold: true, size: 18 }),
          new TextRun({ text: c.value, size: 18 }),
        ],
        spacing: { after: 60 },
      })),
    ];

    if (view.skillsByCategory.length > 0) {
      sidebarParagraphs.push(
        new Paragraph({
          text: 'Technical Skills',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
        }),
        ...view.skillsByCategory.map((cat) => new Paragraph({
          children: [
            new TextRun({ text: `${cat.category}\n`, bold: true, size: 18 }),
            new TextRun({ text: cat.skills.join(', '), size: 18, color: '444444' }),
          ],
          spacing: { after: 100 },
        }))
      );
    }

    if (view.education.length > 0) {
      sidebarParagraphs.push(
        new Paragraph({
          text: 'Education',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
        }),
        ...view.education.map((edu) => new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree}\n`, bold: true, size: 18 }),
            new TextRun({ text: `${edu.institution} (${edu.period})`, size: 18, color: '555555' }),
          ],
          spacing: { after: 100 },
        }))
      );
    }

    const mainParagraphs: Paragraph[] = [
      new Paragraph({
        text: view.personal.name,
        heading: HeadingLevel.TITLE,
        spacing: { after: 40 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: view.personal.role.toUpperCase(),
            bold: true,
            color: primaryHex,
            size: 20,
          }),
        ],
        spacing: { after: 140 },
      }),
    ];

    if (view.summary) {
      mainParagraphs.push(
        new Paragraph({
          text: 'Professional Summary',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 140, after: 80 },
        }),
        new Paragraph({
          text: view.summary,
          spacing: { after: 140 },
        })
      );
    }

    if (view.experience.length > 0) {
      mainParagraphs.push(
        new Paragraph({
          text: 'Work Experience',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 140, after: 80 },
        })
      );
      for (const item of view.experience) {
        mainParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.role, bold: true, size: 21 }),
              new TextRun({ text: ` — ${item.company}`, size: 21 }),
              new TextRun({ text: `\t${item.period}`, size: 19, color: '666666' }),
            ],
            spacing: { before: 80, after: 40 },
          })
        );
        for (const bullet of item.bullets) {
          mainParagraphs.push(
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
              spacing: { after: 30 },
            })
          );
        }
      }
    }

    if (view.projects.length > 0) {
      mainParagraphs.push(
        new Paragraph({
          text: 'Key Projects',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 160, after: 80 },
        })
      );
      for (const proj of view.projects) {
        mainParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: proj.title, bold: true, size: 21 }),
              ...(proj.year ? [new TextRun({ text: `\t${proj.year}`, size: 19, color: '666666' })] : []),
            ],
            spacing: { before: 80, after: 40 },
          }),
          new Paragraph({
            text: proj.shortDesc,
            spacing: { after: 40 },
          })
        );
        for (const bullet of proj.highlights) {
          mainParagraphs.push(
            new Paragraph({
              text: bullet,
              bullet: { level: 0 },
              spacing: { after: 30 },
            })
          );
        }
      }
    }

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 32, type: WidthType.PERCENTAGE },
              children: sidebarParagraphs,
            }),
            new TableCell({
              width: { size: 68, type: WidthType.PERCENTAGE },
              children: mainParagraphs,
            }),
          ],
        }),
      ],
    });

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        children: [table],
      }],
    });
    return Packer.toBuffer(doc);
  }

  // Standard ATS and Single-Column Templates
  const children: Paragraph[] = [
    new Paragraph({
      text: view.personal.name,
      heading: HeadingLevel.TITLE,
      alignment: design.font === 'Georgia' || profile.templateId === 'executive-professional'
        ? AlignmentType.CENTER
        : AlignmentType.LEFT,
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: design.font === 'Georgia' || profile.templateId === 'executive-professional'
        ? AlignmentType.CENTER
        : AlignmentType.LEFT,
      children: [
        new TextRun({
          text: view.personal.role.toUpperCase(),
          bold: true,
          color: primaryHex,
          size: 20,
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      alignment: design.font === 'Georgia' || profile.templateId === 'executive-professional'
        ? AlignmentType.CENTER
        : AlignmentType.LEFT,
      children: contactRuns,
      spacing: { after: 180 },
    }),
  ];

  for (const sec of view.sections) {
    if (!sec.enabled) continue;

    switch (sec.id) {
      case 'summary':
        if (view.summary) {
          children.push(
            new Paragraph({
              text: sec.title,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 160, after: 80 },
            }),
            new Paragraph({
              text: view.summary,
              spacing: { after: 120 },
            })
          );
        }
        break;

      case 'skills':
        if (view.skillsByCategory.length > 0) {
          children.push(
            new Paragraph({
              text: sec.title,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 160, after: 80 },
            })
          );
          for (const cat of view.skillsByCategory) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${cat.category}: `, bold: true, size: 20 }),
                  new TextRun({ text: cat.skills.join(', '), size: 20 }),
                ],
                spacing: { after: 50 },
              })
            );
          }
        }
        break;

      case 'experience':
        if (view.experience.length > 0) {
          children.push(
            new Paragraph({
              text: sec.title,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 160, after: 80 },
            })
          );
          for (const item of view.experience) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: item.role, bold: true, size: 21 }),
                  new TextRun({ text: ` — ${item.company}`, size: 21 }),
                  new TextRun({ text: `\t${item.period}`, size: 19, color: '666666' }),
                ],
                spacing: { before: 80, after: 40 },
              })
            );
            for (const bullet of item.bullets) {
              children.push(
                new Paragraph({
                  text: bullet,
                  bullet: { level: 0 },
                  spacing: { after: 30 },
                })
              );
            }
          }
        }
        break;

      case 'projects':
        if (view.projects.length > 0) {
          children.push(
            new Paragraph({
              text: sec.title,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 160, after: 80 },
            })
          );
          for (const proj of view.projects) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: proj.title, bold: true, size: 21 }),
                  ...(proj.tech.length > 0 ? [new TextRun({ text: ` [${proj.tech.join(', ')}]`, color: primaryHex, size: 18 })] : []),
                  ...(proj.year ? [new TextRun({ text: `\t${proj.year}`, size: 19, color: '666666' })] : []),
                ],
                spacing: { before: 80, after: 40 },
              }),
              new Paragraph({
                text: proj.shortDesc,
                spacing: { after: 40 },
              })
            );
            for (const bullet of proj.highlights) {
              children.push(
                new Paragraph({
                  text: bullet,
                  bullet: { level: 0 },
                  spacing: { after: 30 },
                })
              );
            }
          }
        }
        break;

      case 'education':
        if (view.education.length > 0) {
          children.push(
            new Paragraph({
              text: sec.title,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 160, after: 80 },
            })
          );
          for (const edu of view.education) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: edu.degree, bold: true, size: 21 }),
                  new TextRun({ text: ` — ${edu.institution}`, size: 21 }),
                  new TextRun({ text: `\t${edu.period}`, size: 19, color: '666666' }),
                ],
                spacing: { before: 60, after: 30 },
              })
            );
          }
        }
        break;

      case 'certifications':
        if (view.certifications.length > 0) {
          children.push(
            new Paragraph({
              text: sec.title,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 160, after: 80 },
            })
          );
          for (const cert of view.certifications) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: cert.name, bold: true, size: 20 }),
                  new TextRun({ text: ` — ${cert.issuer}`, size: 20 }),
                  ...(cert.date ? [new TextRun({ text: ` (${cert.date})`, size: 18, color: '666666' })] : []),
                ],
                spacing: { after: 40 },
              })
            );
          }
        }
        break;
    }
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children,
    }],
  });
  return Packer.toBuffer(doc);
}

export async function createPdf(profile: CvProfile): Promise<Buffer> {
  const view = getCvView(profile);
  const design = profile.design;
  const isA4 = profile.pageSize === 'A4';

  const doc = new PDFDocument({
    size: isA4 ? 'A4' : 'LETTER',
    margins: { top: 40, bottom: 40, left: 45, right: 45 },
    info: {
      Title: `${view.personal.name} - CV`,
      Author: view.personal.name,
      Subject: view.personal.role,
    },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const result = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const primaryColor = design.primary || '#6b46c1';
  const textColor = design.text || '#1a1a1a';
  const mutedColor = design.muted || '#555555';

  // Header
  doc.font('Helvetica-Bold').fontSize(22).fillColor(textColor).text(view.personal.name);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(primaryColor).text(view.personal.role.toUpperCase());

  // Contact line with links
  doc.moveDown(0.2);
  const contactText = view.contactItems.map((c) => c.value).join('  •  ');
  doc.font('Helvetica').fontSize(9).fillColor(mutedColor).text(contactText);

  if (design.showDividers) {
    doc.moveDown(0.5);
    doc.strokeColor('#e2e2e2').lineWidth(0.75).moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).stroke();
    doc.moveDown(0.5);
  } else {
    doc.moveDown(0.6);
  }

  // Render Sections
  for (const sec of view.sections) {
    if (!sec.enabled) continue;

    switch (sec.id) {
      case 'summary':
        if (view.summary) {
          renderSectionHeader(doc, sec.title, primaryColor);
          doc.font('Helvetica').fontSize(9.5).fillColor(textColor).text(view.summary, { lineGap: 2 });
          doc.moveDown(0.6);
        }
        break;

      case 'skills':
        if (view.skillsByCategory.length > 0) {
          renderSectionHeader(doc, sec.title, primaryColor);
          for (const cat of view.skillsByCategory) {
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor(textColor).text(`${cat.category}: `, { continued: true });
            doc.font('Helvetica').fillColor(mutedColor).text(cat.skills.join(', '), { lineGap: 1.5 });
          }
          doc.moveDown(0.6);
        }
        break;

      case 'experience':
        if (view.experience.length > 0) {
          renderSectionHeader(doc, sec.title, primaryColor);
          for (const item of view.experience) {
            const startY = doc.y;
            doc.font('Helvetica-Bold').fontSize(10).fillColor(textColor).text(item.role, { continued: true });
            doc.font('Helvetica').fillColor(mutedColor).text(` — ${item.company}`);

            // Period on the right
            doc.font('Helvetica').fontSize(8.5).fillColor(mutedColor).text(item.period, doc.page.width - 165, startY, {
              width: 120,
              align: 'right',
            });
            doc.x = 45; // reset x coordinate

            if (item.bullets.length > 0) {
              doc.moveDown(0.2);
              for (const bullet of item.bullets) {
                doc.font('Helvetica').fontSize(9).fillColor(textColor).text(`•  ${bullet}`, {
                  indent: 10,
                  lineGap: 1.5,
                });
              }
            }
            doc.moveDown(0.4);
          }
        }
        break;

      case 'projects':
        if (view.projects.length > 0) {
          renderSectionHeader(doc, sec.title, primaryColor);
          for (const proj of view.projects) {
            const startY = doc.y;
            doc.font('Helvetica-Bold').fontSize(10).fillColor(textColor).text(proj.title, { continued: true });
            if (proj.tech.length > 0) {
              doc.font('Helvetica').fontSize(8.5).fillColor(primaryColor).text(`  [${proj.tech.join(', ')}]`);
            } else {
              doc.text('');
            }

            if (proj.year) {
              doc.font('Helvetica').fontSize(8.5).fillColor(mutedColor).text(proj.year, doc.page.width - 165, startY, {
                width: 120,
                align: 'right',
              });
              doc.x = 45;
            }

            if (proj.shortDesc) {
              doc.font('Helvetica').fontSize(9).fillColor(mutedColor).text(proj.shortDesc);
            }

            if (proj.highlights.length > 0) {
              doc.moveDown(0.2);
              for (const h of proj.highlights) {
                doc.font('Helvetica').fontSize(9).fillColor(textColor).text(`•  ${h}`, {
                  indent: 10,
                  lineGap: 1.5,
                });
              }
            }
            doc.moveDown(0.4);
          }
        }
        break;

      case 'education':
        if (view.education.length > 0) {
          renderSectionHeader(doc, sec.title, primaryColor);
          for (const edu of view.education) {
            const startY = doc.y;
            doc.font('Helvetica-Bold').fontSize(9.5).fillColor(textColor).text(edu.degree, { continued: true });
            doc.font('Helvetica').fillColor(mutedColor).text(` — ${edu.institution}`);

            doc.font('Helvetica').fontSize(8.5).fillColor(mutedColor).text(edu.period, doc.page.width - 165, startY, {
              width: 120,
              align: 'right',
            });
            doc.x = 45;
            doc.moveDown(0.3);
          }
          doc.moveDown(0.3);
        }
        break;

      case 'certifications':
        if (view.certifications.length > 0) {
          renderSectionHeader(doc, sec.title, primaryColor);
          for (const cert of view.certifications) {
            doc.font('Helvetica-Bold').fontSize(9).fillColor(textColor).text(cert.name, { continued: true });
            doc.font('Helvetica').fillColor(mutedColor).text(` — ${cert.issuer}`);
            doc.moveDown(0.2);
          }
          doc.moveDown(0.4);
        }
        break;
    }
  }

  doc.end();
  return result;
}

function renderSectionHeader(doc: PDFKit.PDFDocument, title: string, color: string) {
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(color).text(title.toUpperCase());
  doc.moveDown(0.15);
  doc.strokeColor('#eaeaea').lineWidth(0.5).moveTo(45, doc.y).lineTo(doc.page.width - 45, doc.y).stroke();
  doc.moveDown(0.35);
}

/**
 * Fills a custom .docx template with placeholders using docxtemplater and pizzip.
 */
export async function fillDocxTemplate(templateBuffer: Buffer, profile: CvProfile): Promise<Buffer> {
  const view = getCvView(profile);

  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  const templateData = {
    name: view.personal.name,
    role: view.personal.role,
    title: view.personal.role,
    email: view.personal.email,
    phone: view.personal.phone,
    location: view.personal.location,
    github: view.personal.github,
    linkedin: view.personal.linkedin,
    website: view.personal.website,
    summary: view.summary,
    experience: view.experience.map((item) => ({
      company: item.company,
      role: item.role,
      title: item.role,
      period: item.period,
      location: item.location,
      bullets: item.bullets.map((b) => ({ text: b, '.': b })),
    })),
    projects: view.projects.map((item) => ({
      title: item.title,
      name: item.title,
      shortDesc: item.shortDesc,
      description: item.shortDesc,
      tech: item.tech.join(', '),
      year: item.year,
      bullets: item.highlights.map((h) => ({ text: h, '.': h })),
    })),
    skills: view.skillsByCategory.map((cat) => ({
      category: cat.category,
      list: cat.skills.join(', '),
      skills: cat.skills.map((s) => ({ name: s, text: s, '.': s })),
    })),
    education: view.education.map((item) => ({
      degree: item.degree,
      institution: item.institution,
      period: item.period,
      year: item.year,
      note: item.note,
    })),
    certifications: view.certifications.map((item) => ({
      name: item.name,
      issuer: item.issuer,
      date: item.date,
    })),
  };

  doc.render(templateData);
  return doc.getZip().generate({ type: 'nodebuffer' });
}

/**
 * Generates a starter .docx with all available placeholders.
 */
export async function createStarterDocxTemplate(): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children: [
        new Paragraph({ text: '{name}', heading: HeadingLevel.TITLE }),
        new Paragraph({ children: [new TextRun({ text: '{role} | {email} | {phone} | {location}', bold: true })] }),
        new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_1 }),
        new Paragraph('{summary}'),
        new Paragraph({ text: 'Work Experience', heading: HeadingLevel.HEADING_1 }),
        new Paragraph('{#experience}'),
        new Paragraph({ children: [new TextRun({ text: '{role} — {company}', bold: true }), new TextRun({ text: ' ({period})' })] }),
        new Paragraph('{#bullets}• {.}'),
        new Paragraph('{/bullets}'),
        new Paragraph('{/experience}'),
        new Paragraph({ text: 'Key Projects', heading: HeadingLevel.HEADING_1 }),
        new Paragraph('{#projects}'),
        new Paragraph({ children: [new TextRun({ text: '{title}', bold: true }), new TextRun({ text: ' [{tech}]' })] }),
        new Paragraph('{shortDesc}'),
        new Paragraph('{#bullets}• {.}'),
        new Paragraph('{/bullets}'),
        new Paragraph('{/projects}'),
        new Paragraph({ text: 'Technical Skills', heading: HeadingLevel.HEADING_1 }),
        new Paragraph('{#skills}'),
        new Paragraph({ children: [new TextRun({ text: '{category}: ', bold: true }), new TextRun('{list}')] }),
        new Paragraph('{/skills}'),
        new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_1 }),
        new Paragraph('{#education}'),
        new Paragraph('{degree} — {institution} ({period})'),
        new Paragraph('{/education}'),
        new Paragraph({ text: 'Certifications', heading: HeadingLevel.HEADING_1 }),
        new Paragraph('{#certifications}'),
        new Paragraph('{name} — {issuer}'),
        new Paragraph('{/certifications}'),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}
