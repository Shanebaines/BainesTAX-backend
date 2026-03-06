import express from 'express';
import Product from '../models/Products.js';
import { getProducts, createProduct, getproductByname, deleteProduct } from '../Controllers/productControllers.js';

const productRouter = express.Router();

productRouter.get('/', getProducts);

productRouter.get('/:name', getproductByname);

productRouter.post('/', createProduct);

productRouter.delete('/:name', deleteProduct);

export default productRouter;