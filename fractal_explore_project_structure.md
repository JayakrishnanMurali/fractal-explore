# Fractal Explore - Project Structure & Publishing Strategy

## Publishing Strategy: Single Package Approach ✅

**Recommendation**: Publish as **one unified npm package** that contains both CLI and web interface.

### Why Single Package?
- **Simpler UX**: `npx fractal-explore` gets everything
- **Version Sync**: CLI and UI always compatible
- **Easier Maintenance**: Single release process
- **Smaller Bundle**: Shared dependencies, tree-shaking
- **Better DX**: No version mismatches between CLI/UI

---

## Project Structure

### Monorepo with Bun + TypeScript + React

```
fractal-explore/
├── 📁 packages/
│   ├── 📁 cli/                          # CLI package (main entry)
│   │   ├── bin/
│   │   │   └── fractal-explore.js       # CLI entry point
│   │   ├── src/
│   │   │   ├── commands/                # CLI commands
│   │   │   ├── detector/                # Project detection
│   │   │   ├── scanner/                 # Component discovery
│   │   │   ├── analyzer/                # AST analysis
│   │   │   ├── cache/                   # Caching system
│   │   │   ├── builder/                 # Rspack integration
│   │   │   ├── server/                  # Dev server
│   │   │   └── utils/                   # Shared utilities
│   │   ├── templates/                   # Code generation templates
│   │   └── package.json                 # CLI dependencies
│   │
│   ├── 📁 web/                          # React web interface
│   │   ├── src/
│   │   │   ├── components/              # UI components
│   │   │   │   ├── ComponentExplorer/
│   │   │   │   ├── PropEditor/
│   │   │   │   ├── CodeGenerator/
│   │   │   │   └── ComponentPreview/
│   │   │   ├── pages/                   # App pages
│   │   │   ├── hooks/                   # React hooks
│   │   │   ├── store/                   # Zustand store
│   │   │   ├── utils/                   # Web utilities
│   │   │   └── types/                   # TypeScript types
│   │   ├── public/                      # Static assets
│   │   ├── index.html                   # Entry HTML
│   │   └── package.json                 # Web dependencies
│   │
│   └── 📁 shared/                       # Shared utilities
│       ├── src/
│       │   ├── types/                   # Shared TypeScript types
│       │   ├── constants/               # Shared constants
│       │   └── utils/                   # Shared utilities
│       └── package.json
│
├── 📁 examples/                         # Example projects for testing
│   ├── react-vite-ts/
│   ├── react-cra/
│   └── react-next/
│
├── 📁 scripts/                          # Build & release scripts
│   ├── build.ts                         # Build all packages
│   ├── bundle.ts                        # Bundle for distribution
│   └── release.ts                       # Release automation
│
├── 📁 docs/                             # Documentation
├── 📁 tests/                            # Integration tests
├── package.json                         # Root package.json
├── bun.lockb                            # Bun lockfile
├── tsconfig.json                        # Root TypeScript config
└── README.md
```

---

## Package.json Configuration

### Root Package.json
```json
{
  "name": "fractal-explore",
  "version": "1.0.0",
  "description": "Zero-config component explorer for React applications",
  "bin": {
    "fractal-explore": "./dist/cli/bin/fractal-explore.js"
  },
  "main": "./dist/cli/index.js",
  "files": [
    "dist/",
    "templates/",
    "README.md"
  ],
  "scripts": {
    "build": "bun run scripts/build.ts",
    "bundle": "bun run scripts/bundle.ts", 
    "dev": "bun run packages/cli/src/index.ts",
    "test": "bun test",
    "release": "bun run scripts/release.ts"
  },
  "keywords": [
    "react",
    "components",
    "storybook",
    "development-tools",
    "ui-library"
  ],
  "dependencies": {
    "commander": "^11.0.0",
    "chokidar": "^3.5.3",
    "react-docgen": "^7.0.0",
    "@babel/parser": "^7.23.0",
    "@babel/traverse": "^7.23.0",
    "typescript": "^5.2.0",
    "xxhash-wasm": "^1.0.2",
    "msgpackr": "^1.9.7",
    "execa": "^8.0.1",
    "@rspack/core": "^0.4.0",
    "@rspack/dev-server": "^0.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.0",
    "bun-types": "^1.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/fractal-explore.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/fractal-explore/issues"
  },
  "homepage": "https://github.com/yourusername/fractal-explore#readme",
  "license": "MIT"
}
```

### CLI Package.json
```json
{
  "name": "@fractal-explore/cli",
  "private": true,
  "dependencies": {
    "commander": "^11.0.0",
    "chokidar": "^3.5.3",
    "react-docgen": "^7.0.0",
    "@babel/parser": "^7.23.0",
    "@babel/traverse": "^7.23.0",
    "typescript": "^5.2.0",
    "xxhash-wasm": "^1.0.2",
    "msgpackr": "^1.9.7",
    "execa": "^8.0.1",
    "@rspack/core": "^0.4.0",
    "@rspack/dev-server": "^0.4.0",
    "@fractal-explore/shared": "workspace:*"
  }
}
```

