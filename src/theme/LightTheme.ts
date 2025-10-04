import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const PurpleTheme: ThemeTypes = {
  name: 'PurpleTheme',
  dark: false,
  variables: {
    'border-color': '#6366f1',
    'carousel-control-size': 10,
    'border-radius': '12px',
    'border-radius-sm': '8px',
    'border-radius-lg': '16px',
    'border-radius-xl': '20px'
  },
  colors: {
    primary: '#6366f1', // Indigo moderne
    secondary: '#8b5cf6', // Violet moderne
    info: '#06b6d4', // Cyan moderne
    success: '#10b981', // Émeraude moderne
    accent: '#f59e0b', // Ambre moderne
    warning: '#f59e0b', // Ambre moderne
    error: '#ef4444', // Rouge moderne
    lightprimary: '#eef2ff',
    lightsecondary: '#f3e8ff',
    lightsuccess: '#d1fae5',
    lighterror: '#fee2e2',
    lightwarning: '#fef3c7',
    darkText: '#111827',
    lightText: '#6b7280',
    darkprimary: '#4f46e5',
    darksecondary: '#7c3aed',
    borderLight: '#e5e7eb',
    inputBorder: '#9ca3af',
    containerBg: '#f9fafb',
    surface: '#ffffff',
    'on-surface-variant': '#ffffff',
    facebook: '#1877f2',
    twitter: '#1da1f2',
    linkedin: '#0a66c2',
    gray100: '#f3f4f6',
    primary200: '#c7d2fe',
    secondary200: '#ddd6fe'
  }
};

export { PurpleTheme };
