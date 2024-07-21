import mongoose from "mongoose";
import logger from "./winston.js";


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        logger.info("Database connected successfully");
    } catch (error) {
        logger.error(`Error while connecting to database: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;