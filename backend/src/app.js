import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./feature/auth/auth.routes.js";
import { APP_MESSAGES } from "./constants/messages.js";
import { HTTP_STATUS } from "./constants/httpStatus.js";
import env from "./config/env.js";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import logger from "./utils/logger.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.get('/health', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Welcome to the Real-Time Chat API!',
    });
});

// app routes
app.use("/api/auth", authRoutes);


app.use(notFoundMiddleware); //agar koi route match nahi karta hai to not found middleware ko use karenge, taki not found error throw ho jaye
app.use(errorMiddleware); //error handling middleware ko use karenge, taki app ke har error ko handle kar sake, aur client ko ek consistent error response bhej sake



export default app;



