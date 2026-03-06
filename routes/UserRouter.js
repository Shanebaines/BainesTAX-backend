import express from 'express';
import User from '../models/User.js';
import { createUser, loginUser } from '../Controllers/userControllers.js';


const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.post('/login', loginUser);

export default userRouter;