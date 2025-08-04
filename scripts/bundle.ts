#!/usr/bin/env bun

import { buildPackages } from './build';
import { existsSync, cpSync } from 'fs';

async function bundleForDistribution() {
  console.log('📦 Creating distribution bundle...');

  // First, build all packages
  await buildPackages();

  // Copy additional files to dist
  const filesToCopy = [
    { from: './README.md', to: './dist/README.md' },
    { from: './package.json', to: './dist/package.json' },
  ];

  for (const { from, to } of filesToCopy) {
    if (existsSync(from)) {
      cpSync(from, to);
      console.log(`📄 Copied ${from} -> ${to}`);
    }
  }

  console.log('✅ Bundle ready for distribution!');
  console.log('📦 Run "npm publish ./dist" to publish to npm');
}

// Run if called directly
if (import.meta.main) {
  bundleForDistribution().catch(console.error);
}

export { bundleForDistribution };