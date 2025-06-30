# Task 3.1: Electron Application Setup for React Frontend

### Rules

1.) **CONCISENESS CLAUSE** When replying use as few words as needed to explain, plan or analyze. Long winded replies waste time and tokens. No long explanations. Stick to the main points an keep it breif. Do not perform extra work or validation.

2.) **WORKSPACE DIRECTIVE** Before you write any code or run any terminal commands, Verify you are in the workspace. Do not create files or folders outside of the workspace. No other files are permitted to be created other than what is in the task files. Create files only where specified: frontend, backend, electron, (or root if main package.json).

3.) **COMMAND FORMATTING** Always use && to chain commands in terminal! Use tools properly when needed, especially: **read file, write to file, execute command, read multiple files, list files, new task and complete task.**

4.) **READ THE TASK FILE AND THEN SUMMARIZE** Summarize and list the steps in the task file in chat after you read it (**HIGH LEVEL SUMMARY ONLY - NO CODE, NO COMMANDS**). Then follow the steps **VERBATIM** in the **EXACT** order they appear in the task file. Read rules **VERBATIM**, and follow them explicitly. For efficiency, do not explain code or make overly verbose comments. Only spend a maximum of 10 seconds thinking.

5.) **IMPORTANT** do not stop to resolve build errors, missing files or missing imports.

6.) **FULL PATHS ONLY** Always confirm you are in the correct working directory first! When running terminal commands always use full paths for folders (e.g. cd C:/Projects/foo) to avoid errors.

7.) **READ FIRST DIRECTIVE** Read folders and files first before you write! File content is changed by the linter after you save. So before writing to a file you must read it first to get its latest content!

8.) Complete all work in the task file. Do not create or modify anything outside of these files.

9.) **TOOL USAGE CLAUSE** Always use the appropriate tools provided by the system for file operations. Specifically:

Use read_file to read files instead of command line utilities like type
Use write_to_file or insert_content to modify files
Use execute_command for running terminal commands Failing to use these tools properly may result in incomplete or incorrect task execution.

10.) **FINAL CHECKLIST** Always verify location before executing terminal commands. Use Full Paths: Always use full paths for directories when executing terminal commands. Resolve Terminal errors and syntax errors, ignore missing imports and do not create "placeholder" files unless instructed to do so. Do not create files or folders outside the workspace. **Only create files specified.** Only fix syntax errors and do not run the build to verify until the final task and all components have been fully populated.

## Commands (PowerShell)

**From the PROJECT ROOT directory (e.g., your-project-root):**

```powershell
# STEP 2: Install Electron & Build Tool Dependencies (at Root)
npm install --save-dev electron electron-builder electron-reload wait-on cross-env concurrently
```

_(Ensure versions match project documentation if specific versions are required)_

## Detailed Steps and Explanations

### 1. **Crucial:**

Before proceeding, thoroughly inspect the `electron/` directory. If a `Docs/` subfolder exists,

**you must read relevant files for your task onlywithin it VERBATIM.**

These documents may contain critical style guides, architectural requirements, specific data models, or setup instructions that supersede or augment the general steps below.

- **Project Root:** All `npm install` commands and `package.json` modifications are done here.
- **`electron/`:** For `main.js`, `preload.js`.
- **VERBATIM from Docs:** **Crucially, review `electron/Docs/COMPREHENSIVE_ELECTRON_INTEGRATION_GUIDE.md` and `BUILD_PROCESS.md`. The `main.js`, `preload.js`, and `package.json` (especially `scripts` and `build` sections) below are based on these documents and must be adapted if your project's versions differ.**

### 2.1. Corrections and Troubleshooting during Setup

During the Electron setup process, several issues were encountered and resolved. This section documents these corrections to prevent similar issues in the future.

#### a. Correcting `package.json` Scripts for Command Chaining and Paths

