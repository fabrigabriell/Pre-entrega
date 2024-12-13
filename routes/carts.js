const express = require('express');
const fs = require('fs').promises;
const router = express.Router();

const filePath = './data/carrito.json';


const readCartsFromFile = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeCartsToFile = async (carts) => {
  await fs.writeFile(filePath, JSON.stringify(carts, null, 2));
};

router.post('/', async (req, res) => {
  try {
    const carts = await readCartsFromFile();

    const newCart = {
      id: `${Date.now()}`,
      products: []
    };

    carts.push(newCart);

    await writeCartsToFile(carts);

    res.status(201).json(newCart);
  } catch (err) {
    res.status(500).send('Error al crear el carrito');
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const carts = await readCartsFromFile();
    const cart = carts.find(c => c.id === req.params.cid);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.json(cart.products);
  } catch (err) {
    res.status(500).send('Error al obtener el carrito');
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const carts = await readCartsFromFile();
    const cart = carts.find(c => c.id === req.params.cid);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const product = { product: req.params.pid, quantity: 1 };
    const existingProduct = cart.products.find(p => p.product === req.params.pid);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push(product);
    }

    await writeCartsToFile(carts);

    res.status(201).json(cart.products);
  } catch (err) {
    res.status(500).send('Error al agregar el producto al carrito');
  }
});

module.exports = router;
