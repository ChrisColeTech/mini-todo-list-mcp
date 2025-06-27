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

# Task 3.0: Create Frontend Project - Part 3

Create or update the files below.

### 5. (Do not use terminal to populate files) Write the code for Core `app\src` Files with Content

**`frontend/app/src/lib/utils.tsx`:**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// cn utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Other general utilities can be added here
```

**`frontend/app/src/utils/iconUtils.tsx`:**

```typescript
import React from 'react'

export const createIconElement = (
  IconComponent: React.ElementType,
  size: number,
  className?: string,
) => {
  return <IconComponent size={size} className={className} />
}

// Example: Get specific icon size based on context and global setting
export const getIconSizeForContext = (
  context: 'sidebar' | 'tab' | 'page',
  iconSizeSetting: 'small' | 'medium' | 'large',
): number => {
  const baseSizes = { sidebar: 16, tab: 12, page: 20 }
  const scaleFactors = { small: 0.9, medium: 1, large: 1.15 }
  return Math.round(baseSizes[context] * scaleFactors[iconSizeSetting])
}
```

**`frontend/app/src/utils/utils.tsx`:**

```typescript
export function formatTitle(title: string): string {
  return title.charAt(0).toUpperCase() + title.slice(1)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getStorageKey(key: string): string {
  return `insightllm-studio-${key}`
}

export function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (jsonString === null) return fallback
  try {
    return JSON.parse(jsonString) || fallback
  } catch {
    return fallback
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
```

# Type Documentation: ElectronAPI

**Location**: `frontend/app/src/types/electron-api.d.tsx`

### Interface Definition:

```typescript
export interface ElectronAPI {
  storage: {
    saveSettings: (settings: Record<string, unknown>) => Promise<void>
    loadSettings: () => Promise<Record<string, unknown> | null>
  }
  file: {
    openFile: () => Promise<{ path: string; content: string } | null>
    saveFile: (path: string, content: string) => Promise<boolean>
    saveFileAs: (content: string) => Promise<{ path: string; success: boolean } | null>
  }
  fileQueue: {
    saveFileQueue: (queue: any[]) => Promise<void>
    loadFileQueue: () => Promise<any[] | null>
    exportFileQueue: (queue: any[]) => Promise<string | null>
    importFileQueue: () => Promise<any[] | null>
  }
  window: {
    minimize: () => void
    maximize: () => void // Should toggle maximize/unmaximize
    unmaximize: () => void // Specific unmaximize
    close: () => void
    isMaximized: () => boolean // Changed to Promise in service
  }
  dialog: {
    showSaveDialog: (defaultPath?: string) => Promise<string | null>
    showOpenDialog: () => Promise<string[] | null> // Assuming can return multiple paths
    showMessageBox: (message: string, type?: 'info' | 'warning' | 'error') => Promise<void> // 'type' is optional
  }
  app: {
    getVersion: () => string
    getPath: () => string // e.g., app path, userData path
  }
  dev: {
    openDevTools: () => void
    reload: () => void
  }
  // Added based on preload.js for API process control
  startApiProcess: () => Promise<boolean>
  stopApiProcess: () => Promise<boolean>
  restartApiProcess: () => Promise<boolean>
  getApiStatus: () => Promise<{ isRunning: boolean; pid: number | null }>
  // Added based on preload.js for window state changes
  onWindowStateChange: (callback: (state: { isMaximized: boolean }) => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
```

---

# Type Documentation: navigation.ts

**Location**: `frontend/app/src/types/navigation.tsx`

### Interfaces:

#### NavigationConfig

```typescript
import type { ElementType } from 'react'

// Configuration interface (what pages export)
export interface NavigationConfig {
  id: string
  label: string
  iconComponent?: ElementType // Use ElementType directly
  showInSidebar: boolean
  defaultVisible?: boolean // Whether this item should be visible by default (overrides showInSidebar for initial state)
  order?: number
  position?: 'left' | 'right'
  group?: string
  closable?: boolean
}

export interface NavigationItem extends NavigationConfig {
  page: React.ComponentType<unknown>
  panel?: React.ComponentType<unknown>
}
```

---

# Type Documentation: Tab

**Location**: `frontend/app/src/types/tab.tsx`

### Interface Definition:

```typescript
import * as React from 'react'

export interface Tab {
  id: string
  title: string
  icon?: React.ReactNode
  isActive: boolean
  closable?: boolean // Added based on useTabs implementation
}
```

## Then call attempt completion
