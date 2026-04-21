import Product from "../models/Product.js";

export function createProduct(req, res) {
    if (req.user.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied, only Admins can add products' });
    }
    const newProductData = req.body;
    const product = new Product(newProductData);
    product.save().then((savedProduct) => {
        res.status(201).json({ message: 'Product added successfully', product: savedProduct });
    }
    ).catch((err) => {
        res.status(400).json({ error: err.message });
    }       
    );
}

export async function updateProduct(req, res) {
    if (req.user.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied, only Admins can update products' });
    }
    const productID = req.params.productID;
    const updateData = req.body;
    
    Product.findOneAndUpdate(
        { productID: productID },
        updateData,
        { new: true, runValidators: true }
    ).then((updatedProduct) => {
        if (updatedProduct) {
            res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err.message });
    });
}

export async function deleteProduct(req, res) {
    if (req.user.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied, only Admins can delete products' });
    }
    const productID = req.params.productID;
    Product.findOneAndDelete({ productID: productID }).then((deletedProduct) => {
        if (deletedProduct) {
            res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    });
}

export async function getProducts(req, res) 
{
    Product.find().then((products) => {
        res.status(200).json(products);
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    });
}
