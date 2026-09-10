import {Router} from "express";
import {register,login} from "../controllers/authController.js"
import { authMiddleware } from "../middleware/authMiddleWare";


const authRouter = Router();

authRouter.post('/register',register)
authRouter.post('/login',login)
authRouter.post('/logout',logout)
authRouter.post('/me',authMiddleware,me)

export default authRouter;
