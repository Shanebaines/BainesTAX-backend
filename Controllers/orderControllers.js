import Order from '../models/Order.js';

export async function createOrder(req, res) {
    if (!req.user || req.user.type !== 'Customer') {
        return res.status(403).json({ error: 'Only customers can create orders' });
    }

    try {
        const latestOrder = await Order.findOne().sort({ orderID: -1 });

        let orderId;
        if (!latestOrder) {
            orderId = 'BTAX-0001';
        } else {
            const lastNumber = parseInt(latestOrder.orderID.split('-')[1]);
            const newNumber = lastNumber + 1;
            orderId = `BTAX-${newNumber.toString().padStart(4, '0')}`;
        }

        const newOrderData = req.body;
        newOrderData.orderID = orderId;
        newOrderData.email = req.user.email;

        const order = new Order(newOrderData);
        const savedOrder = await order.save();

        return res.status(201).json({
            message: 'Order created successfully',
            order: savedOrder,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create order' });
    }
}

export async function getOrders(req, res) {
    if (req.user.type === 'Admin') {
        try {
            const orders = await Order.find();
            res.status(200).json(orders);
        }
        catch (error) { 
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch orders' });
        }   
    } else if (req.user.type === 'Customer') {
        try {
            const orders = await Order.find({ email: req.user.email });
            res.status(200).json(orders);
        }
        catch (error) { 
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
}

export async function deleteOrder(req, res) {
    const orderID = req.params.orderID;
    try {
        const deletedOrder = await Order.findOneAndDelete({ orderID: orderID });
        if (deletedOrder) {
            res.status(200).json({ message: 'Order deleted successfully' });
        } else {
            res.status(404).json({ error: 'Order not found' });
        }   
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
}
