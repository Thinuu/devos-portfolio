import { portfolioData } from '@/lib/data';
import type { CvProfile, CvSectionConfig, CvItemOverride } from '@/lib/schemas/career.schema';

export interface ResolvedExperience {
  id: string;
  originalIndex: number;
  role: string;
  company: string;
  parent?: string;
  period: string;
  type?: string;
  location?: string;
  bullets: string[];
  isEdited: boolean;
  excluded?: boolean;
}

export interface ResolvedProject {
  id: string;
  title: string;
  shortDesc: string;
  tech: string[];
  highlights: string[];
  link?: string;
  year?: string;
  isEdited: boolean;
  excluded?: boolean;
}

export interface ResolvedEducation {
  id: string;
  originalIndex: number;
  degree: string;
  institution: string;
  period: string;
  year?: string;
  note?: string;
  bullets?: string[];
  isEdited: boolean;
  excluded?: boolean;
}

export interface ResolvedCertification {
  id: string;
  originalIndex: number;
  name: string;
  issuer: string;
  date?: string;
  isEdited: boolean;
  excluded?: boolean;
}

export interface ResolvedSkillCategory {
  category: string;
  skills: string[];
}

export interface ResolvedCvView {
  profile: CvProfile;
  personal: {
    name: string;
    role: string;
    email: string;
    phone: string;
    location: string;
    github: string;
    linkedin: string;
    website: string;
  };
  contactItems: Array<{ label: string; value: string; href?: string; type: string }>;
  sections: CvSectionConfig[];
  summary: string;
  experience: ResolvedExperience[];
  projects: ResolvedProject[];
  education: ResolvedEducation[];
  certifications: ResolvedCertification[];
  skillsByCategory: ResolvedSkillCategory[];
  links: Array<{ label: string; url: string }>;
}