### Web Package.json
```json
{
  "name": "@fractal-explore/web",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.263.1",
    "@fractal-explore/shared": "workspace:*"
  }
}
```

---

## Build Strategy

### Bundling Approach
```typescript
// scripts/build.ts
import { build } from 'bun';

export async function buildPackages() {
  // 1. Build shared utilities
  await buildShared();
  
  // 2. Build CLI package  
  await buildCLI();
  
  // 3. Build and bundle React app
  await buildWeb();
  
  // 4. Create single distribution
  await createDistribution();
}

async function buildCLI() {
  await build({
    entrypoints: ['./packages/cli/src/index.ts'],
    outdir: './dist/cli',
    target: 'node',
    format: 'esm',
    external: ['react', 'react-dom'] // Don't bundle React
  });
}

async function buildWeb() {
  // Build React app as static assets
  await build({
    entrypoints: ['./packages/web/src/index.tsx'],
    outdir: './dist/web',
    target: 'browser',
    format: 'esm',
    minify: true,
    splitting: true // Enable code splitting
  });
}

async function createDistribution() {
  // Bundle everything into single publishable package
  // CLI + bundled React app + templates
  await copyFiles([
    { from: './dist/cli', to: './dist/cli' },
    { from: './dist/web', to: './dist/web' },
    { from: './packages/cli/templates', to: './dist/templates' }
  ]);
}
```

---

## Development Workflow

### Bun Workspace Setup
```json
// Root package.json
{
  "workspaces": [
    "packages/*"
  ],
  "trustedDependencies": [
    "@rspack/core"
  ]
}
```

### Development Commands
```bash
# Install all dependencies
bun install

# Develop CLI (watches for changes)
bun run dev

# Test with example project
cd examples/react-vite-ts
bun run ../../packages/cli/src/index.ts

# Build for production
bun run build

# Run tests
bun test

# Release to npm
bun run release
```

---

## Distribution Strategy

### What Gets Published to NPM
```
fractal-explore@1.0.0
├── dist/
│   ├── cli/                    # Compiled CLI code
│   ├── web/                    # Bundled React app
│   └── templates/              # Code generation templates  
├── bin/
│   └── fractal-explore.js      # CLI entry point
├── package.json                # Main package.json
└── README.md
```

### Runtime Architecture
```
User runs: npx fractal-explore
     ↓
CLI starts (dist/cli/)
     ↓
Scans components & builds config
     ↓
Starts Rspack dev server
     ↓
Serves bundled React app (dist/web/)
     ↓
User sees interface at localhost:3434
```

---

## Publishing Process

### Automated Release Script
```typescript
// scripts/release.ts
export async function release() {
  // 1. Run tests
  await runTests();
  
  // 2. Build packages
  await buildPackages();
  
  // 3. Update version
  await updateVersion();
  
  // 4. Create git tag
  await createGitTag();
  
  // 5. Publish to npm
  await publishToNpm();
  
  // 6. Create GitHub release
  await createGitHubRelease();
}

async function publishToNpm() {
  await $`npm publish --access public`;
}
```

### GitHub Actions CI/CD
```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
      - run: bun run build
      - run: npm publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Benefits of This Structure

### For Users
- **Simple**: `npx fractal-explore` just works
- **Fast**: Bun for development, optimized builds
- **Reliable**: Single package = no version conflicts

### For Development
- **Type Safety**: Shared types across packages
- **Fast Builds**: Bun's speed + incremental builds
- **Easy Testing**: Test CLI + web together
- **Monorepo Benefits**: Shared tooling, coordinated releases

### For Maintenance
- **Single Release**: Deploy CLI + UI together
- **Shared Dependencies**: Easier security updates
- **Consistent Versions**: No compatibility matrix
- **Simpler CI/CD**: One build, one test, one deploy

---

## Alternative Approaches Considered

### ❌ Separate Packages
```
fractal-explore-cli + fractal-explore-web
```
**Issues**: Version management, user confusion, complex setup

### ❌ Pure CLI Tool
```
Just CLI that generates static files
```
**Issues**: No interactivity, poor UX, limited features

### ✅ Single Package (Chosen)
```
fractal-explore (CLI + embedded web app)
```
**Benefits**: Simple UX, version sync, easier maintenance

---

## Getting Started Commands

```bash
# Clone and setup
git clone https://github.com/yourusername/fractal-explore
cd fractal-explore
bun install

# Develop
bun run dev

# Test with example
cd examples/react-vite-ts  
npx fractal-explore

# Build for release
bun run build

# Publish
npm publish
```

This structure gives you the best of both worlds: modern development experience with Bun, but simple deployment and usage for end users.