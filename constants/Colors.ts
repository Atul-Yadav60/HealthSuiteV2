

const tintColorLight = '#6366F1';
const tintColorDark = '#8B5CF6';

// --- Core Colors ---
export default {
  light: {
    text: '#181C2F',            // Deep blue-gray, high contrast
    background: '#F3F6FC',      // Glassy, modern surface
    tint: tintColorLight,
    tabIconDefault: '#B6BCD1',  // Muted blue-gray for inactive icons
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',            // Glass card surface
    cardBorder: '#E5E8F0',      // Subtle border for glass cards
    primary: '#6366F1',         // Brand blue-violet
    secondary: '#8B5CF6',       // Accent purple
    accent: '#EC4899',          // Hot pink accent
    success: '#10B981',         // Emerald green
    warning: '#F59E0B',         // Amber
    error: '#EF4444',           // Red
    info: '#3B82F6',            // Blue
    surface: '#F9FAFB',         // Card surface
    surfaceVariant: '#E5E7EB',  // Card variant
    onSurface: '#181C2F',
    onSurfaceVariant: '#6B7280',
    outline: '#D1D5DB',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F3F6FC',
      level3: '#F9FAFB',
      level4: '#E5E7EB',
      level5: '#D1D5DB',
    },
    warningBackground: 'rgba(245,158,11,0.16)',
  },
  dark: {
    text: '#F3F6FC',            // Glassy white
    background: '#181C2F',      // Modern deep blue-black
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    card: '#1A213A',
    cardBorder: '#2D334D',
    primary: '#8B5CF6',
    secondary: '#A855F7',
    accent: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    surface: '#21263A',
    surfaceVariant: '#1F2235',
    onSurface: '#F3F6FC',
    onSurfaceVariant: '#B6BCD1',
    outline: '#374151',
    elevation: {
      level0: 'transparent',
      level1: '#1A213A',
      level2: '#21263A',
      level3: '#181C2F',
      level4: '#16213E',
      level5: '#1A213A',
    },
    warningBackground: 'rgba(245,158,11,0.12)',
  },
} as const;

// --- Gradients ---
export const gradients = {
  primary: ['#667EEA', '#764BA2'] as [string, string],
  secondary: ['#F093FB', '#F5576C'] as [string, string],
  accent: ['#EC4899', '#F472B6'] as [string, string],
  success: ['#43E97B', '#38F9D7'] as [string, string],
  warning: ['#FA709A', '#FEE140'] as [string, string],
  error: ['#FF6B6B', '#FFE66D'] as [string, string],
  info: ['#A8EDEA', '#FED6E3'] as [string, string],
  dark: ['#181C2F', '#1A213A'] as [string, string],
  light: ['#F8FAFC', '#E2E8F0'] as [string, string],
  premium: ['#667EEA', '#764BA2', '#F093FB'] as [string, string, string],
  sunset: ['#FF6B6B', '#FFE66D', '#4ECDC4'] as [string, string, string],
  forest: ['#11998E', '#38EF7D'] as [string, string],
  cosmic: ['#FF6B6B', '#4ECDC4', '#45B7D1'] as [string, string, string],
};

// --- Glassmorphism ---
export const glassmorphism = {
  light: {
    background: 'rgba(255,255,255,0.3)',
    border: 'rgba(220,222,236,0.18)',
    shadow: '0 2px 8px 0 rgba(31,38,135,0.08)',
  },
  dark: {
    background: 'rgba(32,36,58,0.4)',
    border: 'rgba(255,255,255,0.10)',
    shadow: '0 2px 8px 0 rgba(0,0,0,0.12)',
  },
};

// --- Severity Colors ---
export const severityColors = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626',
};

// --- Module-specific Colors ---
export const moduleColors = {
  skinAI: {
    primary: '#667EEA',
    secondary: '#764BA2',
    gradient: ['#667EEA', '#764BA2'] as [string, string],
  },
  trustMed: {
    primary: '#8B5CF6',
    secondary: '#A855F7',
    gradient: ['#8B5CF6', '#A855F7'] as [string, string],
  },
  healMind: {
    primary: '#EC4899',
    secondary: '#F472B6',
    gradient: ['#EC4899', '#F472B6'] as [string, string],
  },
  pulseNet: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    gradient: ['#3B82F6', '#60A5FA'] as [string, string],
  },
  symptoCare: {
    primary: '#10B981',
    secondary: '#34D399',
    gradient: ['#10B981', '#34D399'] as [string, string],
  },
  medPlanner: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    gradient: ['#F59E0B', '#FBBF24'] as [string, string],
  },
};

// --- Animation Colors ---
export const animationColors = {
  shimmer: {
    light: ['#F3F4F6', '#E5E7EB', '#F3F4F6'] as [string, string, string],
    dark: ['#181C2F', '#21263A', '#181C2F'] as [string, string, string],
  },
  pulse: {
    light: [
      'rgba(99,102,241,0.09)',
      'rgba(99,102,241,0.18)',
      'rgba(99,102,241,0.09)',
    ] as [string, string, string],
    dark: [
      'rgba(139,92,246,0.10)',
      'rgba(139,92,246,0.23)',
      'rgba(139,92,246,0.10)',
    ] as [string, string, string],
  },
};