import { lavenderCharcoalConfig } from '@/lib/design/defaults';
import type { DesignConfig } from '@/lib/schemas/design.schema';

function preset(id: string, name: string, mode: 'dark' | 'light', accent: string, accentSoft: string, bg: string, surface: string, text: string): DesignConfig {
  return {
    ...lavenderCharcoalConfig,
    presetId: id,
    name,
    mode,
    colors: {
      ...lavenderCharcoalConfig.colors,
      bg,
      bgSoft: mode === 'light' ? '#ebe8df' : surface,
      surface,
      surfaceRaised: mode === 'light' ? '#ffffff' : '#191919',
      text,
      textSoft: mode === 'light' ? '#625b50' : '#a3a3a3',
      muted: mode === 'light' ? '#817a6e' : '#777777',
      border: mode === 'light' ? '#d8cdbb' : '#292929',
      accent,
      accentSoft,
    },
  };
}

export const themePresets: DesignConfig[] = [
  lavenderCharcoalConfig,
  preset('terminal-lime', 'Terminal Lime', 'dark', '#a3e635', '#bef264', '#090c08', '#11170e', '#f4f7ef'),
  preset('midnight-blue', 'Midnight Blue', 'dark', '#67c7f8', '#bae6fd', '#07111f', '#0d2035', '#eef6ff'),
  preset('warm-paper', 'Warm Paper', 'light', '#a84f32', '#d97757', '#f4efe6', '#fffaf2', '#29251f'),
  preset('mono-minimal', 'Mono Minimal', 'light', '#171717', '#525252', '#f7f7f5', '#ffffff', '#171717'),
  preset('sunset-ember', 'Sunset Ember', 'dark', '#fb7185', '#fda4af', '#190f0d', '#30201c', '#fff6f2'),
  preset('forest-mint', 'Forest Mint', 'dark', '#5ee3a5', '#a7f3d0', '#07130f', '#10251d', '#effaf5'),
  preset('neon-cyber', 'Neon Cyber', 'dark', '#e879f9', '#f0abfc', '#090712', '#171127', '#fbf7ff'),
];