Initially, the `npm` scripts in the root `package.json` used semicolons (`;`) for command chaining and relative paths. This caused issues with command execution, particularly when using `concurrently`. The correct approach for cross-platform command chaining in `npm` scripts is to use `&&`. Additionally, using full paths for directory changes within scripts can improve reliability in some environments.

**Correction:**

Update the `scripts` section in your root `package.json` to use `&&` for command chaining and full paths for `cd` commands.

```json
"scripts": {
  "start:backend": "cd C:/Projects/LLMTest13/backend && dotnet watch run",
  "start:frontend": "cd C:/Projects/LLMTest13/frontend/app && npm run dev",
  "start:electron": "wait-on http://localhost:5173 && cross-env NODE_ENV=development electron .",
  "start": "concurrently --kill-others \"npm:start:backend\" \"npm:start:frontend\" \"npm:start:electron\"",
  "dev": "npm run start",
  "build:web": "cd frontend/app && npm run build",
  "build:backend": "cd backend && dotnet publish backend.csproj -c Release -o ./publish",
  "build:backend:win": "cd backend && dotnet publish backend.csproj -c Release -r win-x64 -o ./publish",
  "build:backend:mac": "cd backend && dotnet publish backend.csproj -c Release -r osx-x64 -o ./publish",
  "build:backend:linux": "cd backend && dotnet publish backend.csproj -c Release -r linux-x64 -o ./publish",
  "build:electron": "npm run build:web && npm run build:backend && electron-builder",
  "build:win": "npm run build:web && npm run build:backend:win && electron-builder --win",
  "build:mac": "npm run build:web && npm run build:backend:mac && electron-builder --mac",
  "build:linux": "npm run build:web && npm run build:backend:linux && electron-builder --linux",
  "build": "npm run build:electron"
},
```

#### b. Specifying Backend Project File in Build Script

When the backend directory contains multiple project or solution files, the `dotnet publish` command requires specifying the target project file.

**Correction:**

Update the `build:backend` scripts in your root `package.json` to explicitly include `backend.csproj`.

```json
"build:backend": "cd backend && dotnet publish backend.csproj -c Release -o ./publish",
"build:backend:win": "cd backend && dotnet publish backend.csproj -c Release -r win-x64 -o ./publish",
"build:backend:mac": "cd backend && dotnet publish backend.csproj -c Release -r osx-x64 -o ./publish",
"build:backend:linux": "cd backend && dotnet publish backend.csproj -c Release -r linux-x64 -o ./publish",
```

#### c. Handling Paths for Unpackaged Production Simulation in `main.js`

When running the Electron application in an unpackaged production simulation (`NODE_ENV='production'` but `!app.isPackaged`), `process.resourcesPath` points to the Electron installation directory, not the project root. To correctly locate the built frontend and backend resources, the `ELECTRON_EXTRA_RESOURCES_DIR` environment variable should be used. Additionally, the path to the frontend's `index.html` needs to point to the `dist` directory within the frontend build output.

**Correction:**

Modify the `createWindow` and `startApi` functions in `electron/main.js` to use `process.env.ELECTRON_EXTRA_RESOURCES_DIR` when the application is not packaged, and adjust the `indexPath` accordingly.

```javascript
function createWindow() {
  // ... existing code ...
  if (isDev) {
    // ... existing code ...
  } else {
    const resourcesPath = app.isPackaged
      ? process.resourcesPath
      : process.env.ELECTRON_EXTRA_RESOURCES_DIR
    const indexPath = app.isPackaged
      ? path.join(resourcesPath, 'frontend', 'index.html')
      : path.join(resourcesPath, 'frontend', 'app', 'dist', 'index.html')
    mainWindow.loadFile(indexPath)
  }
  // ... existing code ...
}

function startApi() {
  // ... existing code ...
  const apiName = process.platform === 'win32' ? 'backend.exe' : 'backend'
  const resourcesPath = app.isPackaged
    ? process.resourcesPath
    : process.env.ELECTRON_EXTRA_RESOURCES_DIR
  const apiPath = app.isPackaged
    ? path.join(resourcesPath, 'backend', 'publish', apiName)
    : path.join(resourcesPath, 'backend', 'publish', apiName)

  const env = { ...process.env, ASPNETCORE_URLS: 'http://localhost:5001' }
  if (app.isPackaged) {
    env.IS_PACKAGED = 'true'
  }
  // ... existing code ...
}
```

