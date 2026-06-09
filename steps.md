# Real-Time Chat Application - Learning-First Implementation Guide

This guide is for building a real-time one-to-one and group chat application using Node.js, Express, MongoDB, Socket.IO, and React.

The purpose of this document is not only to tell you what command to run. The purpose is to help you understand why each file exists, why each dependency is installed, why each layer is created, and how to verify that every milestone works before moving forward.

We will follow this rhythm:

```txt
Learn -> Build -> Verify -> Move Forward
```

The backend will use a feature-based architecture:

```txt
route -> validation -> controller -> service -> repository -> model
```

Important rule:

Do not build the database, sockets, authentication, or frontend before proving that the basic server works.

---

## Final Project Goal

We are building a real-time communication system with:

- User registration and login
- JWT authentication
- User data stored in MongoDB
- One-to-one chat
- Group chat
- Real-time message delivery using Socket.IO
- Message history stored in the database
- Message timestamps
- Group details and member list
- User connection and disconnection handling
- Optional features: typing indicator, read/unread status, last seen, file/image sharing, message deletion, notifications

---

## Import Strategy: CommonJS vs ES Modules

Node.js supports two major module systems.

### CommonJS

CommonJS uses:

```js
const express = require("express");
module.exports = app;
```

This is older and still common in many Node.js projects.

### ES Modules

ES Modules use:

```js
import express from "express";
export default app;
```

This project will use ES Modules.

### Why We Use `import` Instead Of `require`

We will use `import/export` because:

- It matches modern JavaScript.
- It is consistent with React frontend code.
- It makes named exports easier to read.
- It is widely supported in modern Node.js when `"type": "module"` is added to `package.json`.

### Important Rule

Do not mix `require()` and `import` in this project.

If we choose ES Modules, every backend file should use:

```js
import something from "package";
export default something;
export { namedValue };
```

To enable this, add this to `backend/package.json`:

```json
{
  "type": "module"
}
```

### Common Mistake

Wrong:

```js
import express from "express";
module.exports = app;
```

Correct:

```js
import express from "express";
export default app;
```

---

## Dependency Planning

Install command:

```bash
npm install express mongoose socket.io cors dotenv jsonwebtoken bcrypt zod express-validator pino pino-pretty morgan
npm install -D nodemon
```

### Runtime Dependencies

| Package | Why We Need It | Problem It Solves | What Happens Without It |
| --- | --- | --- | --- |
| `express` | Creates the HTTP API server | Handles routes like `/health`, `/api/auth/login` | You would need to manually build HTTP routing |
| `mongoose` | Connects Node.js to MongoDB using models | Provides schemas, validation, and query helpers | Database code becomes repetitive and error-prone |
| `socket.io` | Enables real-time communication | Sends messages instantly without page refresh | Chat would need polling or manual refresh |
| `cors` | Allows frontend and backend to communicate | Lets React call Express from a different origin | Browser blocks API calls due to CORS policy |
| `dotenv` | Loads environment variables from `.env` | Keeps secrets/config outside source code | Secrets may be hardcoded and accidentally committed |
| `jsonwebtoken` | Creates and verifies JWT tokens | Authenticates protected API requests | Users cannot stay logged in securely |
| `bcrypt` | Hashes passwords | Protects passwords before database storage | Plain-text passwords become a major security risk |
| `zod` | Validates request data using schemas | Prevents bad input from reaching business logic | Invalid data may break controllers/services |
| `express-validator` | Alternative validation style for Express | Good for learning route-level validation | You miss exposure to common Express validation patterns |
| `pino` | Application logger | Logs application events in a structured way | Debugging relies on scattered `console.log` |
| `pino-pretty` | Pretty logs in development | Makes Pino logs readable while coding | Logs are harder to read locally |
| `morgan` | HTTP request logger | Shows method, URL, status, response time | You cannot quickly see API traffic |

### Development Dependency

| Package | Why We Need It | Problem It Solves | What Happens Without It |
| --- | --- | --- | --- |
| `nodemon` | Restarts server automatically during development | Saves time after every code change | You manually stop/start the server after edits |

### Senior Developer Notes

- Install only packages you understand.
- Every dependency increases maintenance and security responsibility.
- `zod` and `express-validator` both validate input, but we keep both here for learning. In production, choose one primary validation strategy.
- Use `pino` for application logs and `morgan` for HTTP request logs. They solve different logging problems.

---

## Architecture Overview

We will use feature-based architecture because it scales better than putting all controllers, routes, and models in separate global folders.

### Planned Backend Structure

```txt
backend/
  src/
    app.js
    server.js

    config/
      env.js
      db.js

    middlewares/
      error.middleware.js
      notFound.middleware.js
      validate.middleware.js
      expressValidator.middleware.js

    utils/
      logger.js
      ApiError.js
      ApiResponse.js
      asyncHandler.js
      jwt.js

    routes/
      index.js

    features/
      auth/
        auth.routes.js
        auth.validation.js
        auth.controller.js
        auth.service.js
        auth.repository.js

      users/
        user.model.js
        user.routes.js
        user.controller.js
        user.service.js
        user.repository.js

      conversations/
        conversation.model.js
        conversation.routes.js
        conversation.controller.js
        conversation.service.js
        conversation.repository.js

      messages/
        message.model.js
        message.routes.js
        message.controller.js
        message.service.js
        message.repository.js

    sockets/
      index.js
      socket.auth.js
      chat.socket.js

  .env
  .env.example
  package.json
```

### Layer Responsibilities

#### Routes

Routes define API endpoints.

Belongs here:

- URL paths
- HTTP methods
- Route-level middleware
- Validation middleware
- Controller function connection

Never put here:

- Database queries
- Business rules
- Password hashing
- Token generation

Example:

```js
router.post("/register", validate(registerSchema), registerController);
```

#### Controllers

Controllers handle request and response.

Belongs here:

- Reading `req.body`, `req.params`, `req.query`
- Calling services
- Sending response

Never put here:

- Complex business logic
- Mongoose queries
- Password hashing details

#### Services

Services contain business logic.

Belongs here:

- Register user flow
- Login user flow
- Create conversation rules
- Send message rules

Never put here:

- Express `req` and `res`
- Raw route definitions

#### Repositories

