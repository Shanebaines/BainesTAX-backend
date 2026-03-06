import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import Student from './models/Students.js';
import studentRouter from './routes/studentRouter.js';
import productRouter from './routes/productRouter.js';
import userRouter from './routes/UserRouter.js';
import jwt from 'jsonwebtoken';

const app = express();
const mongourl = 'mongodb+srv://Shane_Baines:1740@cluster0.yu1afco.mongodb.net/?appName=Cluster0';

//middlewares
app.use(bodyParser.json());
app.use(
    (req, res, next) => {
       const token = req.headers['authorization']?.replace('Bearer ', '');
         if(token) {
             try {
                 const decoded = jwt.verify(token, 'BainesTAX');
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

app.use('/api/students', studentRouter);
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