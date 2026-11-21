import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';
import type { CvProfile } from '@/lib/schemas/career.schema';
import { getCareerSource } from '@/lib/repositories/career.repository';

export function getCvView(profile: CvProfile) {
  const source = getCareerSource();
  return {
    profile,
    personal: source.personal,
    experience: source.experience.filter((_, index) => profile.selectedExperience.includes(index)),
    projects: source.projects.filter((project) => profile.selectedProjects.includes(project.id)),
    education: source.education.filter((_, index) => profile.selectedEducation.includes(index)),
    certifications: source.certifications.filter((_, index) => profile.selectedCertifications.includes(index)),
    skills: Object.entries(source.skills).flatMap(([category, skills]) => (skills as { name: string }[]).filter((skill) => profile.selectedSkills.includes(skill.name)).map((skill) => ({ ...skill, category }))),
  };
}

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}

export async function createDocx(profile: CvProfile) {
  const view = getCvView(profile);
  const children: Paragraph[] = [
    new Paragraph({ text: view.personal.name, heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: `${view.personal.role} | ${view.personal.email} | ${view.personal.location}`, bold: true })] }),
    new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_1 }),
    new Paragraph(view.profile.summary),
  ];

  if (view.experience.length) {
    children.push(new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_1 }));
    for (const item of view.experience) {
      children.push(new Paragraph({ children: [new TextRun({ text: `${text(item.role)} — ${text(item.company)}`, bold: true })] }));
      children.push(new Paragraph(text(item.period)));
      for (const bullet of item.commits ?? []) children.push(new Paragraph({ text: bullet, bullet: { level: 0 } }));
    }
  }
  if (view.projects.length) {
    children.push(new Paragraph({ text: 'Selected Projects', heading: HeadingLevel.HEADING_1 }));
    for (const project of view.projects) {
      children.push(new Paragraph({ children: [new TextRun({ text: project.title, bold: true })] }));
      children.push(new Paragraph(project.shortDesc));
      for (const bullet of project.highlights ?? []) children.push(new Paragraph({ text: bullet, bullet: { level: 0 } }));
    }
  }
  if (view.skills.length) {
    children.push(new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph(view.skills.map((skill) => skill.name).join(' • ')));
  }
  if (view.education.length) {
    children.push(new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_1 }));
    for (const item of view.education) children.push(new Paragraph(`${text(item.degree)} — ${text(item.institution)} (${text(item.period)})`));
  }
  if (view.certifications.length) {
    children.push(new Paragraph({ text: 'Certifications', heading: HeadingLevel.HEADING_1 }));
    for (const item of view.certifications) children.push(new Paragraph(`${text(item.name)} — ${text(item.issuer)}`));
  }

  return Packer.toBuffer(new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }] }));
}

export async function createPdf(profile: CvProfile) {
  const view = getCvView(profile);
  const doc = new PDFDocument({ size: profile.pageSize === 'LETTER' ? 'LETTER' : 'A4', margins: { top: 48, bottom: 48, left: 54, right: 54 } });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const result = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));
  doc.fontSize(22).fillColor(profile.design.text).text(view.personal.name);
  doc.fontSize(10).fillColor(profile.design.muted).text(`${view.personal.role} | ${view.personal.email} | ${view.personal.location}`);
  const section = (heading: string) => doc.moveDown().fontSize(13).fillColor(profile.design.primary).text(heading).moveDown(0.25).fontSize(10).fillColor(profile.design.text);
  section('Professional Summary').text(profile.summary);
  if (view.experience.length) {
    section('Experience');
    for (const item of view.experience) doc.font('Helvetica-Bold').text(`${text(item.role)} — ${text(item.company)}`).font('Helvetica').text(text(item.period)).list(item.commits ?? []);
  }
  if (view.projects.length) {
    section('Selected Projects');
    for (const project of view.projects) doc.font('Helvetica-Bold').text(project.title).font('Helvetica').text(project.shortDesc).list(project.highlights ?? []);
  }
  if (view.skills.length) section('Skills').text(view.skills.map((skill) => skill.name).join(' • '));
  if (view.education.length) {
    section('Education');
    for (const item of view.education) doc.text(`${text(item.degree)} — ${text(item.institution)} (${text(item.period)})`);
  }
  if (view.certifications.length) {
    section('Certifications');
    for (const item of view.certifications) doc.text(`${text(item.name)} — ${text(item.issuer)}`);
  }
  doc.end();
  return result;
}
