import app from "./src/app.js";
import logger from "./src/config/winston.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 5000;

// Start the server
app.listen(port, () => {
    logger.info(`Server running on port http://localhost:${port}`);
});