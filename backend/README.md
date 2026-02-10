# Prisma ORM Setup Guide

## Overview

This backend uses **Prisma ORM** as the database abstraction layer to interact with MongoDB. Prisma provides a type-safe database client that automatically generates TypeScript types based on your schema.

## Why Prisma ORM?

- **Type Safety**: Automatically generated TypeScript types for all database queries
- **Developer Experience**: Intuitive API with excellent IDE autocomplete
- **Database Agnostic**: Easy to switch between MongoDB and other databases
- **Schema Management**: Single source of truth for your data model
- **Migrations**: Built-in tooling for schema versioning

## Installation & Setup

### 1. Install Dependencies

```bash
pnpm add prisma @prisma/client@6.19
pnpm add dotenv
```

**Note**: We use Prisma v6.19 (not v7) because MongoDB support for Prisma v7 is still in development.

### 2. Initialize Prisma

```bash
npx prisma init --datasource-provider mongodb
```

This creates:

- `prisma/schema.prisma` - Your database schema
- `.env` - Environment variables
- `prisma.config.ts` - Prisma configuration

### 3. Configure Database Connection

Update `.env` with your MongoDB connection string:

```env
DATABASE_URL="mongodb+srv://nadun:XrtXsYWa7Lm8oS9R@cluster0.bzjd31q.mongodb.net/mydb?retryWrites=true&w=majority&appName=Cluster0"
```

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── migrations/            # Migration history (if using with SQL)
├── models/
│   └── user.ts                # User model helper
├── .env                       # Environment variables (not committed)
├── prisma.config.ts           # Prisma configuration
├── server.ts                  # Express server with Prisma client
└── package.json               # Dependencies
```

## Schema Definition

The Prisma schema is defined in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Key MongoDB Mapping Notes

- `@id @default(auto()) @map("_id") @db.ObjectId` - Maps to MongoDB's `_id` field (required for MongoDB)
- `@unique` - Creates a unique index in MongoDB
- `@default(now())` - Sets default value to current timestamp
- `@updatedAt` - Automatically updates on record modifications

## Authentication (JWT) & Password Encryption

This project implements a simple authentication flow using JWTs and securely stores user passwords with `bcrypt`.

Highlights:

- Sign up (`POST /auth/signup`) hashes the password with `bcrypt` and creates a user, returning a signed JWT token on success.
- Login (`POST /auth/login`) verifies credentials and returns a signed JWT token on success.
- On signup/login the server creates a token with payload `{ userId, email }`, signs it using the secret from `JWT_SECRET` (HS256 by default), and sets its lifetime from `JWT_EXPIRES_IN`.
- Protected routes use the `authenticateToken` middleware which verifies JWTs from the `Authorization: Bearer <token>` header and attaches the token payload to `request.user`.

Files to review / edit (backend):

- `routes/authentication.ts` — signup/login endpoints, `bcrypt` usage, token generation using `jsonwebtoken`.
- `middleware/auth.ts` — `authenticateToken` middleware for protecting routes.
- `server.ts` — example protected route `GET /profile` (uses `authenticateToken`).
- `.env` — add `JWT_SECRET` and `JWT_EXPIRES_IN` (example below).

Packages to install:

```bash
pnpm add bcrypt jsonwebtoken dotenv
pnpm add -D @types/bcrypt @types/jsonwebtoken
```

Example `.env` entries:

```env
JWT_SECRET=your-secret-key-change-this-in-production-to-something-secure
JWT_EXPIRES_IN=7d
```

Quick usage examples:

1. Sign up (returns JWT):

```http
POST /auth/signup
Content-Type: application/json

{ "name": "John", "email": "john@example.com", "password": "password123" }
```

Response (success):

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "John", "email": "john@example.com" }
}
```

2. Login (returns JWT):

```http
POST /auth/login
Content-Type: application/json

{ "email": "john@example.com", "password": "password123" }
```

3. Use token to access a protected route:

```http
GET /profile
Authorization: Bearer eyJhbGci...
```

Security notes:

