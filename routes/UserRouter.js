import express from 'express';
import User from '../models/User.js';
import { createUser, googleLoginUser, loginUser } from '../Controllers/userControllers.js';


const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.post('/login', loginUser);
userRouter.post('/google-login', googleLoginUser);

export default userRouter;