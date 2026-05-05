import express from 'express';
import { getProducts, getProductById, createProduct, deleteProduct, updateProduct } from '../Controllers/productControllers.js';


const productRouter = express.Router();

productRouter.get('/', (req, res) => {
    getProducts(req, res);
});

productRouter.get('/:productID', (req, res) => {
    getProductById(req, res);
});

productRouter.post('/', (req, res) => {
    createProduct(req, res);
});

productRouter.put('/:productID', (req, res) => {
    updateProduct(req, res);
});

productRouter.delete('/:productID', (req, res) => {
    deleteProduct(req, res);
});

export default productRouter;


