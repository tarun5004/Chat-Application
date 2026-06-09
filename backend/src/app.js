import express from "express";
import morgan from "morgan";
import logger from "./utils/logger.js";

const app = express();

app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);