const express = require('express');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const newCart = new Cart({ products: [], total: 0 });
        await newCart.save();
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

router.post('/:cid/products/:pid', async (req, res) => {
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

        const productTotal = product.price * quantity;

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += parseInt(quantity);
            cart.products[existingProductIndex].productTotal = product.price * cart.products[existingProductIndex].quantity;
        } else {
            cart.products.push({
                product: pid,
                quantity: parseInt(quantity),
                productTotal: productTotal
            });
        }

        cart.total = cart.products.reduce((acc, item) => acc + item.productTotal, 0);

        await cart.save();
        res.json({ status: 'success', message: 'Producto agregado al carrito', cart });
    } catch (err) {
        console.error('Error al agregar el producto al carrito:', err);
        res.status(500).json({ status: 'error', message: 'Error al agregar el producto al carrito' });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const quantity = parseInt(req.body.quantity);

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ status: 'error', message: 'Cantidad inválida' });
        }

        const cart = await Cart.findById(cid);
        const product = await Product.findById(pid);

        if (!cart || !product) {
            return res.status(404).json({ status: 'error', message: 'Carrito o producto no encontrado' });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
        const productTotal = quantity * product.price;

        if (productIndex >= 0) {
            cart.products[productIndex].quantity = quantity;
            cart.products[productIndex].productTotal = productTotal;
        } else {
            cart.products.push({
                product: pid,
                quantity,
                productTotal
            });
        }

        cart.total = cart.products.reduce((acc, item) => acc + item.productTotal, 0);

        await cart.save();
        res.json({ status: 'success', payload: cart });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await Cart.findById(cid);
        
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
        
        if (productIndex === -1) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
        }

        cart.products[productIndex].quantity -= 1;

        if (cart.products[productIndex].quantity <= 0) {
            cart.products.splice(productIndex, 1);
        }

        cart.total = cart.products.reduce((acc, item) => acc + item.productTotal, 0);

        await cart.save();
        
        res.json({ status: 'success', payload: cart });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        cart.products = [];
        cart.total = 0;
        await cart.save();
        
        res.json({ status: 'success', payload: cart });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

module.exports = router;