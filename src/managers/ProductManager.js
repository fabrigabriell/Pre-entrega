const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor() {
        this.filePath = path.join(__dirname, '../data/productos.json');
    }

    async getAll() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Error al leer los productos:', err);
            return [];
        }
    }

    async getById(id) {
        const products = await this.getAll();
        return products.find(p => p.id === id);
    }

    async create(product) {
        const products = await this.getAll();
        const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = { id: newId, ...product };
        products.push(newProduct);
        await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
        return newProduct;
    }

    async deleteById(id) {
        let products = await this.getAll();
        products = products.filter(p => p.id !== id);
        await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
    }
}

module.exports = ProductManager;
