const express = require('express');
const Product = require('../../models/product');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = 'asc', category } = req.query;

        const filters = {};
        if (category && category.trim() !== '') {
            filters.category = { $regex: new RegExp(category, 'i') };
        }

        console.log('Filtros aplicados:', filters);

        const sortOption = sort === 'desc' ? { price: -1 } : { price: 1 };

        const products = await Product.find(filters)
            .limit(Number(limit))
            .skip((page - 1) * limit)
            .sort(sortOption);

        const totalProducts = await Product.countDocuments(filters);
        const totalPages = Math.ceil(totalProducts / limit);
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;

        res.status(200).json({
            status: 'success',
            payload: products,
            totalPages,
            prevPage: hasPrevPage ? page - 1 : null,
            nextPage: hasNextPage ? page + 1 : null,
            page,
            hasPrevPage,
            hasNextPage,
        });
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ status: 'error', message: 'Error al obtener productos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ status: 'error', message: 'Todos los campos son requeridos' });
        }

        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (err) {
        console.error('Error al crear producto:', err);
        res.status(500).json({ status: 'error', message: 'Error al crear producto' });
    }
});
module.exports = router;