Repositories talk to the database.

Belongs here:

- `User.findOne(...)`
- `Message.create(...)`
- `Conversation.findById(...)`

Never put here:

- HTTP status codes
- Express response logic
- Socket.IO event emitting

#### Models

Models define database schemas.

Belongs here:

- MongoDB fields
- Field types
- Indexes
- Timestamps
- Basic schema-level constraints

Never put here:

- Route logic
- Controller logic
- Large business workflows

#### Middlewares

Middlewares run before or after controllers.

Belongs here:

- Authentication check
- Validation handling
- Error handling
- Not-found handling

Never put here:

- Full feature business logic

#### Utils

Utils are reusable helpers.

Belongs here:

- Logger
- JWT helpers
- API response helper
- Async handler

Never put here:

- Feature-specific business logic

#### Sockets

Sockets handle real-time events.

Belongs here:

- `connection`
- `disconnect`
- `join_conversation`
- `send_message`
- `typing_start`

Never put here:

- Large database workflows directly
- Password/auth business logic

### Senior Developer Notes

- Architecture is not about creating many files. It is about clear responsibility.
- If a file becomes hard to explain in one sentence, it probably has too many responsibilities.
- Keep the first version simple, but place code in the correct layer from the beginning.

---

# Milestone 1: Project Setup, Package File, and Working Express Server

## Goal

Create the backend project, install dependencies, enable ES Modules, create a basic Express server, and verify that `GET /health` works.

## Why Are We Doing This?

Before adding database, authentication, validation, logging, or sockets, we need proof that the server can start and respond to a request.

This gives us the first working outcome.

## Why Now?

Everything else depends on the server. If the server is broken, database and auth debugging becomes confusing.

## Files Created/Updated

```txt
backend/
  package.json
  src/
    app.js
    server.js
```

## Commands

From the project root:

```bash
mkdir backend
cd backend
npm init -y
npm install express mongoose socket.io cors dotenv jsonwebtoken bcrypt zod express-validator pino pino-pretty morgan
npm install -D nodemon
```

## Update `backend/package.json`

```json
{
  "name": "chat-application-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

## Code: `backend/src/app.js`

```js
import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

export default app;
```

## Code: `backend/src/server.js`

```js
import app from "./app.js";

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Code Explanation

### `express`

Creates an Express application.

```js
const app = express();
```

This `app` will hold all middleware and routes.

### `express.json()`

Allows Express to read JSON request bodies.

Without this, `req.body` will be `undefined` for JSON requests.

### `/health`

This route is intentionally simple. It tells us whether the server is alive.

### `app.listen`

Starts the HTTP server on port `5000`.

## Expected Output

When you run:

```bash
npm run dev
```

You should see:

```txt
Server running on port 5000
```

When you open:

```txt
http://localhost:5000/health
```

You should see:

```json
{
  "success": true,
  "message": "Server is healthy"
}
```

## Verification

Use browser, Postman, Thunder Client, or curl:

```bash
curl http://localhost:5000/health
```

## Common Errors

### Error: `Cannot use import statement outside a module`

Cause:

`"type": "module"` is missing from `package.json`.

Fix:

Add:

```json
{
  "type": "module"
}
```

### Error: `Cannot find module './app'`

Cause:

In ES Modules, local imports need file extensions.

Fix:

Use:

```js
import app from "./app.js";
```

not:

```js
import app from "./app";
```

### Error: Port already in use

Cause:

Another server is already running on port `5000`.

Fix:

Stop the old process or temporarily use another port.

## Senior Developer Notes

- A health endpoint is useful in development, deployment, and monitoring.
- Keep the first milestone intentionally small.
- Do not connect MongoDB yet. First prove the server starts.

## After Completing This Chunk You Should Be Able To

- Start the backend server
- Access `/health`
- Understand the Express bootstrap process
- Understand why ES Modules require `"type": "module"`

## Next Chunk Preview

Now that the server works with a hardcoded port, we will move configuration into environment variables.

---

# Milestone 2: Environment Variables, `.env`, `.env.example`, and Env Validation

## Goal

Move configuration out of source code and into environment variables.

## Why Are We Doing This?

Applications behave differently in development, testing, staging, and production.

Examples:

- Development may use local MongoDB.
- Testing may use a test database.
- Staging may use a cloud database.
- Production uses real secrets and real services.

Hardcoding these values in code makes the app unsafe and difficult to deploy.

## Why Now?

Before adding database and authentication, we need a reliable way to load config like `PORT`, `MONGODB_URI`, and `JWT_SECRET`.

## Files Created/Updated

```txt
backend/
  .env
  .env.example
  src/
    config/
      env.js
    server.js
```

## Code: `backend/.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/realtime_chat
JWT_SECRET=change_this_secret_in_real_project
JWT_EXPIRES_IN=7d
```

## Code: `backend/.env.example`

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/realtime_chat
JWT_SECRET=replace_with_your_secret
JWT_EXPIRES_IN=7d
```

## Why `.env` Exists

`.env` stores local configuration and secrets.

Examples:

- Database URI
- JWT secret
- API keys
- Port number
- Frontend URL

## Why `.env.example` Exists

`.env.example` documents which environment variables the project needs.

It should be committed to GitHub.

It should not contain real secrets.

New developers can copy it:

```bash
cp .env.example .env
```

Then they can fill in their own values.

## Why Secrets Must Not Be Committed

If secrets are pushed to GitHub:

- Anyone with repo access may use them.
- Production systems may be compromised.
- You may need to rotate credentials.

Your `.gitignore` should include:

```gitignore
.env
.env.*
!.env.example
```

This means:

- Ignore real environment files.
- Keep `.env.example` publishable.

## Values That Change Between Environments

| Environment | Example Difference |
| --- | --- |
| Development | Local database, readable logs, local frontend URL |
| Testing | Test database, fake secrets, test-specific config |
| Staging | Production-like database, staging frontend URL |
| Production | Real database, real secrets, stricter logs |

## Code: `backend/src/config/env.js`

```js
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z
    .enum(["development", "test", "staging", "production"])
    .default("development"),
  CLIENT_URL: z.string().url(),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
```

## Update: `backend/src/server.js`

```js
import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
```

## Code Explanation

