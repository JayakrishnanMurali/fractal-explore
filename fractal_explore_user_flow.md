# Fractal Explore - User Flow Deep Dive

## Scenario: React + Vite Project

**User Context**: Developer working on a React app built with Vite, has components scattered across `/src/components/`, `/src/ui/`, and `/src/pages/shared/`

---

## Step-by-Step User Journey

### 1. Initial Discovery & Installation

```bash
# User discovers Fractal Explore
cd my-react-vite-app/

# No installation needed - direct execution
npx fractal-explore
```

**What happens behind the scenes:**
- NPM downloads and caches `fractal-explore` package
- CLI starts and detects current working directory
- Shows branded welcome message with progress indicators

---

### 2. Project Detection Phase (5-10 seconds)

```bash
🔍 Fractal Explore v1.0.0

📁 Detecting project structure...
   ✅ React project detected (v18.2.0)
   ✅ Vite build system found
   ✅ TypeScript configuration detected
   ✅ Found 3 component directories

📊 Project Analysis:
   • Framework: React 18.2.0 + TypeScript
   • Build Tool: Vite 4.3.0
   • Component Paths: src/components, src/ui, src/pages/shared
   • Total Files: ~45 potential components
```

**Technical Implementation:**
```javascript
// ProjectDetector.js
async detectProject(cwd) {
  const packageJson = await readPackageJson(cwd);
  const viteConfig = await detectViteConfig(cwd);
  
  return {
    framework: 'react',
    buildTool: 'vite',
    typescript: true,
    componentDirs: [
      'src/components',
      'src/ui', 
      'src/pages/shared'
    ],
    dependencies: packageJson.dependencies
  };
}
```

---

### 3. Cache Check Phase (1-2 seconds)

```bash
🔄 Checking cache...
   ❌ No cache found for this project
   🚀 Starting fresh component scan...
```

**On subsequent runs:**
```bash
🔄 Checking cache...
   ✅ Cache found (last updated 2 hours ago)
   ⚡ Serving cached components...
   🔄 Background sync in progress...
   
🌐 Fractal Explore ready at http://localhost:3434
```

**Technical Implementation:**
```javascript
// CacheManager.js
async checkCache(projectPath) {
  const projectHash = await this.generateProjectHash(projectPath);
  const cacheKey = `project:${projectHash}`;
  
  // Check memory cache first
  let cachedData = this.memoryCache.get(cacheKey);
  
  // Fallback to disk cache
  if (!cachedData) {
    cachedData = await this.loadFromDisk(cacheKey);
  }
  
  return cachedData;
}
```

---

### 4. Component Discovery Phase (30-60 seconds)

```bash
🔍 Scanning components...
   📂 src/components/       [████████████████████] 12/12 complete
   📂 src/ui/               [████████████████████] 8/8 complete  
   📂 src/pages/shared/     [████████████████████] 3/3 complete

📋 Component Analysis:
   ✅ Button.tsx           → 7 props, 3 variants found
   ✅ Input.tsx            → 12 props, validation detected
   ✅ Modal.tsx            → 5 props, compound component
   ✅ DataTable.tsx        → 15 props, generic types detected
   ⚠️  BrokenCard.tsx      → Parse error (skipped)
   ... and 18 more components

💾 Caching results for faster future startups...
```

**Technical Implementation:**
```javascript
// ComponentScanner.js
async scanComponents(componentDirs) {
  const allFiles = await this.findComponentFiles(componentDirs);
  
  // Process in batches for better UX
  const batches = chunk(allFiles, 5);
  const results = [];
  
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(file => this.analyzeComponent(file))
    );
    
    results.push(...batchResults.filter(Boolean));
    this.updateProgress(results.length, allFiles.length);
  }
  
  return results;
}

async analyzeComponent(filePath) {
  try {
    // Parse file with Babel
    const ast = await parse(readFileSync(filePath), {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    // Extract React component info
    const componentInfo = await reactDocgen.parse(filePath);
    
    // Analyze props and generate metadata
    return {
      name: componentInfo.displayName,
      filePath,
      props: this.transformProps(componentInfo.props),
      examples: await this.findExamples(filePath),
      dependencies: this.extractDependencies(ast)
    };
  } catch (error) {
    console.warn(`⚠️ Skipping ${filePath}: ${error.message}`);
    return null;
  }
}
```

---

### 5. Build Pipeline Phase (30-45 seconds)

```bash
⚙️  Setting up development environment...
   📦 Generating component entries...
   🔧 Configuring Rspack build...
   🎨 Setting up component playground...
   🔥 Starting dev server with HMR...

🚀 Build complete! Starting server...
```

**Technical Implementation:**
```javascript
// RspackBuilder.js
async buildDevEnvironment(components, projectConfig) {
  // Generate entry points for each component
  const componentEntries = {};
  components.forEach(comp => {
    componentEntries[comp.name] = this.generateComponentWrapper(comp);
  });
  
  const rspackConfig = {
    mode: 'development',
    entry: {
      'fractal-app': './fractal-runtime/app.tsx',
      ...componentEntries
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: { syntax: 'typescript', tsx: true },
                transform: { react: { runtime: 'automatic' } }
              }
            }
          }
        }
      ]
    },
    plugins: [
      new FractalExplorePlugin({ components }),
      new rspack.HotModuleReplacementPlugin()
    ],
    devServer: {
      port: projectConfig.port || 3434,
      hot: true,
      open: false
    }
  };
  
  return rspack(rspackConfig);
}
```

