import React from 'react';
import { cn } from '@/lib/utils';

interface CustomTrophyProps extends React.SVGProps<SVGSVGElement> {
  color?: 'gold' | 'silver' | 'bronze';
}

export function CustomTrophy({ className, color = 'gold', ...props }: CustomTrophyProps) {
  const colors = {
    gold: {
      main: '#FFD700', // vibrant yellow gold
      dark: '#F59E0B', // amber/orange
      star: '#F59E0B', // deeper orange star
      highlight: '#FEF08A',
      base: '#475569',
      baseDark: '#334155'
    },
    silver: {
      main: '#E2E8F0', // bright silver
      dark: '#94A3B8', // slate dark
      star: '#94A3B8',
      highlight: '#F8FAFC',
      base: '#475569',
      baseDark: '#334155'
    },
    bronze: {
      main: '#D97706', // bronze orange
      dark: '#92400E', // dark bronze
      star: '#92400E',
      highlight: '#FCD34D',
      base: '#475569',
      baseDark: '#334155'
    }
  }[color];

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={cn("overflow-visible", className)} {...props}>
      {/* Handles (Back) */}
      <path d="M 25 30 C 0 30, 0 65, 35 60" fill="none" stroke={colors.main} strokeWidth="10" strokeLinecap="round" />
      <path d="M 75 30 C 100 30, 100 65, 65 60" fill="none" stroke={colors.main} strokeWidth="10" strokeLinecap="round" />
      
      {/* Inner Shadow for Handles */}
      <path d="M 25 30 C 0 30, 0 65, 35 60" fill="none" stroke={colors.dark} strokeWidth="4" strokeLinecap="round" strokeDasharray="30 100" />
      <path d="M 75 30 C 100 30, 100 65, 65 60" fill="none" stroke={colors.dark} strokeWidth="4" strokeLinecap="round" strokeDasharray="30 100" />

      {/* Stem */}
      <path d="M 40 65 L 60 65 L 65 80 L 35 80 Z" fill={colors.main} />
      <path d="M 40 65 L 50 65 L 50 80 L 35 80 Z" fill={colors.highlight} fillOpacity="0.4" />

      {/* Base */}
      <rect x="30" y="80" width="40" height="10" rx="3" fill={colors.base} />
      <rect x="25" y="90" width="50" height="10" rx="3" fill={colors.baseDark} />

      {/* Bowl */}
      <path d="M 20 20 L 80 20 C 80 65, 60 70, 50 70 C 40 70, 20 65, 20 20 Z" fill={colors.main} />
      
      {/* Bowl Highlights & Shadows */}
      <path d="M 20 20 L 50 20 C 50 70, 40 70, 20 20 Z" fill={colors.highlight} fillOpacity="0.3" />
      <path d="M 80 20 L 50 20 C 50 70, 60 70, 80 20 Z" fill={colors.dark} fillOpacity="0.2" />
      
      {/* Rim */}
      <ellipse cx="50" cy="20" rx="30" ry="6" fill={colors.highlight} />
      <ellipse cx="50" cy="20" rx="25" ry="4" fill={colors.main} />

      {/* Star */}
      <polygon points="50,30 53.5,38 62,38 55,43 58,51 50,46 42,51 45,43 38,38 46.5,38" fill={colors.star} />
    </svg>
  );
}
