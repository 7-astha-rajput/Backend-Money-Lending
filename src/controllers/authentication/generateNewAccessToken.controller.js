import Token from '../../models/Token.model.js';
import User from '../../models/user.model.js';
import jwt from 'jsonwebtoken';
import { statusCodes } from '../../utils/statusCodes.js';
import logger from '../../config/winston.js';

const generateNewAccessToken = async (req, res) => {
    try {
        const {refreshToken} = req.body;
        if (!refreshToken) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "Refresh token is required"
            });
        }

        const token = await Token.findOne({
            token: refreshToken
        });
        if (!token) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                message: "Invalid refresh token"
            });
        }

        const user = await User.findById(token.userId);
        if (!user) {
            return res.status(statusCodes.NOT_FOUND).json({
                message: "User not found"
            });
        }

        const userData = {
            user: {
                id: user._id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                DOB: user.DOB,
                monthly_salary: user.monthly_salary
            },
        };

        const accessToken = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(statusCodes.OK).json({ accessToken });
    } catch (error) {
        logger.error(error.message, error.stack);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Server Error"
        });
    }
};

export default generateNewAccessToken;