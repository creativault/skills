import { Inter } from 'next/font/google';

/**
 * Inter Font Configuration
 * 
 * Primary font for the application.
 * - weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
 * - subsets: latin
 * - display: swap (prevents FOIT - Flash of Invisible Text)
 * - CSS variable: --font-inter
 */
export const fontInter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

/**
 * Font variable reference for CSS
 * Use in tailwind.config.ts or CSS:
 * fontFamily: {
 *   sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
 * }
 */
export const fontSansVariable = 'var(--font-inter)';
