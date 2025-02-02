const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Product = require('./src/models/product');

const loadProducts = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mi-tienda');
        console.log("✅ Conectado a MongoDB");

        const filePath = path.join(__dirname, 'src', 'data', 'productos.json');
        const data = await fs.readFile(filePath, 'utf-8');
        const products = JSON.parse(data);

        await Product.deleteMany({});
        console.log("🗑 Productos eliminados antes de la importación");

        await Product.insertMany(products);
        console.log("✅ Productos importados correctamente");

    } catch (err) {
        console.error("❌ Error al importar productos:", err);
    } finally {
        mongoose.connection.close();
        console.log("🔌 Conexión cerrada");
    }
};

loadProducts();
