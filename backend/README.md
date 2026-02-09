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