export function buildResolvedCvView(profile: CvProfile): ResolvedCvView {
  const p = portfolioData.personal;
  const c = profile.contact;

  // Resolve contact items according to visibility flags and overrides
  const contactItems: Array<{ label: string; value: string; href?: string; type: string }> = [];

  const email = c.customEmail || p.email;
  if (c.showEmail && email) {
    contactItems.push({ label: 'Email', value: email, href: `mailto:${email}`, type: 'email' });
  }

  const phone = c.customPhone || p.phone;
  if (c.showPhone && phone) {
    contactItems.push({ label: 'Phone', value: phone, href: `tel:${phone.replace(/\s+/g, '')}`, type: 'phone' });
  }

  const location = c.customLocation || p.location;
  if (c.showLocation && location) {
    contactItems.push({ label: 'Location', value: location, type: 'location' });
  }

  const github = c.customGithub || p.github;
  if (c.showGithub && github) {
    contactItems.push({ label: 'GitHub', value: github.replace(/^https?:\/\//, ''), href: github, type: 'github' });
  }

  const linkedin = c.customLinkedin || p.linkedin;
  if (c.showLinkedin && linkedin) {
    contactItems.push({ label: 'LinkedIn', value: linkedin.replace(/^https?:\/\//, ''), href: linkedin, type: 'linkedin' });
  }

  const website = c.customWebsite || (process.env.NEXT_PUBLIC_SITE_URL || 'https://thinu.me');
  if (c.showWebsite && website) {
    contactItems.push({ label: 'Portfolio', value: website.replace(/^https?:\/\//, ''), href: website, type: 'website' });
  }

  // Resolve experience with overrides
  const expOverrides: Record<string, CvItemOverride> = profile.overrides?.experience || {};
  const experience: ResolvedExperience[] = portfolioData.experience.map((item, index) => {
    const key = String(index);
    const ov: CvItemOverride = expOverrides[key] || {};
    const excluded = ov.excluded === true;
    const isEdited = Boolean(
      ov.role || ov.company || ov.period || ov.location || (ov.bullets && ov.bullets.length > 0)
    );

    return {
      id: key,
      originalIndex: index,
      role: ov.role !== undefined ? ov.role : item.role,
      company: ov.company !== undefined ? ov.company : item.company,
      parent: item.parent,
      period: ov.period !== undefined ? ov.period : item.period,
      type: item.type,
      location: ov.location !== undefined ? ov.location : 'Colombo, Sri Lanka',
      bullets: ov.bullets !== undefined ? ov.bullets : item.commits || [],
      isEdited,
      excluded,
    };
  }).filter((item) => !item.excluded);

  // Resolve projects with overrides
  const projOverrides: Record<string, CvItemOverride> = profile.overrides?.projects || {};
  const projects: ResolvedProject[] = portfolioData.projects.map((item) => {
    const ov: CvItemOverride = projOverrides[item.id] || {};
    const excluded = ov.excluded === true;
    const isEdited = Boolean(
      ov.title || ov.shortDesc || ov.description || (ov.bullets && ov.bullets.length > 0) || (ov.tech && ov.tech.length > 0)
    );

    return {
      id: item.id,
      title: ov.title !== undefined ? ov.title : item.title,
      shortDesc: ov.shortDesc !== undefined ? ov.shortDesc : item.shortDesc,
      tech: ov.tech !== undefined ? ov.tech : (item.stack && item.stack.length > 0 ? item.stack : [item.category]),
      highlights: ov.bullets !== undefined ? ov.bullets : item.highlights || [],
      link: ov.link !== undefined ? ov.link : item.link,
      year: item.year,
      isEdited,
      excluded,
    };
  }).filter((item) => !item.excluded);

  // Resolve education with overrides
  const eduOverrides: Record<string, CvItemOverride> = profile.overrides?.education || {};
  const education: ResolvedEducation[] = portfolioData.education.map((item, index) => {
    const key = String(index);
    const ov: CvItemOverride = eduOverrides[key] || {};
    const excluded = ov.excluded === true;
    const isEdited = Boolean(ov.degree || ov.institution || ov.period);

    return {
      id: key,
      originalIndex: index,
      degree: ov.degree !== undefined ? ov.degree : item.degree,
      institution: ov.institution !== undefined ? ov.institution : item.institution,
      period: ov.period !== undefined ? ov.period : item.period,
      year: item.year,
      note: item.note,
      bullets: ov.bullets !== undefined ? ov.bullets : (item.note ? [item.note] : []),
      isEdited,
      excluded,
    };
  }).filter((item) => !item.excluded);

  // Resolve certifications with overrides
  const certOverrides: Record<string, CvItemOverride> = profile.overrides?.certifications || {};
  const certifications: ResolvedCertification[] = portfolioData.certifications.map((item, index) => {
    const key = String(index);
    const ov: CvItemOverride = certOverrides[key] || {};
    const excluded = ov.excluded === true;
    const isEdited = Boolean(ov.name || ov.issuer || ov.date);

    return {
      id: key,
      originalIndex: index,
      name: ov.name !== undefined ? ov.name : item.name,
      issuer: ov.issuer !== undefined ? ov.issuer : item.issuer,
      date: ov.date !== undefined ? ov.date : undefined,
      isEdited,
      excluded,
    };
  }).filter((item) => !item.excluded);

  // Resolve skills by category
  const skillConfig = profile.overrides?.skills || { selectedCategories: [], selectedSkills: [], categoryLimits: {}, customSkills: [] };
  const categoriesToUse = skillConfig.selectedCategories && skillConfig.selectedCategories.length > 0
    ? skillConfig.selectedCategories
    : portfolioData.skillCategories.map((c) => c.title);

  const skillsByCategory: ResolvedSkillCategory[] = [];
  for (const cat of portfolioData.skillCategories) {
    if (!categoriesToUse.includes(cat.title)) continue;

    let tools = cat.coreTools;
    if (skillConfig.selectedSkills && skillConfig.selectedSkills.length > 0) {
      tools = tools.filter((tool) => skillConfig.selectedSkills.includes(tool));
    }

    const limits = skillConfig.categoryLimits || {};
    const limit = limits[cat.title];
    if (typeof limit === 'number' && limit > 0) {
      tools = tools.slice(0, limit);
    }

    if (tools.length > 0) {
      skillsByCategory.push({
        category: cat.title,
        skills: tools,
      });
    }
  }

  // Append custom skills if any
  if (skillConfig.customSkills && skillConfig.customSkills.length > 0) {
    const customGroup: Record<string, string[]> = {};
    for (const cs of skillConfig.customSkills) {
      const cat = cs.category || 'Other Technical Skills';
      if (!customGroup[cat]) customGroup[cat] = [];
      customGroup[cat].push(cs.name);
    }
    for (const [cat, items] of Object.entries(customGroup)) {
      const existing = skillsByCategory.find((c) => c.category === cat);
      if (existing) {
        existing.skills.push(...items);
      } else {
        skillsByCategory.push({ category: cat, skills: items });
      }
    }
  }

  // Links
  const links = [
    { label: 'GitHub', url: github },
    { label: 'LinkedIn', url: linkedin },
    { label: 'Portfolio', url: website },
  ].filter((l) => Boolean(l.url));

  // Sort sections according to profile.sections
  const sortedSections = [...(profile.sections || [])].sort((a, b) => a.order - b.order);

  return {
    profile,
    personal: {
      name: p.name,
      role: profile.targetTitle || p.role,
      email,
      phone,
      location,
      github,
      linkedin,
      website,
    },
    contactItems,
    sections: sortedSections,
    summary: profile.summary || p.bio,
    experience,
    projects,
    education,
    certifications,
    skillsByCategory,
    links,
  };
}
