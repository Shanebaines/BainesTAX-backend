import express from 'express';
import { createOrder,getOrders,deleteOrder } from '../Controllers/orderControllers.js';

const orderRouter = express.Router();

orderRouter.post('/', (req, res) => {
    createOrder(req, res);
});

orderRouter.get('/', (req, res) => {
    getOrders(req, res);
});

orderRouter.delete('/:orderID', (req, res) => {
    deleteOrder(req, res);
});


export default orderRouter; 