### `dotenv.config()`

Loads variables from `.env` into `process.env`.

### `z.object(...)`

Defines the expected shape of the environment configuration.

### `z.coerce.number()`

Environment variables are loaded as strings. This converts `PORT` from `"5000"` to `5000`.

### `safeParse`

Validates without throwing immediately. We can show a clear error and exit.

### `process.exit(1)`

Stops the app if required configuration is invalid.

This is good because a misconfigured app should fail early.

## Expected Output

When `.env` is valid:

```txt
Server running on port 5000
```

When `.env` is invalid:

```txt
Invalid environment configuration
```

## Verification

Run:

```bash
npm run dev
```

Open:

```txt
http://localhost:5000/health
```

Then test validation by temporarily removing `JWT_SECRET` or making `CLIENT_URL` invalid.

## Common Errors

### Error: `CLIENT_URL Invalid url`

Cause:

You wrote:

```env
CLIENT_URL=localhost:5173
```

Fix:

Use full URL:

```env
CLIENT_URL=http://localhost:5173
```

### Error: `.env` not loading

Cause:

`.env` is in the wrong folder.

Fix:

For this guide, keep it inside:

```txt
backend/.env
```

and run commands from:

```txt
backend/
```

### Error: Secret too short

Cause:

`JWT_SECRET` is shorter than 10 characters.

Fix:

Use a longer value.

## Senior Developer Notes

- Validate environment variables at startup.
- Never let the app run with missing production secrets.
- `.env.example` is part of documentation.
- In production, secrets usually come from hosting platform environment settings, not from a physical `.env` file.

## After Completing This Chunk You Should Be Able To

- Understand why `.env` exists
- Understand why `.env.example` exists
- Load configuration safely
- Validate environment variables with Zod
- Avoid committing secrets

## Next Chunk Preview

Now that config loads safely, we will add logging.

---

# Milestone 3: Application Logging With Pino and HTTP Logging With Morgan

## Goal

Add structured application logs and HTTP request logs.

## Why Are We Doing This?

Logs help us understand what the application is doing.

There are two types of logs we need:

- Application logs: "Server started", "Database connected", "User registered"
- HTTP request logs: `GET /health 200 5ms`

## Why Now?

Before adding database and auth, we need observability. When something fails, logs help us debug faster.

## Files Created/Updated

```txt
backend/src/
  utils/
    logger.js
  app.js
  server.js
```

## Code: `backend/src/utils/logger.js`

```js
import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
});
```

## Update: `backend/src/app.js`

```js
import express from "express";
import morgan from "morgan";
import { logger } from "./utils/logger.js";

const app = express();

app.use(express.json());

app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

export default app;
```

## Update: `backend/src/server.js`

```js
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});
```

## Code Explanation

### `pino`

Pino is used for app-level logs.

Example:

```js
logger.info("Server started");
logger.error(error, "Database failed");
```

### `pino-pretty`

Makes logs readable during development.

In production, logs should stay structured for log tools.

### `morgan`

Morgan logs each HTTP request.

Example:

```txt
GET /health 200 3.215 ms - 47
```

### Morgan Stream To Pino

Instead of Morgan writing directly to console, we pipe Morgan output into Pino:

```js
write: (message) => logger.info(message.trim())
```

This keeps logging consistent.

## Expected Output

After running:

```bash
npm run dev
```

And visiting:

```txt
http://localhost:5000/health
```

You should see a log similar to:

```txt
Server running on port 5000
GET /health 200 ...
```

## Verification

1. Start server.
2. Visit `/health`.
3. Confirm a request log appears in terminal.

## Common Errors

### Error: `Cannot find package 'pino-pretty'`

Cause:

`pino-pretty` was not installed.

Fix:

```bash
npm install pino-pretty
```

### No Morgan logs appear

Cause:

The request did not hit your server or Morgan middleware is placed after routes.

Fix:

Place Morgan before route definitions.

## Senior Developer Notes

- Avoid random `console.log` in production code.
- Logs should tell a story: startup, request, important business event, failure.
- Do not log passwords, tokens, or secrets.

## After Completing This Chunk You Should Be Able To

- Understand the difference between Pino and Morgan
- See HTTP request logs
- Add application logs safely
- Explain why logs should exist before database setup

## Next Chunk Preview

Now we will connect MongoDB and log connection success or failure.

---

# Milestone 4: MongoDB Connection

## Goal

Connect the backend server to MongoDB using Mongoose.

## Why Are We Doing This?

The chat application needs persistent data:

- Users
- Conversations
- Messages
- Group membership
- Read status

MongoDB stores this data.

## Why Now?

The server already works, environment variables load, and logging is ready. That means if DB connection fails, we can debug it clearly.

## Files Created/Updated

```txt
backend/src/
  config/
    db.js
  server.js
```

## Code: `backend/src/config/db.js`

```js
import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error(error, "MongoDB connection failed");
    process.exit(1);
  }
};
```

## Update: `backend/src/server.js`

```js
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
};

startServer();
```

## Code Explanation

### `mongoose.connect`

Connects the app to MongoDB.

### `env.MONGODB_URI`

Reads the database URL from validated config.

### `try/catch`

If database connection fails, we log the error and stop the app.

### Why Stop The App?

If the app needs database access, running without DB creates confusing runtime errors.

## Expected Output

When MongoDB is running and URI is correct:

```txt
MongoDB connected successfully
Server running on port 5000
```

## Verification

Run:

```bash
npm run dev
```

Check terminal logs.

Then open:

```txt
http://localhost:5000/health
```

The server should still respond.

## Common Errors

### Error: `ECONNREFUSED 127.0.0.1:27017`

Cause:

MongoDB is not running locally.

Fix:

Start MongoDB or use MongoDB Atlas URI.

### Error: Invalid MongoDB URI

Cause:

`MONGODB_URI` is wrong in `.env`.

Fix:

Check `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/realtime_chat
```

### Server never starts

Cause:

Database connection fails before `app.listen`.

Fix:

Read the log message and fix MongoDB first.

## Senior Developer Notes

- Connect database before accepting requests.
- Log connection success once.
- Do not log full production connection strings because they may contain credentials.
- In larger systems, graceful shutdown should close DB connections cleanly.