#### d. Conditionally Applying Backend Migrations and Environment Variable Usage

In the backend's `DataSeeder.SeedData` method, applying database migrations unconditionally can cause errors in subsequent runs if the database already exists. Migrations should only be applied when the application is running in a packaged environment and there are pending migrations. An environment variable set by the Electron main process can be used to determine if the application is packaged. Additionally, using `System.Environment.GetEnvironmentVariable` requires a `using static System.Environment;` directive.

**Correction:**

Modify the `SeedData` method in `backend/Data/DataSeeder.cs` to conditionally apply migrations based on the `IS_PACKAGED` environment variable and correct the using directive.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using backend.Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using static System.Environment; // Corrected using directive

namespace backend.Data
{
    public static class DataSeeder
    {
        public static void SeedData(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                try
                {
                    // Only apply migrations if the application is packaged (checked via environment variable)
                    bool isPackaged = GetEnvironmentVariable("IS_PACKAGED") == "true";
                    if (isPackaged)
                    {
                         if (context.Database.GetPendingMigrations().Any())
                         {
                             context.Database.Migrate();
                         }
                    }

                    // Check if a specific predefined model exists before seeding
                    if (!context.LlmModels.Any(m => m.Name == "GPT-3"))
                    {
                        var llmModels = GetPredefinedLlmModels();
                        context.LlmModels.AddRange(llmModels);
                        context.SaveChanges();
                    }
                }
                catch (Exception ex)
                {
                    //Log.LogError(ex, "Error during database initialization and seeding.");
                    throw;
                }
            }
        }

        private static List<LlmModel> GetPredefinedLlmModels()
        {
            // ... existing code ...
        }
    }
}
```

#### e. Correct Production Simulation Command

The command to run the unpackaged production simulation needs to correctly set the `NODE_ENV` and `ELECTRON_EXTRA_RESOURCES_DIR` environment variables for PowerShell.

**Correction:**

Use the `$env:` prefix to set environment variables in the PowerShell command.

```powershell
$env:NODE_ENV='production'; $env:ELECTRON_EXTRA_RESOURCES_DIR='C:/Projects/LLMTest13'; electron .
```

### 2. Install Electron & Build Tool Dependencies (at Root)

Install Electron, `electron-builder` for packaging, `electron-reload` for development, and utility packages for script management.

**Action:**
From your **project root** directory:

```powershell
npm install --save-dev electron electron-builder electron-reload wait-on cross-env concurrently
```

_(Use specific versions like `electron@^25.0.0` if your project docs require them, otherwise `@latest` is implied by not specifying a version for some of these in the docs, but the comprehensive guide lists them as general dev dependencies.)_

### 3. Scaffold Electron Entry Points (VERBATIM from `COMPREHENSIVE_ELECTRON_INTEGRATION_GUIDE.md`)

Create `main.js` and `preload.js` in `electron/`. Their content is critical for IPC, window management, and backend process handling.

**`electron/main.js`:**

### 2.1. Corrections and Troubleshooting during Setup

During the Electron setup process, several issues were encountered and resolved. This section documents these corrections to prevent similar issues in the future.

#### a. API Process Management

The most important principle is that API process management should be handled ONLY by the Electron main process, not by React components or hooks. This separation of concerns is crucial for proper application behavior.

**INCORRECT Approach (Do Not Use):**

```typescript
// Do NOT manage API process in React hooks
const useComparisonRecords = () => {
  const fetchRecords = async () => {
    if (electronAPI?.startApiProcess) {
      await electronAPI.startApiProcess()
    }
    // ... fetch records
  }
}
```

**CORRECT Approach:**

```typescript
// React hooks should only handle data fetching
const useComparisonRecords = () => {
  const fetchRecords = async () => {
    const response = await fetch(`${API_URL}/api/ComparisonRecords`)
    // ... handle response
  }
}

