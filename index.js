import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import productRouter from './routes/productRouter.js';
import userRouter from './routes/UserRouter.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const mongourl = process.env.MONGO_DB_URL;

//middlewares
app.use(bodyParser.json());
app.use(
    (req, res, next) => {
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


app.use('/api/products', productRouter);
app.use('/api/users', userRouter);


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