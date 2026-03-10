import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderID: {
        type: String,
        required: true,
        unique: true,
    },

    email: {
        type: String,
        required: true,
    },
    orderedItems:[
        {
            ProductName: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true,
            },
            Quantity: {
                type: Number,
                required: true,
            },
            image: {
                type: String,
            }
        }
    ],
    nameOfTheClient: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
    },

    orderDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    notes: {
        type: String,
    }
    
}); 

export default mongoose.model('Order', orderSchema);