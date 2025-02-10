const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/product');
const productsRouter = require('./routes/api/products');
const cartsRouter = require('./routes/api/carts');
const viewsRouter = require('./routes/viewsRouter');
const { create } = require('express-handlebars');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const PORT = 8080;

const hbs = create({
    extname: '.handlebars',
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
});

app.engine('handlebars', hbs.engine);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.static('public'));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

app.get('/realTimeProducts', async (req, res) => {
    const cartId = '679fb1fa998bc15031195468';
    const products = await Product.find();
    res.render('realTimeProducts', { products, cartId });
});

app.get('/api/products', async (req, res) => {
    const { category, order } = req.query;
    let query = {};

    if (category && category !== '') {
        query.category = { '$regex': category, '$options': 'i' };
    }

    try {
        let sortOption = {};
        if (order === 'asc') {
            sortOption = { price: 1 };
        } else if (order === 'desc') {
            sortOption = { price: -1 };
        }

        let products = await Product.find(query).sort(sortOption);
        
        res.json({
            status: 'success',
            payload: products,
            totalPages: 1,
            prevPage: null,
            nextPage: null
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener productos',
            payload: []
        });
    }
});

mongoose.connect('mongodb+srv://Fabrigabriell:Fabri22002372@fabrigabriell.yc2nn.mongodb.net/?retryWrites=true&w=majority&appName=Fabrigabriell', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado a la base de datos');
}).catch((err) => {
    console.error('Error de conexión:', err);
});

const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const io = new Server(server);

const loadProductos = async () => {
    try {
        const productos = await Product.find();
        return productos;
    } catch (err) {
        console.error('Error al cargar los productos:', err);
        return [];
    }
};

io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('addProduct', async (newProduct) => {
        try {
            const productToAdd = new Product(newProduct);
            await productToAdd.save();
            const productos = await loadProductos();
            io.emit('updateProducts', productos);
        } catch (err) {
            console.error('Error al agregar producto:', err);
        }
    });

    socket.on('deleteProduct', async (id) => {
        try {
            await Product.findByIdAndDelete(id);
            const productos = await loadProductos();
            io.emit('updateProducts', productos);
        } catch (err) {
            console.error('Error al eliminar producto:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});