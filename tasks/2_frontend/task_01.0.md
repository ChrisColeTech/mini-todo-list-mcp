### Rules

1.) **CONCISENESS CLAUSE** When replying use as few words as needed to explain, plan or analyze. Long winded replies waste time and tokens. No long explanations. Stick to the main points an keep it breif. Do not perform extra work or validation.

2.) **WORKSPACE DIRECTIVE** Before you write any code or run any terminal commands, Verify you are in the workspace. Do not create files or folders outside of the workspace. No other files are permitted to be created other than what is in the task files. Create files only where specified: frontend, backend, electron, (or root if main package.json).

3.) **COMMAND FORMATTING** Always use && to chain commands in terminal! Use tools properly when needed, especially: **read file, write to file, execute command, read multiple files, list files, new task and complete task.**

4.) **READ THE TASK FILE AND THEN SUMMARIZE** Summarize and list the steps in the task file in chat after you read it (**HIGH LEVEL SUMMARY ONLY - NO CODE, NO COMMANDS**). Then follow the steps **VERBATIM** in the **EXACT** order they appear in the task file. Read rules **VERBATIM**, and follow them explicitly. For efficiency, do not explain code or make overly verbose comments. Only spend a maximum of 10 seconds thinking.

5.) **IMPORTANT** you should stop to resolve ALL build errors. you cannot complete task if the build does not pass.

6.) **FULL PATHS ONLY** Always confirm you are in the correct working directory first! When running terminal commands always use full paths for folders (e.g. cd C:/Projects/foo) to avoid errors.

7.) **READ FIRST DIRECTIVE** Read folders and files first before you write! File content is changed by the linter after you save. So before writing to a file you must read it first to get its latest content!

8.) Complete all work in the task file. Do not create or modify anything outside of these files.

9.) **TOOL USAGE CLAUSE** Always use the appropriate tools provided by the system for file operations. Specifically:

Use read_file to read files instead of command line utilities like type
Use write_to_file or insert_content to modify files
Use execute_command for running terminal commands Failing to use these tools properly may result in incomplete or incorrect task execution.

10.) **FINAL CHECKLIST** Always verify location before executing terminal commands. Use Full Paths: Always use full paths for directories when executing terminal commands. Resolve Terminal errors and syntax errors, ignore missing imports and do not create "placeholder" files unless instructed to do so. Do not create files or folders outside the workspace. **Only create files specified.** Only fix syntax errors and do not run the build to verify until the final task and all components have been fully populated.

# Task 3.0: Create Frontend Project - Part 1

Create or update the files below.

**Ensure you are in your project's root directory before starting.**

### 1. Initial Project Setup & Dependency Installation

```powershell

# Navigate to frontend dir
# Always use the FULL ABSOLUTE PATH when you cd
cd frontend && npm create vite@latest app -- --template react-ts && cd app
```

### 2. Create Directory Structure

```powershell
# Create directories
# Always use the FULL ABSOLUTE PATH when you cd
# MAKE SURE YOU ARE IN 'frontend/app' !!!
ni -ItemType Directory -Force -Path 'src/components/common','src/components/layout','src/components/menu','src/components/sidebar','src/components/titlebar','src/components/ui','src/config','src/hooks','src/lib','src/pages','src/pages/settings','src/services','src/styles','src/types','src/utils'
```

### 3. Create Empty Files

```powershell
# Create empty placeholder files (no content)
# Always use the FULL ABSOLUTE PATH when you cd
# MAKE SURE YOU ARE IN 'frontend/app' !!!
ni -ItemType File -Force -Path 'src/components/common/PageHeader.tsx','src/components/layout/Layout.tsx', 'src/components/layout/Sidebar.tsx', 'src/components/layout/SidePanel.tsx', 'src/components/layout/StatusBar.tsx', 'src/components/layout/TitleBar.tsx', 'src/components/menu/MenuButton.tsx', 'src/components/menu/DropdownMenu.tsx', 'src/components/menu/MenuItem.tsx', 'src/components/menu/Submenu.tsx', 'src/components/sidebar/CollapseButton.tsx', 'src/components/sidebar/NavigationItems.tsx', 'src/components/sidebar/NavItem.tsx', 'src/components/sidebar/SettingsButton.tsx', 'src/components/titlebar/AppControls.tsx', 'src/components/titlebar/TabBar.tsx', 'src/components/titlebar/WindowControls.tsx', 'src/components/ui/Select.tsx', 'src/components/ui/Switch.tsx', 'src/config/navigationConfig.tsx', 'src/hooks/useSettings.tsx', 'src/hooks/useTabs.tsx', 'src/hooks/usePlatform.tsx', 'src/lib/utils.tsx', 'src/pages/WelcomePage.tsx', 'src/pages/settings/SettingsPage.tsx', 'src/pages/settings/SettingsPanel.tsx', 'src/services/appService.tsx', 'src/services/platformService.tsx', 'src/services/electronService.tsx', 'src/services/browserService.tsx', 'src/services/navigationService.tsx', 'src/services/tabService.tsx', 'src/styles/variables.tsx', 'src/styles/base.tsx', 'src/styles/settings.tsx', 'src/styles/components.tsx', 'src/styles/borders.tsx', 'src/types/navigation.tsx', 'src/types/tab.tsx', 'src/types/electron-api.d.tsx', 'src/utils/iconUtils.tsx', 'src/utils/utils.tsx', 'src/App.tsx', 'src/main.tsx', 'src/index.tsx'

```

