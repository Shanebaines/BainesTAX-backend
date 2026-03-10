import express from 'express';
import { getProducts, createProduct,deleteProduct } from '../Controllers/productControllers.js';


const productRouter = express.Router();

productRouter.get('/', (req, res) => {
    getProducts(req, res);
});

productRouter.post('/', (req, res) => {
    createProduct(req, res);
}
);

productRouter.delete('/:productID', (req, res) => {
    deleteProduct(req, res);
}
);

export default productRouter;


