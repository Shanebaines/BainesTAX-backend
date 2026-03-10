import Product from "../models/Product.js";

export function createProduct(req, res) {
    if (req.user.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied, only Admins van add products' });
    }
    const newProductData = req.body;
    const product = new Product(newProductData);
    product.save().then((savedProduct) => {
        res.status(201).json(savedProduct);
    }
    ).catch((err) => {
        res.status(400).json({ error: err.message });
    }       
    );
}

export async function deleteProduct(req, res) {
    if (req.user.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied, only Admins van delete products' });
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