- Use a strong, unique `JWT_SECRET` in production — never commit it to source control.
- Adjust `JWT_EXPIRES_IN` per your session requirements (e.g., `1h`, `7d`).

## Usage in Your Application

### Connect Prisma Client

In `server.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

app.listen(PORT, async () => {
  await prisma.$connect();
  console.log("Connected to MongoDB via Prisma");
  console.log(`Server is running on port ${PORT}`);
});
```

### Common Operations

#### Create a User

```typescript
const newUser = await prisma.user.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    password: "hashedPassword123",
  },
});
```

#### Find All Users

```typescript
const users = await prisma.user.findMany();
```

#### Find User by Email

```typescript
const user = await prisma.user.findUnique({
  where: { email: "john@example.com" },
});
```

#### Update a User

```typescript
const updated = await prisma.user.update({
  where: { id: "userId123" },
  data: { name: "Jane Doe" },
});
```

#### Delete a User

```typescript
await prisma.user.delete({
  where: { id: "userId123" },
});
```

#### Count Users

```typescript
const count = await prisma.user.count();
```

## Common Commands

### Generate Prisma Client

After modifying `prisma/schema.prisma`, regenerate the client:

```bash
npx prisma generate
```

### Open Prisma Studio

Visual interface to browse and manage your database:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

### Format Schema

```bash
npx prisma format
```

### Introspect Existing Database

If you have an existing MongoDB database:

```bash
npx prisma db pull
```

## ESM Configuration

This project uses ES modules (`"type": "module"` in `package.json`). When working with Prisma:

- Import with `.js` extension: `import { PrismaClient } from '@prisma/client';`
- Use `tsx` for development: `nodemon --exec tsx server.ts`

## MongoDB Requirements

### Replica Set

Prisma uses transactions internally for nested writes, which require MongoDB to have replication enabled. Make sure your MongoDB is configured with a replica set.

