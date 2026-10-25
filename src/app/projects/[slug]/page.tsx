import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Code2,
  Cpu,
  Database,
  Layers3,
  MessageSquare,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import SiteHeader from '@/components/portfolio/SiteHeader';
import TULogo from '@/components/brand/TULogo';
import { portfolioData } from '@/lib/data';

type Project = (typeof portfolioData.projects)[number];

const featureIcons: LucideIcon[] = [Layers3, Workflow, MessageSquare, Database, Bot, Cpu];

function getProject(slug: string): Project | undefined {
  return portfolioData.projects.find((project) => project.id === slug);
}

export function generateStaticParams() {
  return portfolioData.projects.map(({ id }) => ({ slug: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) return { title: 'Project not found | Thinu Upadya' };

  return {
    title: `${project.title} | Thinu Upadya`,
    description: project.shortDesc,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title: `${project.title} | Thinu Upadya`,
      description: project.shortDesc,
      type: 'article',
    },
  };
}

function ProjectLinks({ project }: { project: Project }) {
  const links: { label: string; href: string }[] = [];

  if ('link' in project && project.link) {
    links.push({
      label: 'linkLabel' in project && project.linkLabel ? project.linkLabel : 'Visit project',
      href: project.link,
    });
  }

  if ('links' in project && project.links) {
    project.links.forEach((href) => {
      try {
        links.push({ label: new URL(href).hostname.replace(/^www\./, ''), href });
      } catch {
        throw new Error(`Invalid project URL for ${project.title}`);
      }
    });
  }

  if (links.length === 0) return null;

  return (
    <div className="case-actions">
      {links.map(({ label, href }) => (
        <a className="button button-secondary" key={href} href={href} target="_blank" rel="noreferrer">
          {label} <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

function ProjectFooter() {
  return (
    <footer className="case-footer section-wrap">
      <Link className="wordmark" href="/" aria-label="Thinu Upadya, home">
        <TULogo variant="footer" />
      </Link>
      <span>Engineering ideas. Crafting experiences. · {new Date().getFullYear()}</span>
      <Link href="/#work">All projects ↑</Link>
    </footer>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const projectIndex = portfolioData.projects.findIndex((item) => item.id === project.id);
  const previousProject = portfolioData.projects[(projectIndex - 1 + portfolioData.projects.length) % portfolioData.projects.length];
  const nextProject = portfolioData.projects[(projectIndex + 1) % portfolioData.projects.length];
  const highlightTitle = 'highlightsTitle' in project && project.highlightsTitle
    ? project.highlightsTitle
    : 'Project highlights';
  const role = project.role;
  const challenge = 'challenge' in project ? project.challenge : undefined;
  const solution = 'solution' in project ? project.solution : undefined;
  const hasWorkflow = 'workflow' in project && Boolean(project.workflow);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main" className="case-study">
        <div className="case-container">
          <nav className="case-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/#work"><ArrowLeft size={15} aria-hidden="true" /> Back to projects</Link>
            <span aria-hidden="true">/</span>
            <span>{project.title}</span>
          </nav>

          <section className="case-hero" aria-labelledby="project-title">
            <div className="case-hero-copy">
              <div className="section-kicker">
                <span>PROJECT / {String(projectIndex + 1).padStart(2, '0')}</span>
                <span className="section-kicker-line" />
                <span>{project.type}</span>
              </div>
              <h1 id="project-title">{project.title}</h1>
              <p className="case-lede">{project.shortDesc}</p>
              <div className="case-hero-actions"><ProjectLinks project={project} /></div>
            </div>
            <div className="case-showcase" aria-label={`${project.title} typographic project overview`}>
              <span className="case-showcase-label">SELECTED WORK <span>·</span> {project.category.toUpperCase()}</span>
              <span className="case-showcase-mark" aria-hidden="true">
                {project.id === 'event-management' ? 'RFID' : project.id === 'ravanlink-autopilot' ? 'RL' : project.id === 'sisupay' ? 'S' : project.id === 'emc-grand-holdings' ? 'EMC' : String(projectIndex + 1).padStart(2, '0')}
              </span>
              <span className="case-showcase-title">{project.title}</span>
              <span className="case-showcase-bottom"><span>{project.status}</span><span>CASE STUDY · {project.year}</span></span>
            </div>
          </section>

          <dl className="case-meta-grid">
            <div><dt>Role</dt><dd>{role}</dd></div>
            <div><dt>Organization</dt><dd>{project.employer}</dd></div>
            <div><dt>Year</dt><dd>{project.year}</dd></div>
            <div><dt>Status</dt><dd>{project.status}</dd></div>
          </dl>

          <section className="case-section case-overview" aria-labelledby="case-overview-title">
            <div className="case-section-heading">
              <div className="section-kicker"><span>01</span><span className="section-kicker-line" /><span>OVERVIEW</span></div>
              <h2 id="case-overview-title">The idea behind the work.</h2>
            </div>
            <div className="case-overview-content">
              <p className="case-overview-copy">{project.fullDesc}</p>
              <aside className="case-role-card">
                <span className="card-index">COLLABORATION / ROLE</span>
                <Code2 size={20} aria-hidden="true" />
                <p>{role}</p>
              </aside>
            </div>
          </section>

          {challenge && solution && (
            <section className="case-section" aria-labelledby="case-approach-title">
              <div className="case-section-heading">
                <div className="section-kicker"><span>02</span><span className="section-kicker-line" /><span>CHALLENGE / APPROACH</span></div>
                <h2 id="case-approach-title">A clearer way through the complexity.</h2>
              </div>
              <div className="case-approach-grid">
                <article>
                  <span className="card-index">THE CHALLENGE</span>
                  <p>{challenge}</p>
                </article>
                <article>
                  <span className="card-index">THE APPROACH</span>
                  <p>{solution}</p>
                </article>
              </div>
            </section>
          )}

          <section className="case-section" aria-labelledby="case-highlights-title">
            <div className="case-section-heading">
              <div className="section-kicker"><span>03</span><span className="section-kicker-line" /><span>{highlightTitle.toUpperCase()}</span></div>
              <h2 id="case-highlights-title">
                {project.id === 'ravanlink-autopilot' ? 'A connected workspace for customer operations.' : 'What makes this project work.'}
              </h2>
              {project.id === 'ravanlink-autopilot' && (
                <p className="case-section-intro">Platform areas outlined in the release brief.</p>
              )}
              {project.status === 'In Development' && (
                <p className="case-section-intro">Current project scope; features are not presented as completed functionality.</p>
              )}
            </div>
            <div className="case-feature-grid">
              {project.highlights.map((highlight, index) => {
                const Icon = featureIcons[index % featureIcons.length];
                return (
                  <article className="case-feature-card" key={highlight}>
                    <span className="case-feature-index">0{index + 1}</span>
                    <Icon size={19} aria-hidden="true" />
                    <p>{highlight}</p>
                  </article>
                );
              })}
            </div>
          </section>

          {'workflow' in project && project.workflow && (
            <section className="case-section case-workflow" aria-labelledby="case-workflow-title">
              <div className="case-section-heading">
                <div className="section-kicker"><span>04</span><span className="section-kicker-line" /><span>WORKFLOW</span></div>
                <h2 id="case-workflow-title">From identification to an access record.</h2>
              </div>
              <ol className="case-workflow-list">
                {project.workflow.map((step, index) => (
                  <li key={step}>
                    <span className="rfid-step-number">0{index + 1}</span>
                    <span>{step}</span>
                    {index < project.workflow.length - 1 && <ArrowRight size={16} aria-hidden="true" />}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="case-section case-engineering" aria-labelledby="case-engineering-title">
            <div className="case-section-heading">
              <div className="section-kicker"><span>{hasWorkflow ? '05' : '04'}</span><span className="section-kicker-line" /><span>ENGINEERING</span></div>
              <h2 id="case-engineering-title">How the system fits together.</h2>
            </div>
            <div className="case-engineering-grid">
              <article className="case-architecture-card">
                <Layers3 size={20} aria-hidden="true" />
                <span className="card-index">ARCHITECTURE / APPROACH</span>
                <p>{project.architecture}</p>
              </article>
              {project.stack.length > 0 && (
                <div className="case-stack-card">
                  <div className="case-stack-heading">
                    <Database size={19} aria-hidden="true" />
                    <span className="card-index">TECHNOLOGY STACK</span>
                  </div>
                  <div className="tag-list" aria-label="Technologies used">
                    {project.stack.map((technology) => <span key={technology}>{technology}</span>)}
                  </div>
                </div>
              )}
              {'scopeNotice' in project && project.scopeNotice && (
                <aside className="case-release-note">
                  <span className="card-index">PROJECT STATUS</span>
                  <p>{project.scopeNotice}</p>
                </aside>
              )}
            </div>
          </section>

          <section className="case-next-project" aria-label="Project navigation">
            <Link className="case-project-nav case-project-previous" href={`/projects/${previousProject.id}`}>
              <span><ArrowLeft size={15} aria-hidden="true" /> PREVIOUS PROJECT</span>
              <strong>{previousProject.title}</strong>
            </Link>
            <Link className="case-project-nav case-project-next" href={`/projects/${nextProject.id}`}>
              <span>NEXT PROJECT <ArrowRight size={15} aria-hidden="true" /></span>
              <strong>{nextProject.title}</strong>
            </Link>
          </section>
        </div>
      </main>
      <ProjectFooter />
    </>
  );
}
