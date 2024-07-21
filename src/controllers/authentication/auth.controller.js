import User from "../../models/user.model.js";
import Token from "../../models/Token.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { statusCodes } from "../../utils/statusCodes.js";
import { v4 as uuidv4 } from "uuid";
import logger from "../../config/winston.js";


const signup = async (req, res) => {
    try {
        const { name, email, phone, password, DOB, monthly_salary } = req.body;
        if (!name || !email || !phone || !password || !DOB || !monthly_salary) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "One or more fields are missing",
            });
        }
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "Invalid email address",
            });
        }

        // phone number validation 10 digits
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "Invalid phone number",
            });
        }

        // DOB validation dd/mm/yyyy format (01/01/2000)
        const dobRegex = new RegExp('^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\\d{4}$');
        if (!dobRegex.test(DOB)) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "Invalid DOB format. Expected format: dd/mm/yyyy",
            });
        }

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,14}$/;
        if (!passwordRegex.test(password)) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "Password should be between 6 to 14 characters which contain at least one numeric digit, one uppercase and one lowercase letter",
            });
        };

        const user = await User.findOne(
            { $or: [{ email: email }, { phone: phone }] }
        );
        if (user) {
            return res.status(statusCodes.CONFLICT).json({ message: "User already exists" });
        }

        const age = new Date().getFullYear() - new Date(DOB).getFullYear();
        if (age < 20) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "User should be above 20 years of age.",
            });
        }

        if (monthly_salary < 25000) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "Monthly salary should be 25k or more.",
            });
        }


        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            DOB,
            monthly_salary
        });
        await newUser.save();

        // Create JWT payload
        const userData = {
            user: {
                id: newUser._id,
                email: newUser.email,
                phone: newUser.phone,
                name: newUser.name,
                DOB: newUser.DOB,
                monthly_salary: newUser.monthly_salary
            },
        };

        // Sign the access token
        const accessToken = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Generate refresh token
        const refreshToken = uuidv4();
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 2); // 2 days

        // Save refresh token in the database
        const token = new Token({
            token: refreshToken,
            userId: newUser._id,
            expiresAt: refreshTokenExpiry
        });
        await token.save();


        logger.info("User registered successfully");
        return res.status(statusCodes.CREATED).json({
            status: "success",
            message: "User registered successfully",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    DOB: newUser.DOB,
                    monthly_salary: newUser.monthly_salary
                }
            }
        });

    } catch (error) {
        logger.error(error.stack || error.message || error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "Please provide email and password",
            });
        }
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "Invalid email address",
            });
        }


        const user = await User.findOne({ email });
        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(statusCodes.BAD_REQUEST).json({
                message: "Incorrect password"
            });
        }

        // Create JWT payload
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

        // Sign the access token
        const accessToken = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Generate refresh token
        const refreshToken = uuidv4();
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 2); // 2 days

        // Save refresh token in the database
        const token = await Token.findOneAndUpdate(
            { userId: user._id },
            {
                token: refreshToken,
                expiresAt: refreshTokenExpiry
            },
            { upsert: true, new: true }
        );


        logger.info("User logged in successfully");
        return res.status(statusCodes.OK).json({
            status: "success",
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    DOB: user.DOB,
                    monthly_salary: user.monthly_salary
                }
            }
        });

    } catch (error) {
        logger.error(error.stack || error.message || error);
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

export {
    signup,
    login,
};
