import Product from '../models/Products.js';


export async function getProducts(req, res) {
  try {
    const productlsit = await Product.find({});
    res.json({ products: productlsit });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export function createProduct(req, res) {
  //How to check Autherization header for token and decode it to get user info
  console.log(req.user);
  if (!req.user) { //Authentication check
    return res.status(403).json({ error: 'You are not logged in' });
  }
  if (req.user.isBlocked) {
    return res.status(403).json({ error: 'You are blocked' });
  }
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'You are not an admin' });
  }


  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
  });

  product
    .save()
    .then((saved) => {
      console.log('Product saved:', saved);
      res.status(201).json({ message: 'Product created', product: saved });
    })
    .catch((error) => {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    });
}

export async function getproductByname(req, res) {
  const name = req.params.name;

  try {
    const product = await Product.findOne({ name });
    if (!product || product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    console.error('Error fetching product by name:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

export function deleteProduct(req, res) {
  const name = req.params.name;

  Product.findOneAndDelete({ name })
    .then((deletedProduct) => {
      if (!deletedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      console.log('Product deleted with name:', name);
      res.json({ message: 'Product deleted successfully' });
    })
    .catch((error) => {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    });
}