const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = './data/productos.json';

router.get('/', async (req, res) => {
  const { limit } = req.query;
  try {
    const data = await fs.readFile(path, 'utf8');
    let products = JSON.parse(data);
    if (limit) {
      products = products.slice(0, parseInt(limit));
    }
    res.json(products);
  } catch (err) {
    res.status(500).send('Error al leer los productos');
  }
});

router.get('/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const data = await fs.readFile(path, 'utf8');
    const products = JSON.parse(data);
    const product = products.find(p => p.id === parseInt(pid));
    if (!product) return res.status(404).send('Producto no encontrado');
    res.json(product);
  } catch (err) {
    res.status(500).send('Error al leer los productos');
  }
});

router.post('/', async (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;

  if (!title || !description || !code || !price || !status || !stock || !category) {
    return res.status(400).send('Todos los campos son obligatorios');
  }


  let priceAsNumber = parseFloat(price);
  if (isNaN(priceAsNumber)) {
    return res.status(400).send('El precio debe ser un número válido');
  }

  try {
    const data = await fs.readFile(path, 'utf8');
    const products = JSON.parse(data);
    const newId = (products.length > 0) ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = { 
        id: newId, 
        title, 
        description, 
        code, 
        price: priceAsNumber,
        status: status || true, 
        stock, 
        category,
        thumbnails: thumbnails || []
      };
    
    products.push(newProduct);

    products.forEach(product => {
      product.price = parseFloat(product.price);
    });

    await fs.writeFile(path, JSON.stringify(products, null, 2));

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).send('Error al guardar el producto');
  }
});

router.delete('/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const data = await fs.readFile(path, 'utf8');
    let products = JSON.parse(data);
    products = products.filter(p => p.id !== parseInt(pid));
    await fs.writeFile(path, JSON.stringify(products, null, 2));
    res.status(204).send();
  } catch (err) {
    res.status(500).send('Error al eliminar el producto');
  }
});

module.exports = router;
