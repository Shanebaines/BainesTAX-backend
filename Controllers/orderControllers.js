import Order from '../models/Order.js';
import Product from '../models/Product.js';

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

        if (!Array.isArray(newOrderData.orderedItems) || newOrderData.orderedItems.length === 0) {
            return res.status(400).json({ error: 'orderedItems is required and cannot be empty' });
        }

        const availableItems = [];
        const unavailableItems = [];

        for (const item of newOrderData.orderedItems) {
            const productId = item.ProductId || item.productId || item.productID;
            const quantity = Number(item.Quantity);

            if (!productId) {
                unavailableItems.push({
                    ProductId: null,
                    Quantity: item.Quantity,
                    reason: 'ProductId is required',
                });
                continue;
            }

            if (!Number.isInteger(quantity) || quantity <= 0) {
                unavailableItems.push({
                    ProductId: productId,
                    Quantity: item.Quantity,
                    reason: 'Invalid quantity',
                });
                continue;
            }

            const product = await Product.findOne({ productID: productId });
            if (!product) {
                unavailableItems.push({
                    ProductId: productId,
                    Quantity: quantity,
                    reason: 'Product not found',
                });
                continue;
            }

            if (product.stock < quantity) {
                unavailableItems.push({
                    ProductId: productId,
                    Quantity: quantity,
                    availableStock: product.stock,
                    reason: 'Insufficient stock',
                });
                continue;
            }

            availableItems.push({
                productId,
                quantity,
                orderItem: {
                    ProductName: product.productName,
                    price: product.price,
                    Quantity: quantity,
                    image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
                },
            });
        }

        if (availableItems.length === 0) {
            return res.status(400).json({
                message: 'No available products to place this order',
                unavailableItems,
            });
        }

        const stockUpdatedItems = [];
        for (const item of availableItems) {
            const updatedProduct = await Product.findOneAndUpdate(
                { productID: item.productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );

            if (!updatedProduct) {
                unavailableItems.push({
                    ProductId: item.productId,
                    Quantity: item.quantity,
                    reason: 'Insufficient stock during update',
                });
            } else {
                stockUpdatedItems.push(item);
            }
        }

        const finalOrderItems = [];
        for (const item of stockUpdatedItems) {
            finalOrderItems.push(item.orderItem);
        }

        if (finalOrderItems.length === 0) {
            return res.status(400).json({
                message: 'No available products to place this order',
                unavailableItems,
            });
        }

        newOrderData.orderedItems = finalOrderItems;

        newOrderData.orderID = orderId;
        newOrderData.email = req.user.email;

        const order = new Order(newOrderData);
        const savedOrder = await order.save();

        return res.status(201).json({
            message: unavailableItems.length > 0
                ? 'Order created with available products only'
                : 'Order created successfully',
            order: savedOrder,
            availableItems: savedOrder.orderedItems,
            unavailableItems,
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