## After Completing This Chunk You Should Be Able To

- Connect Express to MongoDB
- Understand why DB connection comes after server/env/log setup
- Debug common MongoDB connection issues
- Verify server still responds after DB connection

## Next Chunk Preview

Now that persistence is available, we will define database models.

---

# Milestone 5: Models and Schemas

## Goal

Create Mongoose models for users, conversations, and messages.

## Why Are We Doing This?

Models define the shape of data stored in MongoDB.

Without models, database documents can become inconsistent.

## Why Now?

Database connection works. Before writing auth or chat APIs, we need data structures.

## Files Created

```txt
backend/src/features/
  users/
    user.model.js
  conversations/
    conversation.model.js
  messages/
    message.model.js
```

## Code: `backend/src/features/users/user.model.js`

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
```

## Code: `backend/src/features/conversations/conversation.model.js`

```js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
```

## Code: `backend/src/features/messages/message.model.js`

```js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    attachments: [
      {
        url: String,
        type: String,
        name: String,
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
```

## Code Explanation

### `timestamps: true`

Automatically adds:

- `createdAt`
- `updatedAt`

Useful for message timestamps and sorting.

### `select: false`

The password will not be returned by default in queries.

### `ref`

Creates relationships between collections.

Example:

```js
sender: { ref: "User" }
```

means the sender is a user document.

### Conversation `type`

We use one `Conversation` model for both one-to-one and group chat.

This keeps message logic simpler because every message belongs to a conversation.

## Expected Outcome

The app should still start successfully.

No API behavior changes yet, but Mongoose now knows the schema for users, conversations, and messages.

## Verification

Run:

```bash
npm run dev
```

Expected:

```txt
MongoDB connected successfully
Server running on port 5000
```

## Common Errors

### Error: `OverwriteModelError`

Cause:

Same model is registered more than once in certain reload scenarios.

Fix:

Usually not a problem with normal `nodemon` setup. Avoid defining models inside functions.

### Error: Missing file extension in import

Cause:

ES Modules require `.js`.

Fix:

Use:

```js
import { User } from "./user.model.js";
```

## Senior Developer Notes

- Models should be stable and carefully designed.
- Do not store plain-text passwords.
- Add indexes for fields you frequently search, like `email`.
- Conversation design affects your whole chat system, so keep it simple at first.

## After Completing This Chunk You Should Be Able To

- Explain what a Mongoose model is
- Understand user, conversation, and message schema design
- Understand how timestamps support chat history
- Understand why one conversation model can support direct and group chat

## Next Chunk Preview

Now we will create routes so the API has organized entry points.

---

# Milestone 6: Routes and Route Registration

## Goal

Create route files and register them under `/api`.

## Why Are We Doing This?

Routes define how outside clients talk to the backend.

Example:

```txt
POST /api/auth/register
GET /api/users
GET /api/messages/:conversationId
```

## Why Now?

Models exist, but clients need API endpoints. Routes are the public API surface.

## Files Created/Updated

```txt
backend/src/
  routes/
    index.js
  features/
    auth/
      auth.routes.js
    users/
      user.routes.js
    conversations/
      conversation.routes.js
    messages/
      message.routes.js
  app.js
```

## Code: `backend/src/routes/index.js`

```js
import { Router } from "express";
import authRoutes from "../features/auth/auth.routes.js";
import userRoutes from "../features/users/user.routes.js";
import conversationRoutes from "../features/conversations/conversation.routes.js";
import messageRoutes from "../features/messages/message.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);

export default router;
```

## Code: `backend/src/features/auth/auth.routes.js`

```js
import { Router } from "express";

const router = Router();

router.get("/status", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working",
  });
});

export default router;
```

## Code: `backend/src/features/users/user.routes.js`

```js
import { Router } from "express";

const router = Router();

router.get("/status", (req, res) => {
  res.json({
    success: true,
    message: "User routes are working",
  });
});

export default router;
```

## Code: `backend/src/features/conversations/conversation.routes.js`

```js
import { Router } from "express";

const router = Router();

router.get("/status", (req, res) => {
  res.json({
    success: true,
    message: "Conversation routes are working",
  });
});

export default router;
```

## Code: `backend/src/features/messages/message.routes.js`

```js
import { Router } from "express";

const router = Router();

router.get("/status", (req, res) => {
  res.json({
    success: true,
    message: "Message routes are working",
  });
});

export default router;
```

## Update: `backend/src/app.js`

```js
import express from "express";
import morgan from "morgan";
import routes from "./routes/index.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(express.json());

app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use("/api", routes);

export default app;
```

## Code Explanation

### `Router()`

Creates a mini Express app for a specific feature.

### `router.use("/auth", authRoutes)`

Mounts auth routes under:

```txt
/api/auth
```

### Temporary `/status` routes

These are simple verification endpoints. They prove route registration works before controllers are added.

## Expected Outcome

These URLs should work:

```txt
GET /health
GET /api/auth/status
GET /api/users/status
GET /api/conversations/status
GET /api/messages/status
```

## Verification

Open:

```txt
http://localhost:5000/api/auth/status
```

Expected:

```json
{
  "success": true,
  "message": "Auth routes are working"
}
```

## Common Errors

### Error: `Cannot find module '../features/auth/auth.routes.js'`

Cause:

Wrong relative path.

Fix:

Check file location and import path.

### Route returns 404

Cause:

Route was not mounted in `routes/index.js` or `app.js`.

Fix:

Check:

```js
app.use("/api", routes);
```

and:

```js
router.use("/auth", authRoutes);
```

## Senior Developer Notes

- Route files should stay thin.
- Temporary status routes are useful while building structure.
- Remove or replace temporary status routes when real controllers are ready.

## After Completing This Chunk You Should Be Able To

- Create feature route files
- Mount routes under `/api`
- Understand route-level organization
- Verify routing before writing business logic

## Next Chunk Preview

Now we will add controllers to separate request/response handling from route definitions.

---

# Milestone 7: Controllers

## Goal

Move request/response logic from route files into controllers.

## Why Are We Doing This?

Controllers keep route files clean.

Routes should define "what endpoint exists".

Controllers should define "what response is sent".

## Why Now?

Routes work. Now we can organize handler logic properly before adding business logic.

## Files Created/Updated

```txt
backend/src/features/
  auth/
    auth.controller.js
    auth.routes.js
  users/
    user.controller.js
    user.routes.js
