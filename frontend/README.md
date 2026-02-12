# MERN App Frontend

A modern React + TypeScript frontend for a full-stack MERN (MongoDB, Express, React, Node.js) blogging application with authentication and image uploads.

## Tech Stack

- **React 18** with TypeScript
- **Vite 7.3.1** for fast development
- **React Router v7** for routing
- **Materialize CSS** for UI components
- **Cloudinary** for image hosting

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx          # Display all posts
│   ├── Login.tsx         # User authentication
│   ├── SignUp.tsx        # User registration
│   ├── CreatePost.tsx    # Create new blog posts
│   └── Profile.tsx       # User profile
├── components/
│   └── NavBar.tsx        # Navigation component
├── App.tsx               # Main app component
└── main.tsx              # Entry point
```

## Setup & Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start development server:
   ```bash
   pnpm run dev
   ```

The app will be available at `http://localhost:5173`

## CORS Handling

Cross-Origin Resource Sharing (CORS) errors are handled through **Vite proxy configuration**. This allows the frontend (localhost:5173) to communicate with the backend (localhost:3000) during development without CORS issues.

### How It Works

The `vite.config.ts` file configures the dev server to proxy API requests:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://localhost:3000",
      "/posts": "http://localhost:3000",
      "/profile": "http://localhost:3000",
    },
  },
});
```

### Why This Approach?

- **Development**: Vite proxy forwards API calls to the backend server, avoiding CORS issues
- **Production**: The frontend and backend would be served from the same origin or have proper CORS headers configured
- **No CORS Headers Needed**: Since requests appear to come from the same origin during development, no Access-Control-Allow headers are required

### Example API Call

```typescript
// This automatically proxies to http://localhost:3000/posts
const response = await fetch("/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
```

## Cloudinary Image Upload

Images for blog posts are uploaded to Cloudinary, which provides secure cloud storage and optimized image delivery.

### Setup Steps

1. **Create Cloudinary Account**
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Navigate to your Dashboard to find your credentials

2. **Get Your Credentials**
   - **Cloud Name**: Unique identifier for your account
   - **Upload Preset**: Create an unsigned upload preset in Cloudinary settings

3. **Update CreatePost Component**

   In `src/pages/CreatePost.tsx`, update the Cloudinary configuration:

   ```typescript
   const uploadToCloudinary = async (file: File): Promise<string> => {
     const formData = new FormData();
     formData.append("file", file);
     formData.append("upload_preset", "your_upload_preset"); // Your preset name
     formData.append("cloud_name", "your_cloud_name"); // Your cloud name

     const response = await fetch(
       "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
       {
         method: "POST",
         body: formData,
       },
     );

     const data = await response.json();
     return data.secure_url; // Returns HTTPS image URL
   };
   ```

### Image Upload Flow

1. User selects an image file via `<input type="file">`
2. Image preview is displayed using FileReader API (base64 conversion)
3. On form submission:
   - File is uploaded to Cloudinary
   - Cloudinary returns a secure HTTPS URL
   - URL is sent to backend in the POST request
   - Backend stores the image URL in MongoDB
4. Image is now accessible from the Cloudinary CDN

### Example: CreatePost Component

```typescript
const [image, setImage] = useState<File | null>(null);
const [isUploading, setIsUploading] = useState(false);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setImage(file);
  }
};

const submitPost = async () => {
  setIsUploading(true);

  // Upload to Cloudinary and get URL
  const imageUrl = await uploadToCloudinary(image);

  // Send to backend with Cloudinary URL
  await fetch("/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, body, image: imageUrl }),
  });

  setIsUploading(false);
};
```

### Benefits of Cloudinary

- **No backend storage needed**: Images stored on Cloudinary's CDN
- **Optimized delivery**: Automatic image optimization and compression
- **Easy integration**: Simple file upload API
- **Secure URLs**: Returns HTTPS URLs by default
- **Free tier**: Generous free plan for development

## Authentication

- Sign up creates new user account
- Login returns JWT token and user data
- JWT is stored in `localStorage` as `jwt`
- User data is stored in `localStorage` as `user`
- All API requests include `Authorization: Bearer ${token}` header

## State Management: Context API & Reducer

This application uses React's **Context API** combined with the **useReducer** hook for global state management. This pattern provides a predictable way to manage user authentication state across the entire application.

### Architecture Overview

The state management is built on three key pieces:

1. **Context** (`src/context/userContext.ts`) - Creates a React context for sharing state
2. **Reducer** (`src/reducers/userReducer.ts`) - Defines how state transitions happen
3. **Provider** (`src/App.tsx`) - Wraps the app and provides state to all components

### How It Works: Step-by-Step

#### Step 1: Define the Context

The context is created in `src/context/userContext.ts`:

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

The reducer is defined in `src/reducers/userReducer.ts`:

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

In `src/App.tsx`, the context provider is set up:

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

**Example: Login Component** (`src/pages/Login.tsx`)

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

**Example: Navbar Component** (`src/components/NavBar.tsx`)

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

## Running the Full Stack

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3000`

**Terminal 2 - Frontend:**

```bash
cd frontend
pnpm run dev
```

Frontend runs on `http://localhost:5173`
