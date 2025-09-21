const tintColorLight = '#6366F1';
const tintColorDark = '#8B5CF6';

export default {
  light: {
    text: '#1F2937',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    card: '#F9FAFB',
    cardBorder: '#E5E7EB',
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    onSurface: '#1F2937',
    onSurfaceVariant: '#6B7280',
    outline: '#D1D5DB',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F9FAFB',
      level3: '#F3F4F6',
      level4: '#E5E7EB',
      level5: '#D1D5DB',
    },
  },
  dark: {
    text: '#F9FAFB',
    background: '#0F0F23',
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    card: '#1A1A2E',
    cardBorder: '#2D2D44',
    primary: '#8B5CF6',
    secondary: '#A855F7',
    accent: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    surface: '#1A1A2E',
    surfaceVariant: '#16213E',
    onSurface: '#F9FAFB',
    onSurfaceVariant: '#9CA3AF',
    outline: '#374151',
    elevation: {
      level0: 'transparent',
      level1: '#1A1A2E',
      level2: '#16213E',
      level3: '#0F172A',
      level4: '#0C1421',
      level5: '#0A0F1A',
    },
  },
} as const;

// Premium gradient presets
export const gradients = {
  primary: ['#667EEA', '#764BA2'] as [string, string],
  secondary: ['#F093FB', '#F5576C'] as [string, string],
  accent: ['#4FACFE', '#00F2FE'] as [string, string],
  success: ['#43E97B', '#38F9D7'] as [string, string],
  warning: ['#FA709A', '#FEE140'] as [string, string],
  error: ['#FF6B6B', '#FFE66D'] as [string, string],
  info: ['#A8EDEA', '#FED6E3'] as [string, string],
  dark: ['#0F0F23', '#1A1A2E'] as [string, string],
  light: ['#F8FAFC', '#E2E8F0'] as [string, string],
  premium: ['#667EEA', '#764BA2', '#F093FB'] as [string, string, string],
  sunset: ['#FF6B6B', '#FFE66D', '#4ECDC4'] as [string, string, string],
  ocean: ['#667EEA', '#764BA2', '#F093FB'] as [string, string, string],
  forest: ['#11998E', '#38EF7D'] as [string, string],
  fire: ['#FF416C', '#FF4B2B'] as [string, string],
  cosmic: ['#FF6B6B', '#4ECDC4', '#45B7D1'] as [string, string, string],
};

// Glassmorphism styles
export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.25)',
    border: 'rgba(255, 255, 255, 0.18)',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  dark: {
    background: 'rgba(26, 26, 46, 0.25)',
    border: 'rgba(255, 255, 255, 0.18)',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
};

// Severity colors
export const severityColors = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626',
};

// Module-specific colors
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

// Animation colors
export const animationColors = {
  shimmer: {
    light: ['#F3F4F6', '#E5E7EB', '#F3F4F6'] as [string, string, string],
    dark: ['#1A1A2E', '#16213E', '#1A1A2E'] as [string, string, string],
  },
  pulse: {
    light: ['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.3)', 'rgba(99, 102, 241, 0.1)'] as [string, string, string],
    dark: ['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)'] as [string, string, string],
  },
};
