import express from "express";
import { login, signup } from "../controllers/authentication/auth.controller.js";
import generateNewAccessToken from "../controllers/authentication/generateNewAccessToken.controller.js";
const authRouter = express.Router();

authRouter.route("/signup").post(signup);
authRouter.route("/login").post(login);
authRouter.route("/new-access-token").post(generateNewAccessToken)

export default authRouter;