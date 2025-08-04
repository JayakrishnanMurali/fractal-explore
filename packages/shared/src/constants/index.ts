export const DEFAULT_PORT = 3434;
export const DEFAULT_HOST = 'localhost';

export const SUPPORTED_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'] as const;

export const DEFAULT_COMPONENT_PATHS = [
  'src/components',
  'components',
  'src/ui',
  'ui',
] as const;

export const DEFAULT_EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/*.stories.*',
] as const;

export const CACHE_DIR = '.fractal-explore' as const;