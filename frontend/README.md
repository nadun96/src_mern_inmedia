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
