const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    productTotal: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
    products: [productSchema],
    total: { type: Number, default: 0 }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;