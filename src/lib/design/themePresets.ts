import type { ThemePreset } from '@/lib/schemas/design.schema';

export const themePresets: ThemePreset[] = [
  {
    id: 'lavender-charcoal', name: 'Lavender Charcoal', mode: 'dark',
    colors: { background: '#080808', backgroundSoft: '#0d0d0d', surface: '#141414', surfaceRaised: '#191919', border: '#292929', text: '#f5f5f5', textSoft: '#a3a3a3', muted: '#777777', accent: '#b5a2d8', accentSoft: '#d2c5e8' },
    fonts: { display: 'Space Grotesk', body: 'Inter', mono: 'JetBrains Mono' }, radius: 10, shadow: 'subtle', backgroundStyle: 'orbit',
  },
  {
    id: 'terminal-lime', name: 'Terminal Lime', mode: 'dark',
    colors: { background: '#090c08', backgroundSoft: '#0d120b', surface: '#11170e', surfaceRaised: '#172014', border: '#293527', text: '#f4f7ef', textSoft: '#b1baa9', muted: '#7e8877', accent: '#a3e635', accentSoft: '#bef264' },
    fonts: { display: 'JetBrains Mono', body: 'Inter', mono: 'JetBrains Mono' }, radius: 6, shadow: 'none', backgroundStyle: 'grid',
  },
  {
    id: 'midnight-blue', name: 'Midnight Blue', mode: 'dark',
    colors: { background: '#07111f', backgroundSoft: '#0a1829', surface: '#0d2035', surfaceRaised: '#132842', border: '#244260', text: '#eef6ff', textSoft: '#adc1d6', muted: '#7f96ab', accent: '#67c7f8', accentSoft: '#bae6fd' },
    fonts: { display: 'Space Grotesk', body: 'Inter', mono: 'JetBrains Mono' }, radius: 12, shadow: 'raised', backgroundStyle: 'aurora',
  },
  {
    id: 'warm-paper', name: 'Warm Paper', mode: 'light',
    colors: { background: '#f4efe6', backgroundSoft: '#ebe3d5', surface: '#fffaf2', surfaceRaised: '#ffffff', border: '#d8cdbb', text: '#29251f', textSoft: '#625b50', muted: '#817a6e', accent: '#a84f32', accentSoft: '#d97757' },
    fonts: { display: 'Space Grotesk', body: 'Inter', mono: 'JetBrains Mono' }, radius: 8, shadow: 'subtle', backgroundStyle: 'noise',
  },
  {
    id: 'mono-minimal', name: 'Mono Minimal', mode: 'light',
    colors: { background: '#f7f7f5', backgroundSoft: '#ededeb', surface: '#ffffff', surfaceRaised: '#ffffff', border: '#d8d8d4', text: '#171717', textSoft: '#525252', muted: '#737373', accent: '#171717', accentSoft: '#525252' },
    fonts: { display: 'Inter', body: 'Inter', mono: 'JetBrains Mono' }, radius: 4, shadow: 'none', backgroundStyle: 'none',
  },
  {
    id: 'sunset-ember', name: 'Sunset Ember', mode: 'dark',
    colors: { background: '#190f0d', backgroundSoft: '#241311', surface: '#30201c', surfaceRaised: '#3b2924', border: '#554039', text: '#fff6f2', textSoft: '#cbbcb5', muted: '#9e8d87', accent: '#fb7185', accentSoft: '#fda4af' },
    fonts: { display: 'Space Grotesk', body: 'Inter', mono: 'JetBrains Mono' }, radius: 14, shadow: 'raised', backgroundStyle: 'gradient',
  },
  {
    id: 'forest-mint', name: 'Forest Mint', mode: 'dark',
    colors: { background: '#07130f', backgroundSoft: '#0b1b15', surface: '#10251d', surfaceRaised: '#173227', border: '#294739', text: '#effaf5', textSoft: '#b4c9bf', muted: '#81988d', accent: '#5ee3a5', accentSoft: '#a7f3d0' },
    fonts: { display: 'Space Grotesk', body: 'Inter', mono: 'JetBrains Mono' }, radius: 10, shadow: 'glass', backgroundStyle: 'particles',
  },
  {
    id: 'neon-cyber', name: 'Neon Cyber', mode: 'dark',
    colors: { background: '#090712', backgroundSoft: '#100c1d', surface: '#171127', surfaceRaised: '#211735', border: '#3b2b5d', text: '#fbf7ff', textSoft: '#c7bdd5', muted: '#968aa7', accent: '#e879f9', accentSoft: '#f0abfc' },
    fonts: { display: 'Space Grotesk', body: 'Inter', mono: 'JetBrains Mono' }, radius: 16, shadow: 'glass', backgroundStyle: 'glyphs',
  },
];