```

## Code: `backend/src/features/auth/auth.controller.js`

```js
export const authStatus = (req, res) => {
  res.json({
    success: true,
    message: "Auth controller is working",
  });
};
```

## Update: `backend/src/features/auth/auth.routes.js`

```js
import { Router } from "express";
import { authStatus } from "./auth.controller.js";

const router = Router();

router.get("/status", authStatus);

export default router;
```

## Code: `backend/src/features/users/user.controller.js`

```js
export const userStatus = (req, res) => {
  res.json({
    success: true,
    message: "User controller is working",
  });
};
```

## Update: `backend/src/features/users/user.routes.js`

```js
import { Router } from "express";
import { userStatus } from "./user.controller.js";

const router = Router();

router.get("/status", userStatus);

export default router;
```

## Code Explanation

### Controller Function

```js
export const authStatus = (req, res) => {};
```

This function receives Express request and response objects.

### Route Uses Controller

```js
router.get("/status", authStatus);
```

The route no longer contains response logic.

## Expected Outcome

The status routes still work, but now controller files handle the response.

## Verification

Open:

```txt
http://localhost:5000/api/auth/status
```

Expected:

```json
{
  "success": true,
  "message": "Auth controller is working"
}
```

## Common Errors

### Error: route callback is undefined

Cause:

Controller export/import name mismatch.

Fix:

If controller exports:

```js
export const authStatus = ...
```

then route imports:

```js
import { authStatus } from "./auth.controller.js";
```

## Senior Developer Notes

- Controllers should be small.
- A controller should usually call a service, then return response.
- Do not let controllers grow into business logic files.

## After Completing This Chunk You Should Be Able To

- Explain what controllers do
- Move route handlers into controller files
- Understand named exports
- Keep route files clean

## Next Chunk Preview

Now we will create services for business logic.

---

# Milestone 8: Services and Business Logic

## Goal

Create service files and move business decisions into them.

## Why Are We Doing This?

Services contain business logic.

Example business rules:

- A user cannot register with an existing email.
- A direct conversation must have exactly two members.
- A message must belong to a conversation.

## Why Now?

Controllers exist. Before writing database queries, we create a clean place for business rules.

## Files Created/Updated

```txt
backend/src/features/
  auth/
    auth.service.js
    auth.controller.js
```

## Code: `backend/src/features/auth/auth.service.js`

```js
export const getAuthStatus = () => {
  return {
    module: "auth",
    ready: true,
  };
};
```

## Update: `backend/src/features/auth/auth.controller.js`

```js
import { getAuthStatus } from "./auth.service.js";

export const authStatus = (req, res) => {
  const status = getAuthStatus();

  res.json({
    success: true,
    message: "Auth service is working",
    data: status,
  });
};
```

## Code Explanation

### Service Function

```js
export const getAuthStatus = () => {};
```

This function does not know about Express.

That is intentional.

Services should not depend on `req` or `res`.

### Controller Calls Service

```js
const status = getAuthStatus();
```

The controller delegates business/data work to the service.

## Expected Outcome

The route should still work, but now the flow is:

```txt
route -> controller -> service
```

## Verification

Open:

```txt
http://localhost:5000/api/auth/status
```

Expected:

```json
{
  "success": true,
  "message": "Auth service is working",
  "data": {
    "module": "auth",
    "ready": true
  }
}
```

## Common Errors

### Service imports Express objects

Cause:

Service is being treated like a controller.

Fix:

Keep `req` and `res` inside controllers only.

### Circular dependency

Cause:

Controller imports service and service imports controller.

Fix:

Dependencies should flow one way:

```txt
controller -> service -> repository -> model
```

## Senior Developer Notes

- Services are where product rules live.
- Services are easier to test because they do not require Express.
- A clean service layer makes future Socket.IO reuse easier.

## After Completing This Chunk You Should Be Able To

- Explain why services exist
- Keep business logic separate from controllers
- Understand one-way dependency flow

## Next Chunk Preview

Now we will add repositories so services can access database through a clean boundary.

---

# Milestone 9: Repositories and Database Access

## Goal

Create repository files for database queries.

## Why Are We Doing This?

Repositories isolate database operations.

If controllers or services directly use Mongoose everywhere, future changes become harder.

## Why Now?

Models exist and services exist. Repositories connect services to models without mixing responsibilities.

## Files Created/Updated

```txt
backend/src/features/
  auth/
    auth.repository.js
    auth.service.js
```

## Code: `backend/src/features/auth/auth.repository.js`

```js
import { User } from "../users/user.model.js";

export const findUserByEmail = (email) => {
  return User.findOne({ email }).select("+password");
};

export const createUser = (userData) => {
  return User.create(userData);
};
```

## Code Explanation

### `findUserByEmail`

Searches the database for a user by email.

The `.select("+password")` part is needed because the user model has:

```js
select: false
```

on the password field.

### `createUser`

Creates a user document in MongoDB.

## Expected Outcome

No new public API yet. The app should still start successfully.

This chunk prepares the database access layer for authentication.

## Verification

Run:

```bash
npm run dev
```

Expected:

```txt
MongoDB connected successfully
Server running on port 5000
```

## Common Errors

### Error: Cannot find `User`

Cause:

Wrong import path.

Fix:

Use:

```js
import { User } from "../users/user.model.js";
```

### Password not returned during login

Cause:

Password has `select: false`.

Fix:

Use:

```js
.select("+password")
```

only when password comparison is needed.

## Senior Developer Notes

- Repositories should not decide business rules.
- Repositories should not know about HTTP status codes.
- Keep repository methods small and descriptive.

## After Completing This Chunk You Should Be Able To

- Explain repository responsibility
- Query users through a clean database layer
- Understand why password is hidden by default

## Next Chunk Preview

Now we will add validation and error handling so bad input fails safely.

---

# Milestone 10: Error Handling and Validation

## Goal

Add reusable error helpers, async error handling, not-found handling, and validation middleware.

## Why Are We Doing This?

APIs must fail predictably.

Bad input should return `400`.

Unknown routes should return `404`.

Unexpected errors should return `500`.

## Why Now?

Before creating real auth endpoints, we need safe validation and error handling.

## Files Created/Updated

```txt
backend/src/
  utils/
    ApiError.js
    ApiResponse.js
    asyncHandler.js
  middlewares/
    validate.middleware.js
    expressValidator.middleware.js
    notFound.middleware.js
    error.middleware.js
  app.js
