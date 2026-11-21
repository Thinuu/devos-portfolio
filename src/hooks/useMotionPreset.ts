'use client';

import { animationPacks, type AnimationPackName } from '@/lib/design/animationPacks';

export function useMotionPreset(pack: AnimationPackName = 'Subtle', intensity = 70) {
  const preset = animationPacks[pack] ?? animationPacks.Subtle;
  const scale = pack === 'None' ? 0 : intensity / 100;
  return {
    preset,
    hidden: { opacity: 1 - scale * (1 - preset.entrance.opacity), y: preset.entrance.y * scale },
    visible: { opacity: 1, y: 0, transition: { duration: preset.entrance.duration, ease: 'easeOut' as const } },
  };
}
