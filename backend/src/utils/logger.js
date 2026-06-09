import pino from 'pino';
// Create a logger instance with desired options
const logger = pino({
  // Set the log level (e.g., 'info', 'error', 'debug')
  // level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Uncomment and adjust log level based on environment
  // Customize the log format if needed
  // prettyPrint: process.env.NODE_ENV !== 'production', // Uncomment for pretty printing in non-production environments
  transport:
    process.env.NODE_ENV !== 'production'  // Use pretty printing in development for better readability, and default JSON format in production for structured logging
    ? {
        target: 'pino-pretty', // Use pino-pretty for development to get human-readable logs
        options: {
          colorize: true, // Enable colorized output for better readability in development
          translateTime: 'yyyy-mm-dd HH:MM:ss.l', // Format timestamps for easier reading
        },
      }
    : undefined, // Use default transport in production (JSON format)
});
export default logger;