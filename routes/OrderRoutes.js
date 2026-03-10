import express from 'express';
import { createOrder,getOrders } from '../Controllers/OrderControllers.js';

const orderRouter = express.Router();

orderRouter.post('/', (req, res) => {
    createOrder(req, res);
});

orderRouter.get('/', (req, res) => {
    getOrders(req, res);
});


export default orderRouter; 