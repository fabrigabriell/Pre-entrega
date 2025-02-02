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

        const sortOption = sort === 'desc' ? -1 : 1;

        const products = await Product.find(filters)
            .limit(Number(limit))
            .skip((page - 1) * limit)
            .sort({ price: sortOption });

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
        res.status(500).send('Error al obtener productos');
    }
});

module.exports = router;