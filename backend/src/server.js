import app from "./app.js";
import env from "./config/env.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";


const PORT = env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
}

startServer();
