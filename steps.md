# Real-Time Chat Application - Beginner Friendly Steps

Ye file humare project ka roadmap hai. Goal hai React, Node.js, Express, Socket.IO aur MongoDB ke saath real-time one-to-one aur group chat application banana.

Pehle hum backend ka strong base banayenge: feature-based architecture, validation, logger, error handling, database connection, auth, aur Socket.IO setup. Uske baad frontend banayenge.

---

## 0. Final Project Goal

Application me ye features hone chahiye:

- User registration aur login
- JWT based authentication
- User data MongoDB me store
- One-to-one chat
- Group chat
- Real-time messages using Socket.IO
- Message history database me save
- Timestamps for messages
- Group details aur member list
- User connection/disconnection handling
- Extra features: typing indicator, read/unread status, last seen, file/image sharing, message delete, notifications

---

## 1. Recommended Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcrypt
- Zod for schema validation
- express-validator for Express validation practice
- Pino for app logging
- Morgan for HTTP request logging
- dotenv for environment variables
- cors for frontend/backend connection

### Frontend

- React
- Vite
- Socket.IO client
- Axios
- React Router
- A simple state solution first, then Zustand/Redux if needed

---

## 2. Folder Structure

Use feature-based architecture. Har feature ke andar uske routes, validation, controller, service, repository, model related files rahenge.

```txt
Chat Application/
  backend/
    src/
      app.js
      server.js

      config/
        env.js
        database.js
        cors.js

      constants/
        httpStatus.js
        messages.js

      middlewares/
        auth.middleware.js
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

      sockets/
        index.js
        socket.auth.js
        chat.socket.js

      features/
        auth/
          auth.routes.js
          auth.validation.js
          auth.controller.js
          auth.service.js
          auth.repository.js

        users/
          user.routes.js
          user.validation.js
          user.controller.js
          user.service.js
          user.repository.js
          user.model.js

        conversations/
          conversation.routes.js
          conversation.validation.js
          conversation.controller.js
          conversation.service.js
          conversation.repository.js
          conversation.model.js

        messages/
          message.routes.js
          message.validation.js
          message.controller.js
          message.service.js
          message.repository.js
          message.model.js

        groups/
          group.routes.js
          group.validation.js
          group.controller.js
          group.service.js
          group.repository.js

      routes/
        index.js

    .env
    .env.example
    package.json

  frontend/
    src/
      api/
      assets/
      components/
      features/
        auth/
        chat/
        groups/
      hooks/
      layouts/
      pages/
      routes/
      socket/
      styles/
      utils/
    package.json

  README.md
  steps.md
```

### File Responsibility

- `routes`: endpoint define karega
- `validation`: request body, params, query validate karega
- `controller`: request/response handle karega
- `service`: business logic rakhega
- `repository`: database query karega
- `model`: MongoDB schema define karega
- `middlewares`: common Express middleware
- `utils`: reusable helper functions
- `sockets`: Socket.IO events

---

## 3. Backend Basic Setup

### Step 3.1: Backend folder create karo

```bash
mkdir backend
cd backend
npm init -y
```

### Step 3.2: Backend dependencies install karo

```bash
npm install express mongoose socket.io cors dotenv jsonwebtoken bcrypt zod express-validator pino pino-pretty morgan
npm install -D nodemon
```

### Step 3.3: `package.json` scripts add karo

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

### Step 3.4: Environment file banao

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/realtime_chat
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create `backend/.env.example` bhi same keys ke saath, but real secret mat daalna.

---

## 4. Backend Core Files

### Step 4.1: Logger setup

Create `src/utils/logger.js`.

Use Pino for application logs:

```js
const pino = require("pino");

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: { colorize: true },
        }
      : undefined,
});

module.exports = logger;
```

### Step 4.2: Morgan HTTP logger setup

Morgan HTTP request logs ke liye use hoga. Pino app logs ke liye use hoga.

In `src/app.js`:

```js
const morgan = require("morgan");
const logger = require("./utils/logger");

app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
```

### Step 4.3: Database connection

Create `src/config/database.js`.

```js
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDatabase = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info("MongoDB connected");
};

module.exports = connectDatabase;
```

### Step 4.4: Express app setup

Create `src/app.js`.

```js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const logger = require("./utils/logger");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan("dev", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

app.use("/api", routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
```

### Step 4.5: HTTP server plus Socket.IO setup

Create `src/server.js`.

