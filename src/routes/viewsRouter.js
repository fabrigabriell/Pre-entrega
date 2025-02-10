const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Cart = require('../models/cart');

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const validLimit = Math.max(1, parseInt(limit));
        const validPage = Math.max(1, parseInt(page));

        const filter = {};
        if (query) {
            filter.$or = [
                { category: { $regex: query, $options: 'i' } },
                { title: { $regex: query, $options: 'i' } }
            ];
        }

        const options = {
            page: validPage,
            limit: validLimit,
            sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {}
        };

        const result = await Product.paginate(filter, options);

        res.render('home', {
            products: result.docs,
            prevPage: result.hasPrevPage ? result.prevPage : null,
            nextPage: result.hasNextPage ? result.nextPage : null,
            currentPage: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${validLimit}&sort=${sort}&query=${query}` : null,
            nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${validLimit}&sort=${sort}&query=${query}` : null,
            limit: validLimit,
            sort,
            query
        });
    } catch (err) {
        console.error('Error al cargar productos:', err);
        res.status(500).render('error', { message: 'Error interno del servidor' });
    }
});

router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const validLimit = Math.max(1, parseInt(limit));
        const validPage = Math.max(1, parseInt(page));

        const filter = {};
        if (query) {
            filter.$or = [
                { category: { $regex: query, $options: 'i' } },
                { title: { $regex: query, $options: 'i' } }
            ];
        }

        const options = {
            page: validPage,
            limit: validLimit,
            sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {}
        };

        const result = await Product.paginate(filter, options);

        res.render('home', {
            products: result.docs,
            prevPage: result.hasPrevPage ? result.prevPage : null,
            nextPage: result.hasNextPage ? result.nextPage : null,
            currentPage: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${validLimit}&sort=${sort}&query=${query}` : null,
            nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${validLimit}&sort=${sort}&query=${query}` : null,
            limit: validLimit,
            sort,
            query
        });
    } catch (err) {
        console.error('Error al cargar productos:', err);
        res.status(500).render('error', { message: 'Error al cargar los productos' });
    }
});

router.get('/realTimeProducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('realTimeProducts', { products });
    } catch (err) {
        res.status(500).render('error', { message: 'Error al cargar productos en tiempo real' });
    }
});

router.get('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (!product) {
            return res.status(404).render('error', { message: 'Producto no encontrado' });
        }
        res.render('productDetail', { product });
    } catch (err) {
        res.status(500).render('error', { message: 'Error al cargar el producto' });
    }
});

router.get('/carts', (req, res) => {
    res.redirect(`/carts/67aa7322af9ae8ec6203fed4`);
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');
        if (!cart) {
            return res.status(404).render('error', { message: 'Carrito no encontrado' });
        }

        cart.products.forEach(item => {
            item.productTotal = item.product.price * item.quantity;
        });

        const totalPrice = cart.products.reduce((total, item) => total + item.productTotal, 0);

        res.render('cartDetails', { 
            cart,
            totalPrice,
            hasProducts: cart.products.length > 0 
        });
    } catch (err) {
        console.error('Error al obtener carrito:', err);
        res.status(500).render('error', { message: 'Error al cargar el carrito' });
    }
});

router.post('/carts/:cid/products/:pid', async (req, res) => {
  try {
      const { cid, pid } = req.params;
      const { quantity = 1 } = req.body;

      const cart = await Cart.findById(cid);
      if (!cart) {
          return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
      }

      const product = await Product.findById(pid);
      if (!product) {
          return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
      }

      const existingProductIndex = cart.products.findIndex(
          item => item.product.toString() === pid
      );

      if (existingProductIndex !== -1) {
          cart.products[existingProductIndex].quantity += parseInt(quantity);
      } else {
          cart.products.push({
              product: pid,
              quantity: parseInt(quantity)
          });
      }

      await cart.save();
      res.json({ status: 'success', message: 'Producto agregado al carrito', cart });
  } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ status: 'error', message: 'Error al agregar el producto al carrito' });
  }
});

module.exports = router;