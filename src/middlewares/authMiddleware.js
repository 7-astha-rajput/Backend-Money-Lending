import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { statusCodes } from "../utils/statusCodes.js";
import logger from "../config/winston.js";

const authMiddleware = async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                message: "Access token is required"
            });
        }
        const token = accessToken.split(" ")[1];

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                message: "Invalid access token"
            });
        }

        const user = await User.findById(decodedToken.user.id);
        if (!user) {
            return res.status(statusCodes.NOT_FOUND).json({
                message: "User not found"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error(error.message, error.stack);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Server Error"
        });
    }
};

export {
    authMiddleware,
}