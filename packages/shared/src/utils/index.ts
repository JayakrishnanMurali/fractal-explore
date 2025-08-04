import { existsSync } from 'fs';
import { join } from 'path';

export function isValidPath(path: string): boolean {
  return existsSync(path);
}

export function isReactProject(rootPath: string): boolean {
  const packageJsonPath = join(rootPath, 'package.json');
  if (!existsSync(packageJsonPath)) return false;
  
  try {
    const packageJson = require(packageJsonPath);
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    return 'react' in deps;
  } catch {
    return false;
  }
}

export function detectFramework(rootPath: string): 'react' | 'next' | 'vite' | null {
  const packageJsonPath = join(rootPath, 'package.json');
  if (!existsSync(packageJsonPath)) return null;
  
  try {
    const packageJson = require(packageJsonPath);
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if ('next' in deps) return 'next';
    if ('vite' in deps) return 'vite';
    if ('react' in deps) return 'react';
    
    return null;
  } catch {
    return null;
  }
}

export function normalizeComponentName(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  return fileName.replace(/\.(tsx|jsx|ts|js)$/, '');
}