```js
require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDatabase = require("./config/database");
const logger = require("./utils/logger");
const initSocket = require("./sockets");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  logger.error(error, "Failed to start server");
  process.exit(1);
});
```

---

## 5. Validation Setup

Hum primarily Zod use karenge because schemas clean aur reusable hote hain. Express-validator bhi setup rahega so tum dono ka practice kar sakte ho.

### Step 5.1: Zod validation middleware

Create `src/middlewares/validate.middleware.js`.

```js
const validate = (schema) => (req, res, next) => {
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

module.exports = validate;
```

### Step 5.2: Express-validator middleware

Create `src/middlewares/expressValidator.middleware.js`.

```js
const { validationResult } = require("express-validator");

const handleExpressValidation = (req, res, next) => {
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

module.exports = handleExpressValidation;
```

### Step 5.3: Validation usage example

Zod route example:

```js
const router = require("express").Router();
const validate = require("../../middlewares/validate.middleware");
const authValidation = require("./auth.validation");
const authController = require("./auth.controller");

router.post("/register", validate(authValidation.registerSchema), authController.register);
router.post("/login", validate(authValidation.loginSchema), authController.login);

module.exports = router;
```

Express-validator route example:

```js
const { body } = require("express-validator");
const handleExpressValidation = require("../../middlewares/expressValidator.middleware");

router.post(
  "/login-express-validator",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleExpressValidation,
  authController.login
);
```

Important: Ek endpoint pe usually ek hi validation style use karo. Learning ke liye dono setup rakhenge.

---

## 6. Error Handling Setup

### Step 6.1: Async handler

Create `src/utils/asyncHandler.js`.

```js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

### Step 6.2: API error helper

Create `src/utils/ApiError.js`.

```js
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
```

### Step 6.3: API response helper

Create `src/utils/ApiResponse.js`.

```js
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = ApiResponse;
```

### Step 6.4: Not found middleware

Create `src/middlewares/notFound.middleware.js`.

```js
const ApiError = require("../utils/ApiError");

const notFoundMiddleware = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

module.exports = notFoundMiddleware;
```

### Step 6.5: Global error middleware

Create `src/middlewares/error.middleware.js`.

```js
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(err, message);

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
```

---

## 7. Auth Feature

### Step 7.1: User model

Create `src/features/users/user.model.js`.

Fields:

- name
- email
- password
- avatar
- isOnline
- lastSeen
- timestamps

### Step 7.2: Auth validation

Create `src/features/auth/auth.validation.js`.

Schemas:

- `registerSchema`
- `loginSchema`

### Step 7.3: Auth repository

Create `src/features/auth/auth.repository.js`.

Functions:

- `findUserByEmail(email)`
- `createUser(data)`

### Step 7.4: Auth service

Create `src/features/auth/auth.service.js`.

Responsibilities:

- Check email already exists
- Hash password
- Create user
- Compare password during login
- Generate JWT

### Step 7.5: Auth controller

Create `src/features/auth/auth.controller.js`.

Functions:

- `register(req, res)`
- `login(req, res)`
- `me(req, res)`

### Step 7.6: Auth routes

Create `src/features/auth/auth.routes.js`.

Routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

---

## 8. User Feature

### User APIs

- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/me`

### User service logic

- Search users
- Get user profile
- Update current user
- Show online/offline status

---

## 9. Conversations Feature

Conversation is useful for one-to-one chat.

### Conversation model fields

- members: array of user ids
- lastMessage
- timestamps

### Conversation APIs

- `POST /api/conversations`
- `GET /api/conversations`
- `GET /api/conversations/:id`

### Rules

- One-to-one conversation me exactly 2 members hone chahiye
- Same 2 users ke beech duplicate conversation nahi banani

---

## 10. Messages Feature

### Message model fields

- conversation
- sender
- text
- attachments
- readBy
- deletedFor
- timestamps

### Message APIs

- `POST /api/messages`
- `GET /api/messages/conversation/:conversationId`
- `DELETE /api/messages/:id`
- `PATCH /api/messages/:id/read`

### Rules

- Message send hone par database me save karo
- Save hone ke baad Socket.IO se receiver ko emit karo
- Message list pagination ke saath fetch karo

---

## 11. Group Chat Feature

Group chat ko conversation model ke through bhi handle kar sakte ho, ya separate group model bana sakte ho. Beginner-friendly approach: conversation model me `type: "direct" | "group"` add karo.

### Group fields

