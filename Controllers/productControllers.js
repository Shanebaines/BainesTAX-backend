import Product from "../models/Product.js";

const SUPABASE_PUBLIC_HOST = 'siwcehebetoocvtpcbqf.supabase.co';

function isValidProductImageUrl(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return false;
    }

    try {
        const parsed = new URL(value);
        const isSupabaseHost = parsed.hostname === SUPABASE_PUBLIC_HOST;
        const isStoragePath = parsed.pathname.includes('/storage/v1/object/public/images/');
        const lowerPath = parsed.pathname.toLowerCase();
        const hasAllowedExt = lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg') || lowerPath.endsWith('.png');
        return isSupabaseHost && isStoragePath && hasAllowedExt;
    } catch {
        return false;
    }
}

function sanitizeImages(images) {
    if (!Array.isArray(images)) {
        return [];
    }

    const filtered = images.filter((item, index, list) => {
        const valid = isValidProductImageUrl(item);
        const firstIndex = list.indexOf(item);
        return valid && firstIndex === index;
    });

    return filtered;
}

export function createProduct(req, res) {
    if (req.user.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied, only Admins can add products' });
    }
    const newProductData = req.body;
    const sanitizedImages = sanitizeImages(newProductData.images);

    if (sanitizedImages.length === 0) {
        return res.status(400).json({ error: 'At least one valid Supabase image URL (.jpg/.png) is required.' });
    }

    newProductData.images = sanitizedImages;

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

    if (Object.prototype.hasOwnProperty.call(updateData, 'images')) {
        const sanitizedImages = sanitizeImages(updateData.images);
        if (sanitizedImages.length === 0) {
            return res.status(400).json({ error: 'images must contain valid Supabase JPG/PNG public URLs.' });
        }
        updateData.images = sanitizedImages;
    }
    
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

export async function getProductById(req, res)
{
    const productID = req.params.productID;
    Product.findOne({ productID: productID }).then((product) => {
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    });
}
