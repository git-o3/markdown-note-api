import dotenv from "dotenv"
import app from "./src/app.js";
import logger from "./src/utils/logger.js";

dotenv.config();




const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info(`🚀Server running in ${process.env.NODE_ENV} mode on port
        ${PORT} Chief 🫡`)
});