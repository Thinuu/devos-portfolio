'use client';

import TULogo from '@/components/brand/TULogo';
import { ArrowDown, ArrowUpRight, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const navigation = [
  ['Home', 'home'],
  ['About', 'about'],
  ['Experience', 'experience'],
  ['Expertise', 'expertise'],
  ['Selected work', 'work'],
  ['Education', 'education'],
  ['Contact', 'contact'],
] as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const homeHref = isHome ? '#home' : '/#home';

  useEffect(() => {
    if (!isHome) return;

    const sections = navigation
      .map(([, id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <a className="wordmark" href={homeHref} aria-label="Thinu Upadya, home">
          <TULogo variant="compact" />
        </a>
        <nav id="main-navigation" className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {navigation.map(([label, id]) => (
            <a
              key={id}
              href={isHome ? `#${id}` : `/#${id}`}
              aria-current={isHome && activeSection === id ? 'location' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <a className="nav-resume" href="/THINU_UPADYA_CV_Updated.pdf" download onClick={() => setMenuOpen(false)}>
            Download CV <ArrowDown size={14} aria-hidden="true" />
          </a>
          <a className="nav-cta" href={isHome ? '#contact' : '/#contact'} onClick={() => setMenuOpen(false)}>
            Let&apos;s talk <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </nav>
        <button
          ref={menuButtonRef}
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="main-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}