```

## Code: `backend/src/utils/ApiError.js`

```js
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

## Code: `backend/src/utils/ApiResponse.js`

```js
export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
```

## Code: `backend/src/utils/asyncHandler.js`

```js
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## Code: `backend/src/middlewares/validate.middleware.js`

```js
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    req.validated = result.data;
    next();
  };
};
```

## Code: `backend/src/middlewares/expressValidator.middleware.js`

```js
import { validationResult } from "express-validator";

export const handleExpressValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};
```

## Code: `backend/src/middlewares/notFound.middleware.js`

```js
import { ApiError } from "../utils/ApiError.js";

export const notFoundMiddleware = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
```

## Code: `backend/src/middlewares/error.middleware.js`

```js
import { logger } from "../utils/logger.js";

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(err, message);

  res.status(statusCode).json({
    success: false,
    message,
  });
};
```

## Update: `backend/src/app.js`

```js
import express from "express";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(express.json());

app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
```

## Code Explanation

### `ApiError`

Creates errors with HTTP status codes.

### `ApiResponse`

Gives consistent successful response shape.

### `asyncHandler`

Avoids writing `try/catch` in every async controller.

### `validate`

Uses Zod schemas to validate body, params, and query.

### `handleExpressValidation`

Supports validation using `express-validator`.

### `notFoundMiddleware`

Runs after all valid routes. If no route matched, it returns 404.

### `errorMiddleware`

Central place for error response.

## Expected Outcome

Unknown routes should now return clean 404 responses.

Example:

```txt
GET /wrong-route
```

Response:

```json
{
  "success": false,
  "message": "Route not found: /wrong-route"
}
```

## Verification

Open:

```txt
http://localhost:5000/wrong-route
```

Confirm that you get JSON, not an HTML error page.

## Common Errors

### Error middleware does not run

Cause:

Wrong function signature.

Fix:

Error middleware must have four parameters:

```js
(err, req, res, next)
```

### 404 middleware catches valid routes

Cause:

`notFoundMiddleware` is mounted before routes.

Fix:

Mount it after:

```js
app.use("/api", routes);
```

## Senior Developer Notes

- Error handling is not optional in APIs.
- Validate before controller logic.
- Never expose internal stack traces in production responses.
- Keep response shape consistent.

## After Completing This Chunk You Should Be Able To

- Return consistent error responses
- Validate requests with Zod
- Understand express-validator as an alternative
- Explain why middleware order matters

## Next Chunk Preview

Now we will build real authentication using validation, controllers, services, repositories, and models.

---

# Milestone 11: Authentication Feature

## Goal

Build registration and login.

## Why Are We Doing This?

Chat requires user identity.

We need to know:

- Who sent a message
- Which conversations a user belongs to
- Which messages are read
- Who is online

## Why Now?

Server, config, logs, DB, models, routes, controllers, services, repositories, validation, and errors are ready.

Authentication uses all of those pieces.

## Files Created/Updated

```txt
backend/src/
  utils/
    jwt.js
  features/
    auth/
      auth.validation.js
      auth.repository.js
      auth.service.js
      auth.controller.js
      auth.routes.js
```

## Code: `backend/src/utils/jwt.js`

```js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
```

## Code: `backend/src/features/auth/auth.validation.js`

```js
import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(1, "Password is required"),
  }),
});
```

## Code: `backend/src/features/auth/auth.service.js`

```js
import bcrypt from "bcrypt";
import { ApiError } from "../../utils/ApiError.js";
import { signToken } from "../../utils/jwt.js";
import { createUser, findUserByEmail } from "./auth.repository.js";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    password: hashedPassword,
  });

  const token = signToken({ userId: user._id });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken({ userId: user._id });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};
```

## Code: `backend/src/features/auth/auth.controller.js`

```js
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { loginUser, registerUser } from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.validated.body);

  res
    .status(201)
    .json(new ApiResponse(201, result, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.validated.body);

  res.status(200).json(new ApiResponse(200, result, "Login successful"));
});
```

## Code: `backend/src/features/auth/auth.routes.js`

```js
import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { login, register } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
```

## Code Explanation

### Register Flow

```txt
route -> validate -> controller -> service -> repository -> model -> database
```

### `bcrypt.hash`

Stores hashed password, not plain password.

### `bcrypt.compare`

Compares login password with stored hash.

### `signToken`

Creates JWT token after successful auth.

### `409 Conflict`

Used when email already exists.

### `401 Unauthorized`

Used when login credentials are invalid.

## Expected Outcome

You should be able to register and login.

## Verification

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Tarun\",\"email\":\"tarun@example.com\",\"password\":\"secret123\"}"
```

Expected:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "Tarun",
      "email": "tarun@example.com"
    },
    "token": "..."
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tarun@example.com\",\"password\":\"secret123\"}"
```

## Common Errors

### Password is visible in API response

Cause:

Returning full user document.

Fix:

Return selected safe fields manually.

### Duplicate email causes ugly MongoDB error

Cause:

No service-level existing email check.

Fix:

Check `findUserByEmail(email)` before creating user.

### `req.validated` is undefined

Cause:

Validation middleware missing from route.

Fix:

Use:

```js
router.post("/register", validate(registerSchema), register);
```

## Senior Developer Notes

- Never reveal whether email or password was wrong during login.
- Use stronger JWT secrets in real projects.
- Add refresh tokens only after basic auth is stable.
- Consider rate limiting auth endpoints in production.

## After Completing This Chunk You Should Be Able To

- Register a user
- Login a user
- Understand auth route/controller/service/repository flow
- Hash passwords safely
- Generate JWT tokens

## Next Chunk Preview

Now we will protect routes using JWT middleware and build user APIs.

---

# Milestone 12: Protected Routes and User APIs

## Goal

Create authentication middleware and user APIs.

## Why Are We Doing This?

Some routes should only work for logged-in users.

Example:

- Get my profile
- Search users
- Create conversations
- Send messages

## Why Now?

Auth endpoints return JWT tokens. Now we can use those tokens to protect APIs.

## Files Created/Updated

```txt
backend/src/
  middlewares/
    auth.middleware.js
  features/
    users/
      user.repository.js
      user.service.js
      user.controller.js
      user.routes.js
