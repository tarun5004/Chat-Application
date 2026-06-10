import dotenv from "dotenv";
import {z} from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default("5000"), // Default to "5000" if not provided
    MONGODB_URI: z.string().min(1).nonempty("MONGODB_URI is required"), // Ensure it's a non-empty string and provide a custom error message
    NODE_ENV: z.string().default("development"),
    ACCESS_TOKEN_SECRET: z.string().min(10, "ACCESS_TOKEN_SECRET is required"),
    ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
    REFRESH_TOKEN_SECRET: z.string().min(10, "REFRESH_TOKEN_SECRET is required"),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
    });

    // Parse and validate environment variables meaningfully, providing defaults and custom error messages
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error("Environment variable validation failed:", parsed.error.fieldErrors()); // Log detailed validation errors
        process.exit(1); // Exit the application if validation fails
    }

    export default parsed.data; // Export the validated and parsed environment variables for use in the application

    // This approach ensures that the application has all necessary configuration values, provides clear error messages for missing or invalid variables, and allows for default values where appropriate.
