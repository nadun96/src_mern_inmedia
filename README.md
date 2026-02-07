# MERN App

A full-stack web application built with the **MERN** stack (MongoDB, Express, React, Node.js), fully written in **TypeScript**.

## Project Structure

```
mern-app/
├── backend/          # Express + Node.js API server
│   ├── server.ts     # Entry point
│   ├── tsconfig.json
│   └── package.json
└── frontend/         # React + Vite SPA
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── vite-env.d.ts
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    └── package.json
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/)

### Backend

```bash
cd backend
pnpm install
pnpm run dev      # Start dev server with nodemon + ts-node
pnpm run build    # Compile TypeScript to dist/
pnpm start        # Run compiled output
```

The Express server runs on **http://localhost:3000**.

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev      # Start Vite dev server
pnpm run build    # Type-check and build for production
pnpm run preview  # Preview production build
pnpm run lint     # Run ESLint
```

## Tech Stack

| Layer           | Technology                     |
| --------------- | ------------------------------ |
| Frontend        | React 19, Vite 7, TypeScript   |
| Backend         | Express 5, Node.js, TypeScript |
| Language        | TypeScript 5.9                 |
| Package Manager | pnpm                           |

---

## JavaScript → TypeScript Conversion

This project was originally written in JavaScript and later converted to TypeScript. Below is a summary of every change made during the migration.

### Backend Conversion

#### 1. Renamed `server.js` → `server.ts`

The `require`/CommonJS syntax was replaced with ES module imports, and type annotations were added:

```diff
- const express = require('express');
- const app = express();
- const PORT = 3000;
-
- app.get('/',
-     (request, response) => {
+ import express from 'express';
+ import type { Request, Response } from 'express';
+
+ const app: express.Express = express();
+ const PORT: number = 3000;
+
+ app.get('/',
+     (request: Request, response: Response) => {
```

> **Note:** `Request` and `Response` are imported with `import type` so Node.js's native type stripping handles them correctly (they are type-only, not runtime values).

#### 2. Updated `package.json`

- Added `"type": "module"` to enable ES module syntax.
- Changed `"main"` from `index.js` to `dist/server.js`.
- Added scripts: `build` (tsc), `start` (node), and `dev` (nodemon + ts-node).

#### 3. Reconfigured `tsconfig.json`

- Set `module` and `moduleResolution` to `NodeNext` for ESM compatibility.
- Enabled `strict` mode.
- Added `"types": ["node"]` and `verbatimModuleSyntax`.
- Configured `outDir: "./dist"` for compiled output.

#### 4. Installed dev dependencies

```bash
pnpm add -D @types/express ts-node typescript @types/node
```

---

### Frontend Conversion

#### 1. Renamed source files

| Before           | After            |
| ---------------- | ---------------- |
| `src/App.jsx`    | `src/App.tsx`    |
| `src/main.jsx`   | `src/main.tsx`   |
| `vite.config.js` | `vite.config.ts` |

#### 2. Updated `main.tsx`

Added a non-null assertion on `getElementById` since TypeScript requires it:

```diff
- createRoot(document.getElementById('root')).render(
+ createRoot(document.getElementById('root')!).render(
```

Changed the App import to reference the `.tsx` extension:

```diff
- import App from './App.jsx'
+ import App from './App.tsx'
```

#### 3. Added TypeScript configuration files

- **`tsconfig.json`** — base config for the project (strict mode, `react-jsx`, bundler resolution, `noEmit`).
- **`tsconfig.app.json`** — extends `tsconfig.json`, scoped to `src/`.
- **`tsconfig.node.json`** — separate config for `vite.config.ts`.

#### 4. Added `src/vite-env.d.ts`

```ts
/// <reference types="vite/client" />
```

This gives TypeScript access to Vite-specific type definitions (e.g., `import.meta.env`).

#### 5. Updated `index.html`

Changed the script entry point:

```diff
- <script type="module" src="/src/main.jsx"></script>
+ <script type="module" src="/src/main.tsx"></script>
```

#### 6. Updated `eslint.config.js`

Extended file matching to include TypeScript files:

```diff
- files: ['**/*.{js,jsx}'],
+ files: ['**/*.{js,jsx,ts,tsx}'],
```

Added `@typescript-eslint` parser and plugin for TS-aware linting.

#### 7. Updated `package.json`

- Build script changed to `tsc --noEmit && vite build` to type-check before building.
- Added TypeScript-related dev dependencies.

#### 8. Installed dev dependencies

```bash
pnpm add -D typescript @types/react @types/react-dom @typescript-eslint/parser @typescript-eslint/eslint-plugin typescript-eslint
```
