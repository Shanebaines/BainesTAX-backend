import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/UserRouter.js';
import productRouter from './routes/ProductRouters.js';
import orderRouter from './routes/OrderRoutes.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from "cors";

dotenv.config();


const app = express();
const mongourl = process.env.MONGO_DB_URL;

//middlewares
app.use(bodyParser.json());
app.use(cors());

app.use(
    (req, res, next) => {
        const normalizedPath = req.path.replace(/\/+$/, '') || '/';

        // 1) Login never needs a token.
        if (req.method === 'POST' && (normalizedPath === '/api/users/login' || normalizedPath === '/api/users/google-login')) {
            return next();
        }

        // 2) Creating a NON-Admin user does not need a token.
        //    If Type === 'Admin', we require a token (checked below).
        if (
            req.method === 'POST' &&
            normalizedPath === '/api/users' &&
            req.body?.Type !== 'Admin'
        ) {
            return next();
        }

        // 3) Product browsing is public.
        if (req.method === 'GET' && normalizedPath.startsWith('/api/products')) {
            return next();
        }

       const token = req.headers['authorization']?.replace('Bearer ', '');
         if(token) {
             try {
                 const decoded = jwt.verify(token, process.env.Secret_Key_FOR_TOKEN);
                 req.user = decoded;
                 next();
             } catch (error) {
                 res.status(401).json({ error: 'Invalid token' });
             }
         } else {
             res.status(401).json({ error: 'Token not provided' });
         }
    }

)

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

function startServer() {
    mongoose
        .connect(mongourl)
        .then(() => {
            console.log('Connected to MongoDB');
            app.listen(3000, () => console.log('Server is running on port 3000'));
        })
        .catch((error) => {
            console.error('Error connecting to MongoDB:', error);
        });
}

startServer();