export type AnimationPackName = 'Subtle' | 'Cinematic' | 'Playful' | 'Terminal' | 'Minimal' | 'None';

export const animationPacks: Record<AnimationPackName, {
  entrance: { opacity: number; y: number; duration: number };
  hoverScale: number;
  stagger: number;
}> = {
  Subtle: { entrance: { opacity: 0, y: 20, duration: 0.18 }, hoverScale: 1, stagger: 0.05 },
  Cinematic: { entrance: { opacity: 0, y: 48, duration: 0.7 }, hoverScale: 1.015, stagger: 0.12 },
  Playful: { entrance: { opacity: 0, y: 28, duration: 0.45 }, hoverScale: 1.04, stagger: 0.08 },
  Terminal: { entrance: { opacity: 0, y: 8, duration: 0.24 }, hoverScale: 1.01, stagger: 0.04 },
  Minimal: { entrance: { opacity: 0, y: 0, duration: 0.12 }, hoverScale: 1, stagger: 0 },
  None: { entrance: { opacity: 1, y: 0, duration: 0 }, hoverScale: 1, stagger: 0 },
};