```

## Code: `backend/src/middlewares/auth.middleware.js`

```js
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../features/users/user.model.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication token is required");
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "Invalid authentication token");
  }

  req.user = user;
  next();
});
```

## Code: `backend/src/features/users/user.repository.js`

```js
import { User } from "./user.model.js";

export const findUserById = (userId) => {
  return User.findById(userId);
};

export const searchUsers = (search = "") => {
  return User.find({
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ],
  }).select("-password");
};
```

## Code: `backend/src/features/users/user.service.js`

```js
import { searchUsers } from "./user.repository.js";

export const getUsers = async (search) => {
  return searchUsers(search);
};
```

## Code: `backend/src/features/users/user.controller.js`

```js
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getUsers } from "./user.service.js";

export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, req.user, "Current user fetched"));
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await getUsers(req.query.search);

  res.json(new ApiResponse(200, users, "Users fetched"));
});
```

## Code: `backend/src/features/users/user.routes.js`

```js
import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { getMe, listUsers } from "./user.controller.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.get("/", authMiddleware, listUsers);

export default router;
```

## Expected Outcome

Authenticated users can access:

```txt
GET /api/users/me
GET /api/users
```

Unauthenticated users get:

```json
{
  "success": false,
  "message": "Authentication token is required"
}
```

## Verification

After login, copy token.

Use:

```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Errors

### Missing Bearer prefix

Wrong:

```txt
Authorization: token
```

Correct:

```txt
Authorization: Bearer token
```

### Token expired

Cause:

JWT expiry time passed.

Fix:

Login again.

## Senior Developer Notes

- Auth middleware should attach the current user to `req.user`.
- Do not trust user ID from request body for protected actions.
- Always use authenticated user identity from token.

## After Completing This Chunk You Should Be Able To

- Protect API routes
- Read JWT from request headers
- Attach current user to request
- Fetch current user profile

## Next Chunk Preview

Now we will create conversation APIs for direct and group chats.

---

# Milestone 13: Conversations

## Goal

Create APIs for direct and group conversations.

## Why Are We Doing This?

Messages need a container.

A conversation represents:

- Direct chat between two users
- Group chat between multiple users

## Why Now?

Users and auth are ready. Conversations require authenticated users.

## Planned APIs

```txt
POST /api/conversations/direct
POST /api/conversations/group
GET /api/conversations
GET /api/conversations/:id
```

## Business Rules

- Direct conversation must have exactly two members.
- Same two users should not create duplicate direct conversations.
- Group conversation must have a name.
- Group conversation should have at least two members.
- Authenticated user becomes group admin.

## Files

```txt
backend/src/features/conversations/
  conversation.repository.js
  conversation.service.js
  conversation.controller.js
  conversation.routes.js
```

## Expected Outcome

Users can create and list conversations.

## Verification

Use token from login and test:

```txt
POST /api/conversations/direct
GET /api/conversations
```

## Common Errors

### Duplicate direct conversations

Cause:

No check for existing member pair.

Fix:

Before creating, query for an existing direct conversation with both members.

### User creates conversation for someone else

Cause:

Trusting sender ID from body.

Fix:

Use `req.user._id` from auth middleware.

## Senior Developer Notes

- Conversation design impacts message queries and Socket.IO rooms.
- Use pagination when listing conversations in larger apps.
- Update `lastMessage` after sending messages.

## After Completing This Chunk You Should Be Able To

- Explain why messages need conversations
- Create direct conversation rules
- Create group conversation rules
- Prepare chat room structure

## Next Chunk Preview

Now we will create message APIs and persist chat history.

---

# Milestone 14: Messages

## Goal

Create APIs for sending, fetching, reading, and deleting messages.

## Why Are We Doing This?

The core value of the app is messaging.

Messages must be saved so chat history is available after refresh or reconnect.

## Why Now?

Conversations exist, so messages can belong to a valid conversation.

## Planned APIs

```txt
POST /api/messages
GET /api/messages/conversation/:conversationId
PATCH /api/messages/:id/read
DELETE /api/messages/:id
```

## Business Rules

- Sender must be a member of the conversation.
- Message text or attachment must exist.
- Users can fetch messages only from conversations they belong to.
- Deleting can be soft delete using `deletedFor`.
- Read status can be tracked using `readBy`.

## Files

```txt
backend/src/features/messages/
  message.validation.js
  message.repository.js
  message.service.js
  message.controller.js
  message.routes.js
```

## Expected Outcome

Authenticated users can send and fetch messages.

## Verification

Use:

```txt
POST /api/messages
GET /api/messages/conversation/:conversationId
```

Confirm messages are stored in MongoDB.

## Common Errors

### Message saved without conversation access check

Cause:

Service does not verify membership.

Fix:

Check conversation members before creating message.

### Message order is wrong

Cause:

No sort by `createdAt`.

Fix:

Use ascending or descending sort intentionally.

## Senior Developer Notes

- Add pagination early for message history.
- Keep message creation service reusable because Socket.IO may call it too.
- Avoid putting socket emit logic directly inside repository.

## After Completing This Chunk You Should Be Able To

- Persist chat messages
- Fetch message history
- Understand read status basics
- Understand soft delete strategy

## Next Chunk Preview

Now we will add Socket.IO for real-time delivery.

---

# Milestone 15: Socket.IO Real-Time Communication

## Goal

Add real-time messaging with Socket.IO.

## Why Are We Doing This?

REST APIs save and fetch data, but chat needs instant updates.

Socket.IO lets the server push events to connected clients.

## Why Now?

Users, conversations, and messages exist. Socket.IO can now use real data instead of fake events.

## Files Created/Updated

```txt
backend/src/
  sockets/
    index.js
    socket.auth.js
    chat.socket.js
  server.js
```

## Room Strategy

```txt
user:<userId>
conversation:<conversationId>
```

### User Room

Used for personal notifications.

