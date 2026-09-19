import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function typewriterLines(lines: string[], speed = 40): Promise<void> {
  return new Promise((resolve) => {
    let lineIndex = 0;
    let charIndex = 0;

    const interval = setInterval(() => {
      if (lineIndex >= lines.length) {
        clearInterval(interval);
        resolve();
        return;
      }

      charIndex++;
      if (charIndex >= lines[lineIndex].length) {
        lineIndex++;
        charIndex = 0;
      }
    }, speed);
  });
}