- **MongoDB Atlas**: Replica sets are configured automatically
- **Local MongoDB**: Follow [MongoDB's guide](https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set/) to set up a replica set

### Connection String Format

```
mongodb+srv://USERNAME:PASSWORD@HOST/DATABASE?retryWrites=true&w=majority&appName=ClusterName
```

## Troubleshooting

### "Expected 1 arguments, but got 0"

**Cause**: Using Prisma v7 (doesn't support MongoDB yet)

**Solution**: Downgrade to v6.19

```bash
pnpm add prisma@6.19 @prisma/client@6.19
```

### "Cannot find module '@prisma/client'"

**Cause**: PrismaClient not generated

**Solution**: Regenerate

```bash
npx prisma generate
```

### "Transactions are not supported by this deployment"

**Cause**: MongoDB doesn't have a replica set configured

**Solution**: Enable replica set on your MongoDB instance or use MongoDB Atlas

## Adding New Models

1. Add model to `prisma/schema.prisma`:

```prisma
model Post {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  content   String
  authorId  String   @db.ObjectId
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
}
```

2. Regenerate the client:

```bash
npx prisma generate
```

3. Use in your code with full type safety

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Connector Guide](https://www.prisma.io/docs/orm/overview/databases/mongodb)
- [Prisma Client Reference](https://www.prisma.io/docs/orm/reference/prisma-client-reference)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

# JWT Authentication

This project includes JWT-based authentication and password hashing with `bcrypt`.

Quick summary:

- Passwords are hashed with `bcrypt` before storage.
- `POST /auth/signup` and `POST /auth/login` return a signed JWT token on success.
- Protect routes with `authenticateToken` middleware that reads `Authorization: Bearer <token>`.

Relevant files:

- `routes/authentication.ts` — signup/login endpoints and token generation.
- `middleware/auth.ts` — token verification middleware.
- `server.ts` — example protected route: `GET /profile`.
- `.env` — set `JWT_SECRET` and `JWT_EXPIRES_IN`.

Install (already added to this project):

```bash
pnpm add bcrypt jsonwebtoken dotenv
pnpm add -D @types/bcrypt @types/jsonwebtoken
```

Example `.env`:

```env
JWT_SECRET=your-secret-key-change-this-in-production-to-something-secure
JWT_EXPIRES_IN=7d
```

Curl examples:

1. Sign up (returns JWT):

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

2. Login (returns JWT):

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

3. Access protected route with token:

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/profile
```

Security notes:

- Use a strong `JWT_SECRET` in production and never commit it.
- Adjust token lifetime (`JWT_EXPIRES_IN`) to suit your security model (e.g., `1h`, `7d`).

## Development — How JWT Works (step-by-step)

This short guide explains how JWT is used in this project and how to experiment locally.

1. Set environment variables
   - Ensure `.env` contains `JWT_SECRET` and `JWT_EXPIRES_IN`.

   ```env
   JWT_SECRET=your-secret-key-change-this-in-production-to-something-secure
   JWT_EXPIRES_IN=7d
   ```

2. Start the backend server

   ```bash
   cd backend
   pnpm dev
   ```

3. Create a user (signup) and capture the token

   ```bash
   curl -X POST http://localhost:3000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Dev","email":"dev@example.com","password":"secret"}'
   ```

   The response includes a `token` (JWT). Save it for testing.

4. Inspect the token
   - Quick: paste the token at https://jwt.io to inspect header/payload (do NOT paste production secrets).
   - Programmatic (Node/TS): create a small script to decode and verify:

   ```ts
   // scripts/inspect-token.ts
   import jwt from "jsonwebtoken";

   const token = "<PASTE_TOKEN_HERE>";
   console.log("Decoded (no verify):", jwt.decode(token, { complete: true }));

   try {
     const payload = jwt.verify(token, process.env.JWT_SECRET as string);
     console.log("Verified payload:", payload);
   } catch (err) {
     console.error("Token verification failed:", err);
   }
   ```

   Run with: `JWT_SECRET=your-secret pnpm tsx scripts/inspect-token.ts`

5. Test protected routes

   ```bash
   curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/profile
   ```

   The server's `authenticateToken` middleware will validate the token and attach `request.user`.

6. Test expiry and revocation
   - To test expiry, set `JWT_EXPIRES_IN=1s` in `.env`, restart, issue a token, wait, then call a protected route to confirm it fails.
   - For revocation, consider a server-side blacklist (DB/cache) or short-lived access tokens + refresh tokens.

7. Unit / integration testing tips
   - Use `supertest` with your Express app to test auth endpoints and protected routes.
   - Mock or provide a test `JWT_SECRET` and generate tokens in tests using `jsonwebtoken.sign()`.

8. Security reminders
   - Never expose `JWT_SECRET` in client code or public repos.
   - Prefer `httpOnly`, `Secure` cookies for tokens in browser clients to reduce XSS risk.
   - Consider implementing refresh tokens and token rotation for long-lived sessions.

This section should help you experiment with JWT locally and understand how the token flow ties into the codebase.

# API Documentation with Swagger/OpenAPI

This project includes **Swagger UI** for interactive API documentation and testing.

## Setup Steps

### 1. Install Dependencies

```bash
pnpm add swagger-ui-express swagger-jsdoc
pnpm add -D @types/swagger-ui-express @types/swagger-jsdoc
```

### 2. Create Swagger Configuration File

Create `swagger.ts` in the backend root with OpenAPI 3.0 spec definition:

```typescript
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MERN Blog API",
      version: "1.0.0",
      description: "API documentation for the MERN blog application",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
      },
      schemas: {
        // Define reusable schemas here
        User: {
          /* ... */
        },
        Post: {
          /* ... */
        },
        Error: {
          /* ... */
        },
      },
    },
  },
  apis: ["./routes/*.ts"],
};

export const specs = swaggerJsdoc(options);
```

### 3. Integrate Swagger UI in Server

Update `server.ts`:

```typescript
import swaggerUi from "swagger-ui-express";
import { specs } from "./swagger.js";

// ... other imports and setup

app.use(express.json());

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { swaggerOptions: { persistAuthorization: true } }),
);

app.use("/auth", authRouter);
app.use("/posts", postsRouter);
```

### 4. Access Swagger UI

Start your development server:

```bash
pnpm dev
```

Visit: **`http://localhost:3000/api-docs`**