// API process management belongs in main.js
function startApi() {
  if (isDev) {
    console.log('Development mode: .NET API should be started manually.')
    return
  }

  const apiName = process.platform === 'win32' ? 'backend.exe' : 'backend'
  const apiPath = path.join(process.resourcesPath, 'backend', 'publish', apiName)

  console.log(`Attempting to start packaged API from: ${apiPath}`)

  try {
    apiProcess = spawn(apiPath, [], {
      stdio: 'pipe',
      detached: false,
      env: { ...process.env, ASPNETCORE_URLS: 'http://localhost:5001' },
    })

    apiProcess.stdout.on('data', (data) => {
      console.log(`API stdout: ${data.toString()}`)
    })

    apiProcess.stderr.on('data', (data) => {
      console.error(`API stderr: ${data.toString()}`)
    })

    apiProcess.on('error', (error) => {
      console.error('Failed to start API process:', error)
      apiProcess = null
    })

    apiProcess.on('close', (code) => {
      console.log(`API process exited with code ${code}`)
      apiProcess = null
    })

    console.log('Packaged API process started.')
  } catch (error) {
    console.error('Error spawning API process:', error)
    apiProcess = null
  }
}
```

#### b. Path Resolution in Production

Path resolution in production builds requires careful handling to ensure assets are loaded correctly. The key principles are:

1. Use `process.resourcesPath` for accessing resources in production.
2. Keep path handling in the Electron main process.
3. Use relative paths in the React application by setting `base: './'` in `vite.config.ts`.

**CORRECT Approach for `main.js`:**

```javascript
// In main.js
if (isDev) {
  mainWindow.loadURL('http://localhost:5173')
} else {
  const indexPath = path.join(process.resourcesPath, 'frontend', 'index.html')
  console.log('Loading from:', indexPath)
  mainWindow.loadFile(indexPath)
}

