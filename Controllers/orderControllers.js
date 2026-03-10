import Order from '../models/Order.js';

export async function createOrder(req, res) {
    if (!req.user || req.user.type !== 'Customer') {
        return res.status(403).json({ error: 'Only customers can create orders' });
    }

    const newOrderData = req.body;

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

        const newOrder = new Order({
            orderID: orderId,
            email: req.user.email,
            orderedItems: newOrderData.orderedItems,
            nameOfTheClient: newOrderData.nameOfTheClient,
            phoneNumber: newOrderData.phoneNumber,
            paymentMethod: newOrderData.paymentMethod,
            notes: newOrderData.notes,
        });

        await newOrder.save();
        return res.status(201).json(newOrder);
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
