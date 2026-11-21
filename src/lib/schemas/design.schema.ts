import { z } from 'zod';

export const themePresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mode: z.enum(['light', 'dark', 'auto']),
  colors: z.object({
    background: z.string(),
    backgroundSoft: z.string(),
    surface: z.string(),
    surfaceRaised: z.string(),
    border: z.string(),
    text: z.string(),
    textSoft: z.string(),
    muted: z.string(),
    accent: z.string(),
    accentSoft: z.string(),
  }),
  fonts: z.object({
    display: z.string(),
    body: z.string(),
    mono: z.string(),
  }),
  radius: z.number().int().min(0).max(32),
  shadow: z.enum(['none', 'subtle', 'raised', 'glass']),
  backgroundStyle: z.enum(['solid', 'gradient', 'grid', 'noise', 'orbit', 'glyphs', 'particles', 'aurora', 'none']),
});

export const designConfigSchema = z.object({
  presetId: z.string().default('lavender-charcoal'),
  theme: themePresetSchema,
  layout: z.object({
    containerWidth: z.number().int().min(960).max(1600).default(1280),
    sectionSpacing: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
    hero: z.enum(['split', 'centred', 'terminal', 'minimal']).default('split'),
    projects: z.enum(['grid', 'list', 'masonry', 'carousel']).default('grid'),
    skills: z.enum(['grid', 'list', 'cloud']).default('grid'),
    experience: z.enum(['timeline', 'cards', 'list']).default('timeline'),
  }),
  motion: z.object({
    pack: z.enum(['subtle', 'cinematic', 'playful', 'terminal', 'minimal', 'none']).default('subtle'),
    intensity: z.number().min(0).max(100).default(70),
    pageTransitions: z.boolean().default(true),
    hover: z.boolean().default(true),
    scroll: z.boolean().default(true),
    section: z.boolean().default(true),
    intro: z.boolean().default(true),
    background: z.boolean().default(true),
  }),
  customPresets: z.array(themePresetSchema).default([]),
  updatedAt: z.string().datetime().optional(),
});

export type DesignConfig = z.infer<typeof designConfigSchema>;
export type ThemePreset = z.infer<typeof themePresetSchema>;
