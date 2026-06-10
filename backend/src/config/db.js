import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error({ err: error }, "Error connecting to MongoDB");
    throw error;
  }
};

export default connectDB;
