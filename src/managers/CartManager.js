const fs = require('fs').promises;
const path = './src/data/carrito.json';

class CartManager {
    async getCarts() {
        const data = await fs.readFile(path, 'utf-8');
        return JSON.parse(data);
    }
}
module.exports = CartManager;
