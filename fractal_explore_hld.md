# Fractal Explore - High Level Design

## Overview

**Goal**: Self-hosted component explorer that scans React codebases and serves an interactive component library at `localhost:3434` with sub-2-minute initial setup and instant subsequent startups.

---

## Core Architecture

### Command Flow
```
npx fractal-explore
├── 1. Project Detection & Validation
├── 2. Cache Check & Restoration  
├── 3. Component Discovery & Analysis
├── 4. Build & Bundle Generation
├── 5. Dev Server Launch
└── 6. Background Updates
```

---

## Technology Stack

### CLI & Core Engine
- **CLI Framework**: [Commander.js](https://github.com/tj/commander.js) - Battle-tested, minimal overhead
- **File System**: [chokidar](https://github.com/paulmillr/chokidar) - Cross-platform file watching
- **Process Management**: [execa](https://github.com/sindresorhus/execa) - Better child processes

### Component Discovery & Analysis
- **AST Parsing**: [@babel/parser](https://babeljs.io/docs/en/babel-parser) + [@babel/traverse](https://babeljs.io/docs/en/babel-traverse)
- **TypeScript Analysis**: [typescript](https://www.npmjs.com/package/typescript) compiler API
- **React Analysis**: [react-docgen](https://github.com/reactjs/react-docgen) - Official React prop extraction

### Caching & Performance
- **Cache Storage**: [node-cache](https://github.com/node-cache/node-cache) + File system cache
- **Hashing**: [xxhash-wasm](https://github.com/jungomi/xxhash-wasm) - Ultra-fast content hashing
- **Serialization**: [msgpackr](https://github.com/kriszyp/msgpackr) - Faster than JSON

### Build System
- **Bundler**: [Rspack](https://www.rspack.dev/) with custom plugins
- **Dev Server**: [Rspack Dev Server](https://www.rspack.dev/guide/dev-server.html)
- **Code Generation**: Template-based component wrapper generation

### Web Interface
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Component Rendering**: Dynamic imports + React.lazy

---

## Detailed Component Flow

### 1. CLI Entry Point (`bin/fractal-explore.js`)
```javascript
#!/usr/bin/env node

// Parse CLI args, detect project type, initialize cache
commander
  .option('-p, --port <port>', 'Port number', '3434')
  .option('-c, --config <path>', 'Config file path')
  .option('--no-cache', 'Disable caching')
  .action(async (options) => {
    await startFractalExplore(options);
  });
```

### 2. Project Detection (`src/detector/`)
```javascript
// ProjectDetector.js
class ProjectDetector {
  async detect(cwd) {
    // Check package.json for React deps
    // Detect framework version
    // Find common component directories
    // Validate project structure
    return {
      framework: 'react',
      version: '18.2.0',
      componentDirs: ['src/components', 'src/ui'],
      tsconfig: 'tsconfig.json'
    };
  }
}
```

### 3. Smart Caching System (`src/cache/`)
```javascript
// CacheManager.js
class CacheManager {
  constructor() {
    this.cacheDir = path.join(os.homedir(), '.fractal-explore/cache');
    this.memoryCache = new NodeCache();
  }

  async getCachedScan(projectHash) {
    // Check memory first, then disk
    // Return cached component metadata
  }

  async updateCache(projectHash, componentData) {
    // Update both memory and disk cache
    // Use msgpackr for fast serialization
  }

  generateProjectHash(projectPath, dependencies) {
    // Hash based on package.json + file mtimes + git hash
    return xxhash.hash(JSON.stringify({
      packageJson: dependencies,
      gitHash: await getGitHash(),
      componentFiles: await getComponentFileMtimes()
    }));
  }
}
```

### 4. Component Discovery (`src/scanner/`)
```javascript
// ComponentScanner.js
class ComponentScanner {
  async scanProject(projectPath, options) {
    const files = await this.findComponentFiles(projectPath);
    const components = await Promise.all(
      files.map(file => this.analyzeComponent(file))
    );
    return components.filter(Boolean);
  }

  async analyzeComponent(filePath) {
    // Parse with Babel + TypeScript
    // Extract props with react-docgen
    // Generate component metadata
    return {
      name: 'Button',
      path: '/src/components/Button.tsx',
      props: [...],
      examples: [...],
      dependencies: [...]
    };
  }
}
```

### 5. Build Pipeline (`src/builder/`)
```javascript
// RspackBuilder.js
class RspackBuilder {
  async createDevConfig(components, projectConfig) {
    return {
      mode: 'development',
      entry: {
        app: './fractal-explore-runtime/app.tsx',
        components: this.generateComponentEntries(components)
      },
      plugins: [
        new FractalExplorePlugin(components),
        new rspack.HotModuleReplacementPlugin()
      ],
      devServer: {
        port: projectConfig.port,
        hot: true,
        historyApiFallback: true
      }
    };
  }
}
```

### 6. Runtime Generation (`src/runtime/`)
```javascript
// ComponentWrapper.js - Generated for each component
export const ButtonWrapper = () => {
  const [props, setProps] = useState(defaultProps);
  
  return (
    <div className="component-wrapper">
      <ComponentPreview>
        <Button {...props} />
      </ComponentPreview>
      <PropEditor 
        props={props} 
        schema={componentSchema}
        onChange={setProps} 
      />
    </div>
  );
};
```

---

## Caching Strategy

### Multi-Level Cache Architecture
```
┌─────────────────┐
│   Memory Cache  │ ← Hot component metadata
├─────────────────┤
│   Disk Cache    │ ← Parsed component data
├─────────────────┤
│  Build Cache    │ ← Rspack build artifacts
└─────────────────┘
```

### Cache Keys & Invalidation
- **Project Hash**: `package.json` + Git SHA + component file mtimes
- **Component Hash**: File content + dependencies + timestamp
- **Build Hash**: Source + Rspack config + plugin versions

### Cache Locations
- **Memory**: Component metadata, build configs
- **Disk**: `~/.fractal-explore/cache/{projectHash}/`
- **Build**: `node_modules/.cache/fractal-explore/`

---

## Performance Optimizations

### Initial Scan (<2 minutes)
- **Parallel Processing**: Scan components concurrently
- **Smart Discovery**: Skip `node_modules`, use `.gitignore`
- **Incremental Parsing**: Only parse changed files
- **Lazy Loading**: Load component details on-demand

### Subsequent Startups (<10 seconds)
- **Cache Restoration**: Load from disk cache immediately
- **Background Sync**: Update cache in background
- **Selective Rebuilding**: Only rebuild changed components
- **Memory Persistence**: Keep hot data in memory

### Runtime Performance
- **Code Splitting**: Load components on-demand
- **Virtual Scrolling**: Handle large component lists
- **Debounced Updates**: Batch prop changes
- **Worker Threads**: Heavy parsing in background

---

## File Structure

```
fractal-explore/
├── bin/
│   └── fractal-explore.js          # CLI entry point
├── src/
│   ├── cli/                        # Command line interface
│   ├── detector/                   # Project detection
│   ├── scanner/                    # Component discovery
│   ├── analyzer/                   # AST analysis & prop extraction
│   ├── cache/                      # Caching system
│   ├── builder/                    # Rspack build pipeline
│   ├── server/                     # Dev server
│   └── runtime/                    # Generated runtime code
├── templates/                      # Code generation templates
├── web/                           # React frontend
│   ├── src/
│   │   ├── components/            # UI components
│   │   ├── pages/                 # App pages
│   │   └── store/                 # State management
│   └── public/
└── plugins/                       # Rspack plugins
```

---

## Development Phases

### Phase 1: Core MVP (4-6 weeks)
1. **Week 1-2**: CLI + Project Detection + Basic Scanner
2. **Week 3-4**: Rspack Integration + Component Analysis  
3. **Week 5-6**: Web Interface + Caching System

### Phase 1.5: Performance & Polish (2-3 weeks)
1. **Optimization**: Cache tuning, build performance
2. **UX Polish**: Loading states, error handling
3. **Testing**: Integration tests, performance benchmarks

### Phase 2: Vue Support (3-4 weeks)
1. **Vue Scanner**: SFC parsing, prop extraction
2. **Universal Runtime**: Framework-agnostic component rendering
3. **Multi-framework**: Detect and handle mixed projects

---

## Key Libraries Summary

| Category | Library | Why |
|----------|---------|-----|
| **CLI** | Commander.js | Simple, powerful, widely used |
| **AST** | @babel/parser | Best React/JSX support |
| **Props** | react-docgen | Official React tool |
| **Build** | Rspack | Performance + Webpack compatibility |
| **Cache** | msgpackr | Fastest serialization |
| **Hash** | xxhash-wasm | Ultra-fast hashing |
| **Watch** | chokidar | Cross-platform file watching |
| **Process** | execa | Better child processes |

---

## Success Metrics

### Performance Targets
- **Initial Scan**: <2 minutes for 100+ components
- **Subsequent Startup**: <10 seconds
- **HMR**: <500ms component updates
- **Memory Usage**: <150MB for typical projects

### User Experience
- **Zero Config**: Works on 90% of React projects
- **Cache Hit Rate**: >95% on subsequent runs
- **Error Recovery**: Graceful handling of malformed components
- **Background Updates**: Non-blocking incremental updates