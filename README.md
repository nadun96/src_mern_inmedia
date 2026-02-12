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

---

## State Management: Context API & Reducer

This application uses React's **Context API** combined with the **useReducer** hook for global state management. This pattern provides a predictable way to manage user authentication state across the entire application.

### Architecture Overview

The state management is built on three key pieces:

1. **Context** (`src/context/userContext.ts`) - Creates a React context for sharing state
2. **Reducer** (`src/reducers/userReducer.ts`) - Defines how state transitions happen
3. **Provider** (`src/App.tsx`) - Wraps the app and provides state to all components

### How It Works: Step-by-Step

#### Step 1: Define the Context

The context is created in [src/context/userContext.ts](frontend/src/context/userContext.ts):

```typescript
import { createContext } from "react";

export const UserContext = createContext<{
  state: any;
  dispatch: React.Dispatch<any>;
}>({
  state: null,
  dispatch: () => null,
});
```

**What this does:**

- Creates a context object with TypeScript types
- Defines the shape: `{ state, dispatch }`
- `state` holds the current user data (or `null` if not logged in)
- `dispatch` is a function to trigger state updates
- Default values are provided but will be overridden by the Provider

#### Step 2: Define the Reducer

The reducer is defined in [src/reducers/userReducer.ts](frontend/src/reducers/userReducer.ts):

```typescript
export const initialState: any = null;

export const reducer = (state: any, action: any) => {
  if (action.type == "USER") {
    return action.payload;
  }
  if (action.type == "LOGOUT") {
    return null;
  }
  if (action.type == "UPDATE") {
    return {
      ...state,
      following: action.payload.following,
      followers: action.payload.followers,
    };
  }
  return state;
};
```

**What this does:**

- `initialState`: Starting state is `null` (no user logged in)
- `reducer`: A pure function that takes current `state` and an `action`, returns new state
- **Actions:**
  - `USER`: Sets the user data (used on login)
  - `LOGOUT`: Clears user data (sets to `null`)
  - `UPDATE`: Merges new following/followers data into existing state

**Reducer Pattern:**

```
(currentState, action) => newState
```

#### Step 3: Setup the Provider

In [src/App.tsx](frontend/src/App.tsx), the context provider is set up:

```typescript
import { useReducer, useEffect } from "react";
import { UserContext } from "./context/userContext";
import { reducer, initialState } from "./reducers/userReducer";

function App() {
  // Create state and dispatch function using useReducer
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore user from localStorage on app load
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      dispatch({ type: "USER", payload: JSON.parse(user) });
    }
  }, []);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <BrowserRouter>
        <Navbar />
        <CustomRouteConfig />
      </BrowserRouter>
    </UserContext.Provider>
  );
}
```

**What this does:**

- `useReducer(reducer, initialState)` creates:
  - `state`: Current state value
  - `dispatch`: Function to send actions to the reducer
- `useEffect` runs once on mount, checks localStorage for saved user data
- If user exists in localStorage, dispatches `USER` action to restore login state
- `UserContext.Provider` wraps the entire app, making `{ state, dispatch }` available everywhere

#### Step 4: Consuming the Context

Components access the context using `useContext`:

**Example: Login Component** ([src/pages/Login.tsx](frontend/src/pages/Login.tsx))

```typescript
import { useContext } from "react";
import { UserContext } from "../context/userContext";

const Login = () => {
  const { state, dispatch } = useContext(UserContext);

  const login = () => {
    fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("jwt", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Update global state
        dispatch({ type: "USER", payload: data.user });
        navigate("/");
      });
  };
};
```

**What this does:**

- `useContext(UserContext)` extracts `state` and `dispatch`
- On successful login, saves to localStorage
- Calls `dispatch({ type: "USER", payload: data.user })` to update global state
- All components listening to `UserContext` will re-render with new user data

**Example: Navbar Component** ([src/components/NavBar.tsx](frontend/src/components/NavBar.tsx))

```typescript
const Navbar = () => {
  const { state, dispatch } = useContext(UserContext);

  const renderList = () => {
    if (state) {
      // User is logged in - show Profile, Create Post, Logout
      return [
        <li key="profile"><Link to="/profile">Profile</Link></li>,
        <li key="logout">
          <button onClick={() => {
            localStorage.clear();
            dispatch({ type: "LOGOUT" });
            navigate("/login");
          }}>
            Logout
          </button>
        </li>
      ];
    } else {
      // User not logged in - show Login, SignUp
      return [
        <li key="login"><Link to="/login">Log In</Link></li>,
        <li key="signup"><Link to="/signup">Sign Up</Link></li>
      ];
    }
  };

  return <nav>{renderList()}</nav>;
};
```

**What this does:**

- Reads `state` to check if user is logged in
- Conditionally renders different navigation items based on auth state
- On logout, clears localStorage and dispatches `LOGOUT` action
- Navbar automatically updates when state changes

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ useReducer(reducer, initialState)                 │  │
│  │   ↓                                               │  │
│  │ [state, dispatch]                                 │  │
│  └───────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │ <UserContext.Provider value={{state, dispatch}}>  │  │
│  │   └─ All child components                         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌───────────────┐                   ┌──────────────┐
│  Login.tsx    │                   │  Navbar.tsx  │
├───────────────┤                   ├──────────────┤
│ useContext()  │                   │ useContext() │
│   ↓           │                   │   ↓          │
│ {state,       │                   │ {state,      │
│  dispatch}    │                   │  dispatch}   │
│   ↓           │                   │   ↓          │
│ dispatch({    │                   │ if (state)   │
│  type:"USER", │                   │   show menu  │
│  payload:user │                   │ else         │
│ })            │                   │   show login │
└───────────────┘                   └──────────────┘
        ↓
┌─────────────────────────────────┐
│     userReducer.ts              │
├─────────────────────────────────┤
│ reducer(state, action)          │
│   if action.type == "USER"      │
│     return action.payload       │
│   if action.type == "LOGOUT"    │
│     return null                 │
└─────────────────────────────────┘
        ↓
  New state updates all
  subscribed components
```

### Key Benefits

1. **Single Source of Truth**: User state lives in one place, preventing inconsistencies
2. **Predictable Updates**: All state changes go through the reducer with explicit action types
3. **Easy Debugging**: Action types make it clear what caused each state change
4. **Persistent Sessions**: localStorage integration survives page refreshes
5. **Automatic UI Updates**: Components re-render automatically when state changes

### Common Patterns

**Dispatch an action:**

```typescript
dispatch({ type: "USER", payload: userData });
```

**Read current state:**

```typescript
const { state } = useContext(UserContext);
if (state) {
  // User is logged in
  console.log(state.fullName);
}
```

**Logout pattern:**

```typescript
localStorage.clear();
dispatch({ type: "LOGOUT" });
```

This architecture provides a solid foundation for managing authentication state in a React application without requiring external libraries like Redux.