// In vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  base: './',
})
```

#### c. Process Termination

Proper process termination is crucial, especially on Windows. Use the appropriate method based on the platform.

```javascript
function stopApi() {
  if (apiProcess) {
    console.log('Attempting to kill API process...')
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', apiProcess.pid, '/f', '/t'])
    } else {
      apiProcess.kill('SIGTERM')
    }
    apiProcess = null
  }
}
```

[Previous content from "3. Install Electron & Build Tool Dependencies" onwards remains unchanged]

## Electron & React Integration Guide

For a comprehensive guide on integrating Electron with a React frontend and a backend API, refer to the `electron/docs/ELECTRON_REACT_INTEGRATION_GUIDE.md` file.

## React Hooks & Electron: Best Practices for API Interaction

For best practices on how React hooks should interact with the Electron main process and the backend API, refer to the `electron/docs/REACT_HOOKS_BEST_PRACTICES.md` file.

### 4. Update Root `package.json` (VERBATIM from Docs, adapted for React)

Configure `main` field, `scripts`, and `electron-builder` settings (`build` section). **This section is critical and must align with `COMPREHENSIVE_ELECTRON_INTEGRATION_GUIDE.md` and `BUILD_PROCESS.md`, adapted for your React/Vite frontend.**

**Action (Modify root `package.json`):**

```json
{
  "name": "insightllm-studio",
  "version": "1.0.0",
  "description": "InsightLLM Studio Application",
  "main": "electron/main.js",
  "scripts": {
    "start:backend": "cd backend && dotnet watch run",
    "start:frontend": "cd frontend/app && npm run dev",
    "start:electron": "wait-on http://localhost:5173 && cross-env NODE_ENV=development electron .",
    "start": "concurrently --kill-others \"npm:start:backend\" \"npm:start:frontend\" \"npm:start:electron\"",
    "dev": "npm run start",
    "build:web": "cd frontend/app && npm run build",
    "build:backend": "cd backend && dotnet publish -c Release -o ./publish",
    "build:backend:win": "cd backend && dotnet publish -c Release -r win-x64 -o ./publish",
    "build:backend:mac": "cd backend && dotnet publish -c Release -r osx-x64 -o ./publish",
    "build:backend:linux": "cd backend && dotnet publish -c Release -r linux-x64 -o ./publish",
    "build:electron": "npm run build:web && npm run build:backend && electron-builder",
    "build:win": "npm run build:web && npm run build:backend:win && electron-builder --win",
    "build:mac": "npm run build:web && npm run build:backend:mac && electron-builder --mac",
    "build:linux": "npm run build:web && npm run build:backend:linux && electron-builder --linux",
    "build": "npm run build:electron"
  },
  "build": {
    "appId": "com.insightllm.studio",
    "productName": "InsightLLM Studio",
    "directories": {
      "output": "dist_electron",
      "buildResources": "electron/assets"
    },
    "files": [
      "electron/main.js",
      "electron/preload.js",
      "electron/package.json",
      "!**/*.map",
      "!node_modules/.bin/**/*"
    ],
    "extraResources": [
      {
        "from": "backend/publish",
        "to": "backend/publish",
        "filter": ["**/*"]
      },
      {
        "from": "frontend/app/dist",
        "to": "frontend",
        "filter": ["**/*"]
      }
    ],
    "win": { "target": "nsis", "icon": "electron/assets/icon.ico" },
    "mac": {
      "target": "dmg",
      "icon": "electron/assets/icon.icns",
      "category": "public.app-category.utilities"
    },
    "linux": { "target": "AppImage", "icon": "electron/assets/icon.png", "category": "Utility" }
  },
  "devDependencies": {
    "electron": "^latest",
    "electron-builder": "^latest",
    "electron-reload": "^latest",
    "wait-on": "^latest",
    "cross-env": "^latest",
    "concurrently": "^latest"
  }
}
```

**Create `electron/package.json` (Minimal):**

```json
{
  "name": "insightllm-studio-electron",
  "version": "1.0.0",
  "main": "main.js"
}
```

### 5. Verify Folder Structure & Asset Paths

Ensure your `electron/assets/` folder contains `icon.ico`, `icon.icns`, and `icon.png` as referenced in the `electron-builder` configuration. The paths in `main.js` for loading the frontend (`frontend/index.html` inside `process.resourcesPath`) and starting the backend (`backend/publish/...` inside `process.resourcesPath`) depend on the `extraResources` configuration in `package.json` being correct.

### 6. Smoke-Test (Development and Production Simulation)

**Development:**

1.  Run `npm run start` (or `npm run dev`) from the project root.
    - Expect backend, frontend dev server (Vite on port 5173), and Electron to start.
    - Electron loads from `http://localhost:5173`. Backend is managed independently.

**Production Simulation (after building components):**

1.  Build frontend: `npm run build:web`
2.  Build/Publish backend: `npm run build:backend` (or platform specific like `npm run build:backend:win`)
3.  Run Electron to load local files: `cross-env NODE_ENV=production electron .` from project root.
    - Electron should attempt to start the packaged backend from `resources/backend/publish/` and load frontend from `resources/frontend/`.

### 7. Complete Task

Task 3.1 is complete when Electron is set up with `main.js`, `preload.js`, and root `package.json` configurations VERBATIM from (or accurately adapted from) project documentation, dependencies are installed, and initial smoke tests indicate Electron can load the frontend (dev URL and placeholder for packaged app) and manage the backend process in production mode.