- name
- description
- avatar
- admin
- members
- type: group
- lastMessage

### Group APIs

- `POST /api/groups`
- `GET /api/groups`
- `GET /api/groups/:id`
- `PATCH /api/groups/:id`
- `POST /api/groups/:id/members`
- `DELETE /api/groups/:id/members/:userId`

---

## 12. Socket.IO Setup

### Step 12.1: Basic socket file

Create `src/sockets/index.js`.

Socket events:

- `connection`
- `disconnect`
- `join_conversation`
- `leave_conversation`
- `send_message`
- `receive_message`
- `typing_start`
- `typing_stop`
- `message_read`

### Step 12.2: Room strategy

- Direct chat room: `conversation:<conversationId>`
- Group chat room: same pattern, because group is also conversation
- User personal room: `user:<userId>`

### Step 12.3: Socket auth

Frontend JWT token Socket.IO connection ke auth object me bhejega.

Backend token verify karega, then `socket.user = user`.

---

## 13. Frontend Setup

### Step 13.1: Frontend app create karo

From root folder:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Step 13.2: Frontend dependencies install karo

```bash
npm install axios socket.io-client react-router-dom
```

### Step 13.3: Frontend pages

Pages:

- Login
- Register
- Chat layout
- One-to-one chat screen
- Group chat screen
- Profile/settings

### Step 13.4: Frontend folders

```txt
frontend/src/
  api/
    axios.js
    auth.api.js
    user.api.js
    message.api.js

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

---

## 14. Development Order

Follow this order. Isse project manageable rahega.

### Phase 1: Backend foundation

- Create backend folder
- Install packages
- Setup env
- Setup Express app
- Setup MongoDB connection
- Setup Pino logger
- Setup Morgan HTTP logger
- Setup error handling
- Setup Zod validation middleware
- Setup express-validator middleware
- Setup base route `/health`

### Phase 2: Authentication

- Create user model
- Create auth validation
- Create auth repository
- Create auth service
- Create auth controller
- Create auth routes
- Test register/login in Postman or Thunder Client

### Phase 3: Protected APIs

- Create JWT utility
- Create auth middleware
- Add `/api/auth/me`
- Add user list API

### Phase 4: Conversations and messages

- Create conversation model
- Create message model
- Create conversation APIs
- Create message APIs
- Save message history in MongoDB

### Phase 5: Socket.IO

- Setup Socket.IO server
- Add socket JWT auth
- Join user personal room
- Join conversation rooms
- Emit receive message event
- Add typing indicator
- Add read status

### Phase 6: Frontend

- Create React app
- Build register/login pages
- Store JWT token
- Build chat layout
- Connect Socket.IO client
- Show one-to-one messages
- Show group messages

### Phase 7: Extra features

- Last seen
- Online/offline users
- Message delete
- File/image sharing
- Notifications
- Better UI

### Phase 8: Documentation and deploy

- Write README
- Add screenshots
- Push code to GitHub
- Deploy backend
- Deploy frontend
- Add live links

---

## 15. Testing Checklist

Backend:

- `/health` returns success
- Register creates user
- Duplicate email gives error
- Login returns JWT
- Protected route rejects missing token
- Protected route accepts valid token
- Conversation creates successfully
- Message saves in database
- Message fetch returns history
- Socket connects with token
- Message emits in real time
- Typing indicator works

Frontend:

- Register form works
- Login form works
- Token persists after refresh
- User list loads
- Conversation opens
- Old messages load
- New message appears instantly
- Group creation works
- Group members visible

---

## 16. Beginner Rules To Remember

- Controller me database query directly mat likho.
- Database query repository me rakho.
- Business logic service me rakho.
- Request validation route level pe lagao.
- Har async controller ko `asyncHandler` se wrap karo.
- Secrets `.env` me rakho.
- `.env` GitHub pe push mat karo.
- Logs ke liye `console.log` ke bajay logger use karo.
- Ek feature complete karo, phir next feature start karo.
- Socket.IO event ka naam consistent rakho.

---

## 17. Next Step For Us

Hum sabse pehle Phase 1 complete karenge:

1. Backend folder create
2. Packages install
3. Folder structure create
4. Express app setup
5. MongoDB connection setup
6. Logger setup
7. Morgan setup
8. Zod validation setup
9. express-validator setup
10. Error handling setup
11. `/health` route test

Phase 1 complete hone ke baad auth feature start karenge.