---

### 6. Server Launch & Ready State (5-10 seconds)

```bash
🌐 Fractal Explore is ready!

   Local:   http://localhost:3434
   Network: http://192.168.1.100:3434

📊 Component Library:
   • 23 components discovered
   • 18 with complete prop definitions  
   • 5 with usage examples found
   • TypeScript definitions loaded

🎯 What's next?
   • Browse components in your browser
   • Edit props in real-time
   • Copy generated code snippets
   • Components auto-refresh on file changes

Press Ctrl+C to stop the server
```

---

### 7. Browser Experience

**Initial Load:**
User opens `http://localhost:3434` and sees:

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Fractal Explore    [Search components...]      ⚙️    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📁 Components (23)           │  🎨 Button Component    │
│   ├── 🔘 Button               │                         │
│   ├── 📝 Input                │  [Interactive Preview] │
│   ├── 🎯 Modal                │                         │
│   ├── 📊 DataTable            │   ┌─────────────────┐  │
│   ├── 🏷️ Tag                   │   │ Click Me!       │  │
│   └── ...                     │   └─────────────────┘  │
│                                │                         │
│  📁 UI Elements (8)            │  Props:                │
│   ├── 🎨 Card                 │   ├── variant: primary │
│   ├── 🔲 Badge                │   ├── size: medium     │
│   └── ...                     │   ├── disabled: false  │
│                                │   └── ...              │
│  📁 Shared (3)                 │                         │
│   ├── 🖼️ Avatar                │  💻 Code:              │
│   └── ...                     │   <Button              │
│                                │     variant="primary"  │
│                                │     size="medium"      │
│                                │   >                    │
│                                │     Click Me!          │
│                                │   </Button>            │
└─────────────────────────────────────────────────────────┘
```

**Interactive Experience:**
- **Real-time Preview**: Change props → instant visual update
- **Code Generation**: Copy-paste ready React code
- **Hot Reload**: Edit component file → browser updates automatically
- **Search & Filter**: Find components quickly
- **Responsive Preview**: Test different screen sizes

---

### 8. Developer Workflow Integration

**Scenario 1: Component Development**
```bash
# Developer is working on Button.tsx
# Saves file with new prop
# Browser automatically refreshes showing new prop in UI
```

**Scenario 2: Using a Component**
```bash
# Developer finds DataTable component
# Plays with props in Fractal Explore
# Copies generated code: <DataTable sortable={true} pageSize={10} />
# Pastes into their app
```

**Scenario 3: Stopping & Restarting**
```bash
# Ctrl+C to stop
^C Stopping Fractal Explore...

# Later, restart
npx fractal-explore
# ⚡ Cache found - ready in 8 seconds!
```

---

### 9. Error Handling & Edge Cases

**Malformed Components:**
```bash
⚠️  Warning: BrokenCard.tsx has parsing errors
   → Syntax error on line 15: Unexpected token
   → Component skipped, check your code

✅ Continuing with 22 other components...
```

**Port Conflicts:**
```bash
❌ Port 3434 is already in use
🔄 Trying port 3435...
✅ Server started on http://localhost:3435
```

**No Components Found:**
```bash
🤔 No React components found in this project
   
💡 Tips:
   • Make sure you're in a React project directory
   • Check if components are in common locations:
     - src/components/
     - src/ui/  
     - components/
   
   Use --help for more options
```

---

## Technical Architecture: How It All Works

### Component Wrapper Generation
```javascript
// Generated for each component
export const ButtonPlayground = () => {
  const [props, setProps] = useState({
    variant: 'primary',
    size: 'medium', 
    disabled: false,
    children: 'Click Me!'
  });

  return (
    <FractalWrapper>
      <ComponentPreview>
        <Button {...props} />
      </ComponentPreview>
      
      <PropEditor
        schema={ButtonPropSchema}
        values={props}
        onChange={setProps}
      />
      
      <CodeGenerator 
        component="Button"
        props={props}
      />
    </FractalWrapper>
  );
};
```

### Hot Module Replacement
```javascript
// File watcher detects changes
if (module.hot) {
  module.hot.accept('./Button.tsx', () => {
    // Re-analyze component
    // Update component metadata
    // Trigger browser refresh
  });
}
```

### Cache Strategy
```javascript
// On subsequent runs
const cachedData = await cacheManager.get(projectHash);
if (cachedData) {
  // Serve immediately
  startServer(cachedData.components);
  
  // Background sync
  backgroundSync(projectPath).then(updates => {
    if (updates.length > 0) {
      broadcastUpdates(updates);
    }
  });
}
```

---

## Key Benefits vs Storybook

| Aspect | Storybook | Fractal Explore |
|--------|-----------|-----------------|
| **Setup Time** | 15-30 minutes | <2 minutes |
| **Configuration** | Complex .storybook/ setup | Zero config |
| **Stories** | Manual story writing | Auto-generated |
| **Cold Start** | 30-60 seconds | <10 seconds (cached) |
| **Maintenance** | High (stories get outdated) | Low (auto-sync) |
| **Integration** | Separate build system | Uses your existing setup |

This flow ensures developers can get value immediately while the system gets smarter over time through caching and background updates.