### Conversation Room

Used for direct and group chat messages.

## Planned Events

| Event | Direction | Purpose |
| --- | --- | --- |
| `connection` | client -> server | User connects |
| `disconnect` | client -> server | User disconnects |
| `join_conversation` | client -> server | Join chat room |
| `leave_conversation` | client -> server | Leave chat room |
| `send_message` | client -> server | Send message |
| `receive_message` | server -> client | Receive message |
| `typing_start` | client -> server | Show typing |
| `typing_stop` | client -> server | Hide typing |
| `message_read` | client -> server | Mark message read |

## Expected Outcome

Two connected clients can join the same conversation room and receive messages in real time.

## Verification

Use a simple frontend, Postman Socket.IO client, or Socket.IO testing tool.

Test:

1. Login and get JWT.
2. Connect socket with token.
3. Join conversation room.
4. Send message.
5. Confirm another client receives `receive_message`.

## Common Errors

### Socket connects without user identity

Cause:

No socket auth.

Fix:

Verify JWT during socket connection.

### Message only reaches sender

Cause:

Client did not join conversation room or server emits to wrong room.

Fix:

Use:

```js
io.to(`conversation:${conversationId}`).emit("receive_message", message);
```

### Message appears twice

Cause:

Frontend adds optimistic message and also appends received same message.

Fix:

Deduplicate using message ID.

## Senior Developer Notes

- Socket events should reuse services where possible.
- Do not trust socket payloads. Validate them too.
- Real-time delivery and database persistence are separate concerns.
- Plan reconnection behavior for production.

## After Completing This Chunk You Should Be Able To

- Explain Socket.IO rooms
- Send real-time chat events
- Understand socket authentication
- Connect REST message persistence with real-time delivery

## Next Chunk Preview

Now we will create the frontend and connect it to the backend.

---

# Milestone 16: Frontend Foundation

## Goal

Create React frontend using Vite and connect it to backend APIs.

## Why Are We Doing This?

The backend is useful only when users can interact with it.

The frontend will provide:

- Register screen
- Login screen
- Chat layout
- Conversation list
- Message panel
- Group chat UI

## Why Now?

Backend core APIs are ready. Frontend can now integrate with real endpoints instead of fake data.

## Files/Folders

```txt
frontend/
  src/
    api/
      axios.js
      auth.api.js
    socket/
      socket.js
    features/
      auth/
      chat/
      groups/
    pages/
      Login.jsx
      Register.jsx
      Chat.jsx
```

## Commands

From project root:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios socket.io-client react-router-dom
```

## Expected Outcome

React app starts and can call:

```txt
GET http://localhost:5000/health
```

## Verification

Start backend:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

Open frontend URL and confirm page loads.

## Common Errors

### CORS error

Cause:

Backend did not allow frontend origin.

Fix:

Use `cors` middleware with `CLIENT_URL`.

### API base URL wrong

Cause:

Frontend points to wrong backend port.

Fix:

Check frontend API config.

## Senior Developer Notes

- Keep API calls in `src/api`, not inside every component.
- Keep socket setup in one place.
- Store token carefully. For learning, localStorage is acceptable. For production, consider secure cookie-based auth.

## After Completing This Chunk You Should Be Able To

- Start frontend and backend together
- Call backend from React
- Understand frontend folder responsibility

## Next Chunk Preview

Now we will verify full flows end to end.

---

# Milestone 17: Final Verification and Testing

## Goal

Verify the full application in small flows.

## Why Are We Doing This?

A feature is not complete when code is written. It is complete when it works and can be verified.

## Backend Verification Checklist

- `GET /health` returns success
- Environment config validates at startup
- Logger shows server and request logs
- MongoDB connects successfully
- Register creates a user
- Duplicate email returns conflict
- Login returns JWT
- Protected route rejects missing token
- Protected route accepts valid token
- Users can be searched
- Conversation can be created
- Message can be sent
- Message history can be fetched
- Socket connects with JWT
- Socket joins conversation room
- Real-time message is received

## Frontend Verification Checklist

- Register form works
- Login form works
- Token persists after refresh
- Protected screens reject logged-out users
- User list loads
- Conversation opens
- Old messages load
- New message appears instantly
- Group creation works
- Group member list displays
- Typing indicator works if implemented

## Common Errors

### Backend works but frontend fails

Likely causes:

- CORS issue
- Wrong API base URL
- Missing token header

### Login works but protected route fails

Likely causes:

- Authorization header missing `Bearer`
- JWT secret changed
- Token expired

### Socket connects but messages do not arrive

Likely causes:

- User did not join room
- Wrong room name
- Event name mismatch
- Message emitted before listener was attached

## Senior Developer Notes

- Test one feature at a time.
- Keep a Postman/Thunder Client collection.
- Add automated tests after the manual flow is stable.
- For production, add rate limiting, helmet, request size limits, and better auth token strategy.

## After Completing This Chunk You Should Be Able To

- Verify each backend milestone
- Debug common frontend/backend integration issues
- Explain the full request lifecycle
- Explain the full real-time message lifecycle

---

# Recommended Development Order Summary

Follow this order exactly:

1. Project setup and working Express server
2. Environment variables and validation
3. Logger and HTTP request logs
4. MongoDB connection
5. Models and schemas
6. Routes
7. Controllers
8. Services
9. Repositories
10. Error handling and validation
11. Authentication
12. Protected user APIs
13. Conversations
14. Messages
15. Socket.IO
16. Frontend
17. Final verification

---

# Beginner Rules To Remember

- First make the server work.
- Then add config.
- Then add logs.
- Then add database.
- Then add models.
- Then add APIs.
- Do not put database queries in controllers.
- Do not put business logic in routes.
- Do not commit `.env`.
- Do not store plain-text passwords.
- Do not trust request body user IDs for protected actions.
- Validate input before business logic.
- Keep imports consistent with ES Modules.
- Every chunk should have a working outcome before moving forward.

---

# Final Deliverables

At the end of the project, you should have:

- Source code pushed to GitHub
- Clean `.gitignore`
- `README.md` documentation
- `.env.example`
- Working backend
- Working frontend
- Real-time one-to-one chat
- Real-time group chat
- MongoDB message history
- Live project link

