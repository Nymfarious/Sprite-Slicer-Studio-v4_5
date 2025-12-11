import { useEffect } from 'react';

// 10 distinct theme presets
export const THEME_PRESETS = [
  { id: 'cyber', name: 'Cyber', primary: '187 85% 53%', accent: '280 65% 60%', bg: '222 47% 6%', card: '222 47% 8%', secondary: '222 47% 14%' },
  { id: 'forest', name: 'Forest', primary: '142 70% 45%', accent: '84 60% 50%', bg: '150 30% 8%', card: '150 30% 10%', secondary: '150 30% 16%' },
  { id: 'sunset', name: 'Sunset', primary: '25 95% 55%', accent: '340 80% 55%', bg: '20 40% 8%', card: '20 40% 10%', secondary: '20 40% 16%' },
  { id: 'ocean', name: 'Ocean', primary: '200 80% 50%', accent: '220 70% 60%', bg: '210 50% 8%', card: '210 50% 10%', secondary: '210 50% 16%' },
  { id: 'royal', name: 'Royal', primary: '260 70% 60%', accent: '280 60% 50%', bg: '250 40% 8%', card: '250 40% 10%', secondary: '250 40% 16%' },
  { id: 'rose', name: 'Rose', primary: '340 75% 55%', accent: '320 60% 50%', bg: '340 30% 8%', card: '340 30% 10%', secondary: '340 30% 16%' },
  { id: 'amber', name: 'Amber', primary: '38 92% 50%', accent: '25 80% 45%', bg: '30 40% 6%', card: '30 40% 8%', secondary: '30 40% 14%' },
  { id: 'slate', name: 'Slate', primary: '215 25% 60%', accent: '200 30% 50%', bg: '220 20% 10%', card: '220 20% 12%', secondary: '220 20% 18%' },
  { id: 'mint', name: 'Mint', primary: '160 60% 50%', accent: '180 50% 45%', bg: '165 35% 8%', card: '165 35% 10%', secondary: '165 35% 16%' },
  { id: 'crimson', name: 'Crimson', primary: '0 72% 51%', accent: '340 70% 45%', bg: '0 30% 8%', card: '0 30% 10%', secondary: '0 30% 16%' },
] as const;

export type ThemeId = typeof THEME_PRESETS[number]['id'];

export function useTheme(themeId: string) {
  useEffect(() => {
    const theme = THEME_PRESETS.find(t => t.id === themeId) || THEME_PRESETS[0];
    const root = document.documentElement;
    
    // Apply theme CSS variables
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--background', theme.bg);
    root.style.setProperty('--card', theme.card);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--popover', theme.card);
    root.style.setProperty('--sidebar-background', theme.card);
    root.style.setProperty('--sidebar-primary', theme.primary);
    root.style.setProperty('--sidebar-accent', theme.secondary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--grid-line', theme.primary);
    root.style.setProperty('--drag-handle-hover', theme.primary);
    
    // Update glow effects
    root.style.setProperty('--glow-primary', `0 0 20px hsl(${theme.primary} / 0.3)`);
    root.style.setProperty('--glow-accent', `0 0 20px hsl(${theme.accent} / 0.3)`);
  }, [themeId]);
}
