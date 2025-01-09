const express = require('express');
const { create } = require('express-handlebars');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs').promises;
const productsRouter = require('./routes/products');

const app = express();
const PORT = 8080;

const hbs = create({
    extname: '.handlebars',
    defaultLayout: 'main',
});

app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/products', productsRouter); 

app.get('/', async (req, res) => {
    try {
        const productos = await loadProductos();
        res.render('home', { products: productos });
    } catch (err) {
        console.error('Error al cargar productos:', err);
        res.status(500).send('Error al cargar productos');
    }
});

app.get('/realtimeproducts', async (req, res) => {
    try {
        const productos = await loadProductos();
        res.render('realTimeProducts', { products: productos });
    } catch (err) {
        console.error('Error al cargar productos:', err);
        res.status(500).send('Error al cargar productos');
    }
});

const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const io = new Server(server);

const loadProductos = async () => {
    try {
        const data = await fs.readFile('./data/productos.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error al cargar los productos:', err);
        return [];
    }
};

io.on('connection', (socket) => {
    console.log('Usuario conectado');

    loadProductos().then((productos) => {
        socket.emit('updateProducts', productos);
    });

    socket.on('addProduct', async (newProduct) => {
        try {
            const productos = await loadProductos();
            const newId = (productos.length > 0) ? Math.max(...productos.map(p => p.id)) + 1 : 1;
            const productToAdd = { id: newId, ...newProduct };
            productos.push(productToAdd);

            await fs.writeFile('./data/productos.json', JSON.stringify(productos, null, 2));

            io.emit('updateProducts', productos);
        } catch (err) {
            console.error('Error al agregar producto:', err);
        }
    });

    socket.on('deleteProduct', async (id) => {
        try {
            const productos = await loadProductos();
            const filteredProducts = productos.filter(p => p.id !== id);

            await fs.writeFile('./data/productos.json', JSON.stringify(filteredProducts, null, 2));

            io.emit('updateProducts', filteredProducts);
        } catch (err) {
            console.error('Error al eliminar producto:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});
