import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { borrowMoney, getUser, updateUser } from "../controllers/user/user.controller.js";
const userRouter = express.Router();

userRouter.route("/").get(authMiddleware, getUser);
userRouter.route("/update").put(authMiddleware, updateUser);
userRouter.route("/borrow-money").post(authMiddleware, borrowMoney);

export default userRouter;