#!/usr/bin/env bun

import { build } from 'bun';
import { existsSync, rmSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();
const DIST_DIR = join(ROOT_DIR, 'dist');

async function buildPackages() {
  console.log('🏗️  Building fractal-explore packages...');

  // Clean dist directory
  if (existsSync(DIST_DIR)) {
    rmSync(DIST_DIR, { recursive: true });
  }
  mkdirSync(DIST_DIR, { recursive: true });

  // 1. Build shared utilities
  console.log('📦 Building shared package...');
  await buildShared();

  // 2. Build CLI package  
  console.log('🖥️  Building CLI package...');
  await buildCLI();

  // 3. Build and bundle React app
  console.log('⚛️  Building web package...');
  await buildWeb();

  // 4. Create single distribution
  console.log('📦 Creating distribution...');
  await createDistribution();

  console.log('✅ Build completed successfully!');
}

async function buildShared() {
  const result = await build({
    entrypoints: ['./packages/shared/src/index.ts'],
    outdir: './dist/shared',
    target: 'node',
    format: 'esm',
    sourcemap: 'external',
  });

  if (!result.success) {
    console.error('❌ Failed to build shared package');
    process.exit(1);
  }
}

async function buildCLI() {
  const result = await build({
    entrypoints: ['./packages/cli/src/index.ts'],
    outdir: './dist/cli',
    target: 'node',
    format: 'esm',
    external: ['react', 'react-dom'], // Don't bundle React
    sourcemap: 'external',
  });

  if (!result.success) {
    console.error('❌ Failed to build CLI package');
    process.exit(1);
  }

  // Copy bin file
  cpSync('./packages/cli/bin', './dist/cli/bin', { recursive: true });
}

async function buildWeb() {
  const result = await build({
    entrypoints: ['./packages/web/src/index.tsx'],
    outdir: './dist/web',
    target: 'browser',
    format: 'esm',
    minify: true,
    splitting: true, // Enable code splitting
    sourcemap: 'external',
  });

  if (!result.success) {
    console.error('❌ Failed to build web package');
    process.exit(1);
  }

  // Copy HTML template
  if (existsSync('./packages/web/index.html')) {
    cpSync('./packages/web/index.html', './dist/web/index.html');
  }
}

async function createDistribution() {  
  // Copy templates if they exist
  const templatesPath = './packages/cli/templates';
  if (existsSync(templatesPath)) {
    cpSync(templatesPath, './dist/templates', { recursive: true });
  }

  console.log('📋 Distribution structure:');
  console.log('  dist/');
  console.log('  ├── cli/       # Compiled CLI code');
  console.log('  ├── web/       # Bundled React app');
  console.log('  ├── shared/    # Shared utilities');
  console.log('  └── templates/ # Code generation templates');
}

// Run if called directly
if (import.meta.main) {
  buildPackages().catch(console.error);
}

export { buildPackages };