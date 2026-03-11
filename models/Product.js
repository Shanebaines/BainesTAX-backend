import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    productID: {
        type: String,
        required: true,
        unique: true,}
    ,
    productName: {
        type: String,
        required: true,
    },
    altNames: {
        type: [String],
    },

    images : {
        type: [String],
    },
    
    price: {
        type: Number,
        required: true,
    },

    lastPrice: {
        type: Number,
    },  
    description: {
        type: String,
    },

    category: {
        type: String,
    },
    stock: {
        type: Number,
        default: 0,
    }
});

const Product = mongoose.model('Product', productSchema);

export default Product;