### 4. Update `package.json`

```json
{
  "name": "app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.app.json --noEmit",
    "preview": "vite preview"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@fontsource/inter": "^5.2.5",
    "@fortawesome/fontawesome-svg-core": "^6.7.2",
    "@fortawesome/free-solid-svg-icons": "^6.7.2",
    "@fortawesome/react-fontawesome": "^0.2.2",
    "@headlessui/react": "^2.2.4",
    "clsx": "^2.1.1",
    "lucide-react": "^0.511.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "^7.6.1",
    "tailwind-merge": "^3.3.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@eslint/js": "^9.25.0",
    "@rollup/rollup-win32-x64-msvc": "^4.41.1",
    "@tailwindcss/forms": "^0.5.10",
    "@types/node": "^22.15.24",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.25.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^16.0.0",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.3",
    "ts-node": "^10.9.2",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.30.1",
    "vite": "^6.3.5"
  }
}
```

### (Do not use terminal to populate files) Write the code for Root Configuration Files

Create or update the following configuration files with the verbatim content provided.

#### 5. TypeScript Configuration (`tsconfig.app.json`, `tsconfig.node.json`)

**`tsconfig.app.json`:**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "typeRoots": ["./node_modules/@types", "./node_modules/@fontsource", "./src/types"],
    "types": ["node", "vite/client"],

    /* Module Resolution */
    "moduleResolution": "node",
    "allowImportingTsExtensions": false,
    "moduleDetection": "auto",
    "noEmit": true,
    "allowUmdGlobalAccess": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts", "vite.config.ts"]
}
```

**`tsconfig.node.json`:**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["vite.config.ts"]
}
```

#### 6. Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const config = defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  base: './',
  server: {
    hmr: true,
    port: 5173,
    strictPort: true,
  },
})

export default config
```

#### 7. ESLint Configuration (`eslint.config.js`)

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'src/components/**',
      'src/hooks/**',
      'src/pages/**',
      'src/services/**',
      'src/styles/**',
      'src/types/**',
      'src/utils/**',
      'src/config/**',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
```

### 8. Minimal boot-strap code the build needs & cleanup

**Create or update (`frontend/app/src/main.tsx`)**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // keeps Tailwind or global styles hooked up

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Create or update (`frontend/app/src/App.tsx`):**

```typescript
import Layout from './components/layout/Layout'

function App() {
  return <Layout />
}

export default App
```

**Create or update (`frontend/app/src/components/layout/Layout.tsx`):**

```typescript
import React from 'react'

const Layout: React.FC = () => {
  return (
    <main className="grid h-dvh w-dvw place-items-center bg-slate-900 text-slate-100">
      <h1 className="text-3xl font-semibold">Scaffold works 🚀</h1>
    </main>
  )
}

export default Layout
```

**Delete (`frontend/app/src/App.css`)**

```bash
# Always use the FULL ABSOLUTE PATH when you cd
# MAKE SURE YOU ARE IN 'frontend/app' !!!
rm src/App.css
```

### 8. FINAL STEP - install all packages and build

**Should be ran last**

```powershell
# Always use the FULL ABSOLUTE PATH when you cd
# MAKE SURE YOU ARE IN 'frontend/app' !!!
npm install && npx tailwindcss init -p && npm run build && npm run lint && npm run typecheck

# install packages ✔
# vite + tsc compile ✔
# eslint ignores the blanks, so 0 errors ✔
# tsc --noEmit sees only App.tsx & main.tsx ✔
```

## Then call attempt completion
