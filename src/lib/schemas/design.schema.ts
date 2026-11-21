import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);

export const designColorsSchema = z.object({
  bg: hex,
  bgSoft: hex,
  surface: hex,
  surfaceRaised: hex,
  border: hex,
  borderSoft: z.string(),
  text: hex,
  textSoft: hex,
  muted: hex,
  accent: hex,
  accentSoft: hex,
  success: hex,
  warning: hex,
  danger: hex,
});

export const designTypographySchema = z.object({
  display: z.string().min(1),
  body: z.string().min(1),
  mono: z.string().min(1),
  baseSize: z.number().min(14).max(22),
  scaleRatio: z.number().min(1.05).max(1.5),
  headingWeight: z.number().min(400).max(900),
  letterSpacing: z.number().min(-0.05).max(0.2),
  lineHeight: z.number().min(1).max(2),
});

export const designLayoutSchema = z.object({
  containerWidth: z.number().int().min(960).max(1600),
  sectionSpacing: z.enum(['compact', 'comfortable', 'spacious']),
  radius: z.number().int().min(0).max(40),
  shadowStyle: z.enum(['none', 'subtle', 'raised', 'glass']),
  borderWidth: z.number().min(0).max(4),
});

export const designComponentsSchema = z.object({
  buttonStyle: z.enum(['solid', 'outline', 'ghost', 'pill']),
  cardStyle: z.enum(['flat', 'bordered', 'glass', 'raised']),
  navStyle: z.enum(['sticky blur', 'floating', 'minimal', 'transparent']),
  headingAccentStyle: z.enum(['colour', 'underline', 'gradient', 'highlight']),
  linkHoverStyle: z.enum(['accent', 'underline', 'lift']),
});

export const designBackgroundSchema = z.object({
  type: z.enum(['solid', 'gradient', 'grid', 'noise', 'orbit drift', 'floating code glyphs', 'particles', 'aurora', 'none']),
  intensity: z.number().min(0).max(100),
  speed: z.number().min(0).max(100),
  colours: z.array(hex).min(1).max(4),
});

export const designMotionSchema = z.object({
  pack: z.enum(['Subtle', 'Cinematic', 'Playful', 'Terminal', 'Minimal', 'None']),
  intensity: z.number().min(0).max(100),
  pageTransitions: z.boolean(),
  scrollReveal: z.boolean(),
  hoverTap: z.boolean(),
  sectionEntrances: z.boolean(),
  introBootSequence: z.boolean(),
  floatingGlyphs: z.boolean(),
  cursorEffects: z.boolean(),
});

export const sectionOverrideSchema = z.object({
  layout: z.enum(['inherit', 'split', 'centred', 'terminal', 'minimal', 'grid', 'list', 'masonry', 'carousel', 'expandable', 'compact tags']).default('inherit'),
  animation: z.enum(['inherit', 'Subtle', 'Cinematic', 'Playful', 'Terminal', 'Minimal', 'None']).default('inherit'),
  background: z.enum(['inherit', 'solid', 'gradient', 'grid', 'noise', 'orbit drift', 'floating code glyphs', 'particles', 'aurora', 'none']).default('inherit'),
  spacing: z.enum(['inherit', 'compact', 'comfortable', 'spacious']).default('inherit'),
});

export const designConfigSchema = z.object({
  schemaVersion: z.literal(1),
  presetId: z.string().min(1),
  name: z.string().min(1).optional(),
  mode: z.enum(['dark', 'light', 'auto']),
  colors: designColorsSchema,
  typography: designTypographySchema,
  layout: designLayoutSchema,
  components: designComponentsSchema,
  background: designBackgroundSchema,
  motion: designMotionSchema,
  sections: z.object({
    hero: sectionOverrideSchema.optional(),
    about: sectionOverrideSchema.optional(),
    journey: sectionOverrideSchema.optional(),
    toolkit: sectionOverrideSchema.optional(),
    work: sectionOverrideSchema.optional(),
    education: sectionOverrideSchema.optional(),
    contact: sectionOverrideSchema.optional(),
  }),
  customPresets: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    config: z.record(z.string(), z.unknown()),
  })).default([]),
  updatedAt: z.string().datetime().optional(),
});

export type DesignConfig = z.infer<typeof designConfigSchema>;
