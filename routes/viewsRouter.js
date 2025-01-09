const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('home');
});


router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: [] });
});

module.exports = router;