You'll see an interactive interface where you can:

- Browse all API endpoints
- View request/response schemas
- Test endpoints directly from the UI
- Authorize with JWT tokens for protected routes

## Adding New Routes with Swagger Documentation

When adding a new route, follow these steps to ensure it appears properly in Swagger:

### Step 1: Add JSDoc Comments Above Your Route

Place JSDoc comments using `@swagger` tags directly above the route handler:

```typescript
/**
 * @swagger
 * /your-endpoint:
 *   get:
 *     summary: Brief description of what this does
 *     tags:
 *       - YourFeature
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 */
router.get("/your-endpoint", async (request: Request, response: Response) => {
  // route logic
});
```

### Step 2: Document Request Bodies (for POST/PUT/PATCH)

```typescript
/**
 * @swagger
 * /your-endpoint:
 *   post:
 *     summary: Create something
 *     tags:
 *       - YourFeature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *               - field2
 *             properties:
 *               field1:
 *                 type: string
 *                 description: Description of field1
 *               field2:
 *                 type: number
 *                 description: Description of field2
 *     responses:
 *       201:
 *         description: Created successfully
 */
router.post("/your-endpoint", async (request: Request, response: Response) => {
  // route logic
});
```

### Step 3: Document Protected Routes with Security

For routes requiring authentication, add the `security` field:

```typescript
/**
 * @swagger
 * /protected-endpoint:
 *   post:
 *     summary: Protected endpoint
 *     tags:
 *       - YourFeature
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       201:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/protected-endpoint",
  authenticateToken,
  async (request: Request, response: Response) => {
    // route logic
  },
);
```

### Step 4: Use Schema References

For consistency, reference schemas defined in `swagger.ts` using `$ref`:

```typescript
/**
 * @swagger
 * /items:
 *   get:
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get("/items", async (request: Request, response: Response) => {
  // route logic
});
```

### Step 5: Document Path Parameters

For routes with parameters like `/:id`:

```typescript
/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags:
 *       - Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", async (request: Request, response: Response) => {
  // route logic
});
```

### Step 6: Document All HTTP Methods

Document each HTTP method (GET, POST, PUT, DELETE, PATCH) it supports:

```typescript
/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update item
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete item
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  authenticateToken,
  async (request: Request, response: Response) => {
    // update logic
  },
);

router.delete(
  "/:id",
  authenticateToken,
  async (request: Request, response: Response) => {
    // delete logic
  },
);
```

### Step 7: Test in Swagger UI

After adding documentation:

1. Save the route file
2. The Swagger UI automatically picks up changes (no restart needed)
3. Refresh your browser at `http://localhost:3000/api-docs`
4. Your new endpoint will appear in the list

## Common Response Status Codes to Document

```typescript
responses:
  200:  // GET, PUT, DELETE success
    description: Success
  201:  // POST success (created)
    description: Created successfully
  400:  // Bad request
    description: Invalid input data
  401:  // Unauthorized
    description: Authentication required or failed
  403:  // Forbidden
    description: Authorized but not allowed
  404:  // Not found
    description: Resource not found
  500:  // Server error
    description: Internal server error
```

## Project Files Structure

```
backend/
├── swagger.ts                 # Swagger/OpenAPI configuration
├── routes/
│   ├── authentication.ts      # Auth endpoints with @swagger docs
│   ├── posts.ts               # Posts endpoints with @swagger docs
├── server.ts                  # Express setup with Swagger UI middleware
└── README.md                  # This file
```

## Tips for Better Documentation

- **Be Descriptive**: Use clear summaries and descriptions
- **Use Tags**: Organize endpoints by feature (Authentication, Posts, Users, etc.)
- **Define Schemas**: Create reusable schemas in `swagger.ts` to avoid duplication
- **Test Everything**: Use the Swagger UI to test your endpoints before pushing to production
- **Keep it Updated**: Update docs when you modify endpoints or add new fields
- **Use Examples**: Include example requests/responses in descriptions where helpful

## Resources

- [Swagger/OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express Documentation](https://github.com/scottie1984/swagger-ui-express)
